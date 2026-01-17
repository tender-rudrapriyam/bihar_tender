const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const BiharTenderScraper = require('../../../scraper/src/scraper');

const prisma = new PrismaClient();

// Admin middleware (add role check)
const adminAuth = (req, res, next) => {
  // For now, just use auth. Add role check when implemented
  auth(req, res, next);
};

// Trigger scraper manually
router.post('/scrape', adminAuth, async (req, res) => {
  try {
    const scraper = new BiharTenderScraper();
    await scraper.init();
    const result = await scraper.scrape();
    await scraper.close();

    res.json({
      message: 'Scraper completed',
      result
    });
  } catch (error) {
    console.error('Manual scrape error:', error);
    res.status(500).json({ error: 'Scraper failed' });
  }
});

// Get scraper logs
router.get('/logs', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      prisma.scraperLog.findMany({
        skip,
        take: parseInt(limit),
        orderBy: { startTime: 'desc' }
      }),
      prisma.scraperLog.count()
    ]);

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get system stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalTenders,
      totalNotifications,
      lastScraperRun
    ] = await Promise.all([
      prisma.user.count(),
      prisma.tender.count(),
      prisma.notification.count(),
      prisma.scraperLog.findFirst({
        orderBy: { startTime: 'desc' }
      })
    ]);

    res.json({
      totalUsers,
      totalTenders,
      totalNotifications,
      lastScraperRun
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
