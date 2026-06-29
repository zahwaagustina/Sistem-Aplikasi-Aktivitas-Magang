import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all notifications for logged-in user
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifikasi = await prisma.notifikasi.findMany({
      where: { 
        user_id: userId,
        OR: [
          { expires_at: null },
          { expires_at: { gt: new Date() } }
        ]
      },
      orderBy: { created_at: 'desc' }
    });
    
    // Count unread
    const unreadCount = notifikasi.filter(n => !n.is_read).length;

    res.status(200).json({ data: notifikasi, unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil notifikasi', error: error.message });
  }
};

// Mark a single notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notif = await prisma.notifikasi.updateMany({
      where: { id: parseInt(id), user_id: userId },
      data: { is_read: true }
    });

    res.status(200).json({ message: 'Notifikasi ditandai dibaca' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update notifikasi', error: error.message });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notifikasi.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true }
    });

    res.status(200).json({ message: 'Semua notifikasi ditandai dibaca' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update semua notifikasi', error: error.message });
  }
};
