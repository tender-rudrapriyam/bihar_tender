const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { PrismaClient } = require('../../backend/node_modules/@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

class BiharTenderScraper {
  constructor() {
    this.baseUrl = 'https://eproc2.bihar.gov.in/EPSV2Web/openarea/tenderListingPage.action';
  }

  async scrape() {
    console.log('🚀 Starting Bihar tender scraper...');
    const startTime = Date.now();
    let browser;

    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      console.log(`📡 Navigating to ${this.baseUrl}`);
      
      await page.goto(this.baseUrl, { 
        waitUntil: 'networkidle2',
        timeout: 60000 
      });

      // Wait for tender table
      await page.waitForSelector('#latestTenders', { timeout: 30000 });
      
      // Click latest tenders tab
      await page.evaluate(() => {
        const tab = document.querySelector('a[href="#latestTenders"]');
        if (tab) tab.click();
      });
      
      await page.waitForTimeout(3000);

      const content = await page.content();
      const $ = cheerio.load(content);
      const rows = $('#latestTenders table tbody tr');
      
      console.log(`📊 Found ${rows.length} tender rows`);

      let tendersNew = 0;
      let tendersUpdated = 0;

      for (let i = 0; i < rows.length; i++) {
        try {
          const cells = rows.eq(i).find('td');
          if (cells.length < 5) continue;

          const detailUrl = this.extractDetailUrl(rows.eq(i));

          const tenderData = {
            tenderNumber: cells.eq(1).text().trim(),
            title: cells.eq(2).text().trim(),
            department: cells.eq(3).text().trim(),
            publishDate: this.parseDate(cells.eq(4).text().trim()),
            bidSubmissionDate: this.parseDate(cells.eq(5).text().trim()),
            tenderValue: this.parseValue(cells.eq(7).text().trim()),
            status: 'ACTIVE',
            sourceUrl: this.baseUrl,
            scrapedAt: new Date()
          };

          const existing = await prisma.tender.findUnique({
            where: { tenderNumber: tenderData.tenderNumber }
          });

          let tenderRecord;

          if (existing) {
            tenderRecord = await prisma.tender.update({
              where: { tenderNumber: tenderData.tenderNumber },
              data: tenderData
            });
            tendersUpdated++;
          } else {
            tenderRecord = await prisma.tender.create({ data: tenderData });
            tendersNew++;
            console.log(`✅ New tender: ${tenderData.tenderNumber}`);
          }

          if (detailUrl && tenderRecord) {
            try {
              const detailData = await this.fetchTenderDetails(browser, detailUrl);
              if (detailData) {
                await prisma.tenderDetail.upsert({
                  where: { tenderId: tenderRecord.id },
                  update: {
                    data: detailData,
                    sourceUrl: detailUrl,
                    fetchedAt: new Date()
                  },
                  create: {
                    tenderId: tenderRecord.id,
                    data: detailData,
                    sourceUrl: detailUrl
                  }
                });
              }
            } catch (detailError) {
              console.error(`⚠️ Detail scrape failed for ${tenderData.tenderNumber}:`, detailError.message);
            }
          }
        } catch (error) {
          console.error(`❌ Error processing row ${i}:`, error.message);
        }
      }

      const duration = Math.floor((Date.now() - startTime) / 1000);

      await prisma.scraperLog.create({
        data: {
          status: 'SUCCESS',
          tendersFound: rows.length,
          tendersNew,
          tendersUpdated,
          endTime: new Date()
        }
      });

      console.log(`\n✅ Scraping completed in ${duration}s`);
      console.log(`   New: ${tendersNew} | Updated: ${tendersUpdated}`);

      // Send email if new tenders found
      if (tendersNew > 0) {
        const emailService = require('../../backend/src/services/email');
        await emailService.sendDailyDigest();
        console.log('📧 Email sent successfully');
      }

    } catch (error) {
      console.error('❌ Scraping failed:', error);
      
      await prisma.scraperLog.create({
        data: {
          status: 'FAILED',
          errors: error.message,
          endTime: new Date()
        }
      });
      
      throw error;
    } finally {
      if (browser) await browser.close();
      await prisma.$disconnect();
    }
  }

  parseDate(dateStr) {
    if (!dateStr || dateStr === '-') return null;
    try {
      const datePart = dateStr.split(' ')[0].trim();
      const parts = datePart.split(/[-/]/).map((p) => p.trim());
      if (parts.length === 3 && parts.every(Boolean)) {
        let day;
        let month;
        let year;

        if (parts[0].length === 4) {
          year = Number(parts[0]);
          month = Number(parts[1]);
          day = Number(parts[2]);
        } else {
          day = Number(parts[0]);
          month = Number(parts[1]);
          year = Number(parts[2]);
        }

        const parsed = new Date(year, month - 1, day);
        if (Number.isNaN(parsed.getTime())) return null;
        return parsed;
      }
    } catch {}
    return null;
  }

  parseValue(valueStr) {
    if (!valueStr || valueStr === '-') return null;
    try {
      const cleaned = valueStr.replace(/[₹,\s]/g, '');
      return parseFloat(cleaned) || null;
    } catch {}
    return null;
  }

  extractDetailUrl(row) {
    try {
      const anchor = row.find('a[href]');
      let url = anchor.attr('href');

      if (!url) {
        const clickable = row.find('a[onclick],button[onclick]').first();
        const onclick = clickable.attr('onclick');
        if (onclick) {
          const match = onclick.match(/'(.*?)'|"(.*?)"/);
          url = match ? (match[1] || match[2]) : null;
        }
      }

      if (!url) return null;

      if (url.startsWith('javascript:')) {
        const match = url.match(/'(.*?)'|"(.*?)"/);
        url = match ? (match[1] || match[2]) : null;
      }

      if (!url) return null;

      return new URL(url, this.baseUrl).href;
    } catch {
      return null;
    }
  }

  async fetchTenderDetails(browser, detailUrl) {
    const detailPage = await browser.newPage();
    try {
      await detailPage.goto(detailUrl, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });

      await detailPage.waitForTimeout(1500);
      const content = await detailPage.content();
      return this.parseDetailPage(content, detailUrl);
    } finally {
      await detailPage.close();
    }
  }

  parseDetailPage(content, detailUrl) {
    const $ = cheerio.load(content);
    const sections = {};
    const title = $('h1, h2, h3').first().text().trim();

    const getHeading = (table, index) => {
      const heading = $(table)
        .prevAll('h1, h2, h3, h4, .panel-title, .table-title, .portlet-title')
        .first()
        .text()
        .trim();
      return heading || `table_${index + 1}`;
    };

    const normalizeCell = (cell) => {
      const link = cell.find('a[href]').attr('href');
      const text = cell.text().replace(/\s+/g, ' ').trim();
      if (link) {
        return { text, href: new URL(link, detailUrl).href };
      }
      return text;
    };

    $('table').each((index, table) => {
      const heading = getHeading(table, index);
      const $table = $(table);
      const headerCells = $table.find('tr').first().find('th');
      let tableData = null;

      if (headerCells.length >= 2) {
        const headers = headerCells
          .map((_, th) => $(th).text().replace(/\s+/g, ' ').trim())
          .get();

        tableData = $table.find('tr').slice(1).map((_, row) => {
          const cells = $(row).find('td');
          if (!cells.length) return null;
          const rowObj = {};
          headers.forEach((header, idx) => {
            rowObj[header || `col_${idx + 1}`] = normalizeCell(cells.eq(idx));
          });
          return rowObj;
        }).get().filter(Boolean);
      } else {
        const rows = $table.find('tr');
        const kv = {};
        rows.each((_, row) => {
          const cells = $(row).find('td');
          if (cells.length >= 2) {
            const key = $(cells[0]).text().replace(/\s+/g, ' ').trim();
            const value = normalizeCell(cells.eq(1));
            if (key) kv[key] = value;
          }
        });
        if (Object.keys(kv).length > 0) tableData = kv;
      }

      if (tableData) {
        if (!sections[heading]) {
          sections[heading] = tableData;
        } else if (Array.isArray(sections[heading])) {
          sections[heading].push(tableData);
        } else {
          sections[heading] = [sections[heading], tableData];
        }
      }
    });

    return {
      detailUrl,
      title,
      sections,
      scrapedAt: new Date().toISOString()
    };
  }
}

// Run if executed directly
if (require.main === module) {
  (async () => {
    const scraper = new BiharTenderScraper();
    await scraper.scrape();
    process.exit(0);
  })();
}

module.exports = BiharTenderScraper;
