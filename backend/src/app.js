const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ status: 'unhealthy' });
  }
});

// Get all tenders
app.get('/api/tenders', async (req, res) => {
  try {
    const tenders = await prisma.tender.findMany({
      take: 50,
      orderBy: { scrapedAt: 'desc' }
    });
    res.json(tenders);
  } catch (error) {
    console.error('Failed to fetch tenders:', error);
    res.status(500).json({ error: 'Failed to fetch tenders' });
  }
});

// Get tender detail
app.get('/api/tenders/:id/detail', async (req, res) => {
  try {
    const detail = await prisma.tenderDetail.findUnique({
      where: { tenderId: req.params.id }
    });

    if (!detail) {
      return res.status(404).json({ error: 'Tender detail not found' });
    }

    res.json(detail);
  } catch (error) {
    console.error('Failed to fetch tender detail:', error);
    res.status(500).json({ error: 'Failed to fetch tender detail' });
  }
});

// Send tender email brief
app.post('/api/notifications/brief', async (req, res) => {
  try {
    const { tenderIds, limit = 20, toEmail } = req.body || {};
    const where = Array.isArray(tenderIds) && tenderIds.length > 0
      ? { id: { in: tenderIds } }
      : {};

    const tenders = await prisma.tender.findMany({
      where,
      take: Array.isArray(tenderIds) && tenderIds.length > 0 ? undefined : Number(limit) || 20,
      orderBy: { scrapedAt: 'desc' }
    });

    const emailService = require('./services/email');
    await emailService.sendTenderBrief(tenders, toEmail);

    res.json({
      message: 'Email brief sent',
      count: tenders.length
    });
  } catch (error) {
    console.error('Email brief error:', error);
    res.status(500).json({ error: 'Failed to send email brief' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));

module.exports = app;
