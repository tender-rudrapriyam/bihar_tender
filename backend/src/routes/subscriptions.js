const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

// Get user subscriptions
router.get('/', auth, async (req, res) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ subscriptions });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create subscription
router.post('/', auth, async (req, res) => {
  try {
    const { keywords, departments, categories, minValue, maxValue } = req.body;

    const subscription = await prisma.subscription.create({
      data: {
        userId: req.user.userId,
        keywords: keywords || [],
        departments: departments || [],
        categories: categories || [],
        minValue: minValue ? parseFloat(minValue) : null,
        maxValue: maxValue ? parseFloat(maxValue) : null
      }
    });

    res.status(201).json({ 
      message: 'Subscription created',
      subscription 
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update subscription
router.put('/:id', auth, async (req, res) => {
  try {
    const { keywords, departments, categories, minValue, maxValue, isActive } = req.body;

    const subscription = await prisma.subscription.updateMany({
      where: {
        id: req.params.id,
        userId: req.user.userId
      },
      data: {
        ...(keywords && { keywords }),
        ...(departments && { departments }),
        ...(categories && { categories }),
        ...(minValue !== undefined && { minValue: minValue ? parseFloat(minValue) : null }),
        ...(maxValue !== undefined && { maxValue: maxValue ? parseFloat(maxValue) : null }),
        ...(isActive !== undefined && { isActive })
      }
    });

    if (subscription.count === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json({ message: 'Subscription updated' });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete subscription
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await prisma.subscription.deleteMany({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json({ message: 'Subscription deleted' });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
