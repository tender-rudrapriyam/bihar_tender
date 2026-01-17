const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

// Get analytics overview
router.get('/overview', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const [
      totalTenders,
      activeTenders,
      newTenders,
      departmentStats,
      valueStats
    ] = await Promise.all([
      prisma.tender.count(),
      prisma.tender.count({ where: { status: 'ACTIVE' } }),
      prisma.tender.count({
        where: { scrapedAt: { gte: startDate } }
      }),
      prisma.tender.groupBy({
        by: ['department'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      }),
      prisma.tender.aggregate({
        _avg: { tenderValue: true },
        _sum: { tenderValue: true },
        _max: { tenderValue: true },
        where: { tenderValue: { not: null } }
      })
    ]);

    res.json({
      totalTenders,
      activeTenders,
      newTenders,
      departmentStats,
      valueStats
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get tender trends
router.get('/trends', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const trends = await prisma.$queryRaw`
      SELECT 
        DATE(scraped_at) as date,
        COUNT(*) as count,
        AVG(tender_value) as avg_value
      FROM tenders
      WHERE scraped_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(scraped_at)
      ORDER BY date DESC
    `;

    res.json({ trends });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
