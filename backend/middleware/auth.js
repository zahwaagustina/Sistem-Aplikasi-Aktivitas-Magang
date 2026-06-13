import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key', async (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    
    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, nama: true, username: true, role: true, divisi: true, nickname: true, semester: true }
      });
      if (!user) return res.status(404).json({ message: 'User not found' });
      
      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
};

export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
};
