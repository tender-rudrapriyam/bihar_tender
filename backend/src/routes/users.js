const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
        preferences: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/me', auth, async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone })
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true
      }
    });

    res.json({ message: 'Profile updated', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const preferences = await prisma.userPreference.findUnique({
      where: { userId: req.user.userId }
    });

    res.json({ preferences });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const {
      emailNotifications,
      smsNotifications,
      telegramNotifications,
      notificationTime,
      digestFrequency,
      telegramChatId,
      phoneNumber
    } = req.body;

    const preferences = await prisma.userPreference.upsert({
      where: { userId: req.user.userId },
      update: {
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(smsNotifications !== undefined && { smsNotifications }),
        ...(telegramNotifications !== undefined && { telegramNotifications }),
        ...(notificationTime && { notificationTime }),
        ...(digestFrequency && { digestFrequency }),
        ...(telegramChatId && { telegramChatId }),
        ...(phoneNumber && { phoneNumber })
      },
      create: {
        userId: req.user.userId,
        emailNotifications: emailNotifications ?? true,
        smsNotifications: smsNotifications ?? false,
        telegramNotifications: telegramNotifications ?? false,
        digestFrequency: digestFrequency || 'DAILY'
      }
    });

    res.json({ message: 'Preferences updated', preferences });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get saved tenders
router.get('/saved-tenders', auth, async (req, res) => {
  try {
    const savedTenders = await prisma.savedTender.findMany({
      where: { userId: req.user.userId },
      include: { tender: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ savedTenders });
  } catch (error) {
    console.error('Error fetching saved tenders:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
