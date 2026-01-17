const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { PrismaClient } = require('@prisma/client');
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

          if (existing) {
            await prisma.tender.update({
              where: { tenderNumber: tenderData.tenderNumber },
              data: tenderData
            });
            tendersUpdated++;
          } else {
            await prisma.tender.create({ data: tenderData });
            tendersNew++;
            console.log(`✅ New tender: ${tenderData.tenderNumber}`);
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
      const parts = dateStr.split(/[-/]/);
      if (parts.length === 3) {
        return new Date(parts[2], parts[1] - 1, parts[0]);
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
