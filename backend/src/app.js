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
    res.status(500).json({ error: 'Failed to fetch tenders' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));

module.exports = app;
