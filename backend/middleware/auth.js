import prisma from '../utils/prisma.js';
import jwt from 'jsonwebtoken';
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key', async (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    
    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, nama: true, username: true, role: true, email: true }
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
    console.log('AUTHORIZE_ROLE CHECK:', { 
      userRole: req.user?.role, 
      allowedRoles: roles, 
      isArray: Array.isArray(roles) 
    });
    if (!req.user || (Array.isArray(roles) ? !roles.includes(req.user.role) : !roles.includes(req.user.role))) {
      return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
};
