const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

// Get all tenders
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      department,
      search 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      isArchived: false,
      ...(status && { status }),
      ...(department && { department }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tenderNumber: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [tenders, total] = await Promise.all([
      prisma.tender.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { scrapedAt: 'desc' },
        include: {
          analytics: true
        }
      }),
      prisma.tender.count({ where })
    ]);

    res.json({
      tenders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching tenders:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single tender
router.get('/:id', async (req, res) => {
  try {
    const tender = await prisma.tender.findUnique({
      where: { id: req.params.id },
      include: {
        analytics: true
      }
    });

    if (!tender) {
      return res.status(404).json({ error: 'Tender not found' });
    }

    // Increment view count
    await prisma.tenderAnalytics.upsert({
      where: { tenderId: tender.id },
      update: { viewCount: { increment: 1 } },
      create: { tenderId: tender.id, viewCount: 1 }
    });

    res.json(tender);
  } catch (error) {
    console.error('Error fetching tender:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search tenders
router.get('/search', async (req, res) => {
  try {
    const { q, minValue, maxValue, fromDate, toDate } = req.query;

    const where = {
      isArchived: false,
      ...(q && {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } }
        ]
      }),
      ...(minValue && { tenderValue: { gte: parseFloat(minValue) } }),
      ...(maxValue && { tenderValue: { lte: parseFloat(maxValue) } }),
      ...(fromDate && { publishDate: { gte: new Date(fromDate) } }),
      ...(toDate && { publishDate: { lte: new Date(toDate) } })
    };

    const tenders = await prisma.tender.findMany({
      where,
      orderBy: { scrapedAt: 'desc' },
      take: 50
    });

    res.json({ tenders, count: tenders.length });
  } catch (error) {
    console.error('Error searching tenders:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get tender statistics
router.get('/stats', async (req, res) => {
  try {
    const [total, active, highValue, departments] = await Promise.all([
      prisma.tender.count({ where: { isArchived: false } }),
      prisma.tender.count({ where: { status: 'ACTIVE', isArchived: false } }),
      prisma.tender.count({ 
        where: { 
          tenderValue: { gte: 1000000 },
          isArchived: false 
        } 
      }),
      prisma.tender.findMany({
        select: { department: true },
        distinct: ['department']
      })
    ]);

    res.json({
      total,
      active,
      highValue,
      departments: departments.length,
      departmentList: departments.map(d => d.department)
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save tender (requires auth)
router.post('/:id/save', auth, async (req, res) => {
  try {
    const { notes, tags } = req.body;

    const saved = await prisma.savedTender.create({
      data: {
        userId: req.user.userId,
        tenderId: req.params.id,
        notes,
        tags: tags || []
      }
    });

    res.json({ message: 'Tender saved', saved });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Tender already saved' });
    }
    console.error('Error saving tender:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
