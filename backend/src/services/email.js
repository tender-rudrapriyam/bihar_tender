const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }

  async sendTenderBrief(tenders) {
    const html = this.generateEmailHTML(tenders);
    
    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM || 'tender.rudrapriyam@gmail.com',
      to: 'tender.rudrapriyam@gmail.com',
      subject: `Bihar Tender Brief - ${new Date().toLocaleDateString()}`,
      html,
      text: this.generatePlainText(tenders)
    });
  }

  generateEmailHTML(tenders) {
    const stats = {
      total: tenders.length,
      highValue: tenders.filter(t => t.tenderValue > 1000000).length,
      departments: [...new Set(tenders.map(t => t.department))].length
    };

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .stats { display: flex; justify-content: space-around; margin: 30px 0; }
    .stat-box { text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px; }
    .stat-number { font-size: 32px; font-weight: bold; color: #667eea; }
    .tender-item { border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
    .tender-title { font-size: 18px; font-weight: bold; color: #2c3e50; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 Bihar Tender Brief</h1>
    <p>${new Date().toLocaleDateString('en-IN')}</p>
  </div>
  
  <div class="stats">
    <div class="stat-box">
      <div class="stat-number">${stats.total}</div>
      <div>Total Tenders</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${stats.highValue}</div>
      <div>High Value</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${stats.departments}</div>
      <div>Departments</div>
    </div>
  </div>

  <h2>📌 Tender Details</h2>
  ${tenders.map(t => `
    <div class="tender-item">
      <div class="tender-title">${t.title}</div>
      <p><strong>ID:</strong> ${t.tenderNumber}</p>
      <p><strong>Department:</strong> ${t.department}</p>
      ${t.tenderValue ? `<p><strong>Value:</strong> ₹${t.tenderValue.toLocaleString('en-IN')}</p>` : ''}
      ${t.bidSubmissionDate ? `<p><strong>Deadline:</strong> ${new Date(t.bidSubmissionDate).toLocaleDateString()}</p>` : ''}
    </div>
  `).join('')}
</body>
</html>
    `;
  }

  generatePlainText(tenders) {
    return `
Bihar Tender Brief - ${new Date().toLocaleDateString()}

Total Tenders: ${tenders.length}

${tenders.map((t, i) => `
${i + 1}. ${t.title}
   ID: ${t.tenderNumber}
   Department: ${t.department}
`).join('\n')}
    `;
  }

  async sendDailyDigest() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const newTenders = await prisma.tender.findMany({
      where: { scrapedAt: { gte: yesterday } },
      orderBy: { scrapedAt: 'desc' }
    });

    if (newTenders.length > 0) {
      await this.sendTenderBrief(newTenders);
      console.log(`Sent daily digest with ${newTenders.length} tenders`);
    }
  }
}

module.exports = new EmailService();
