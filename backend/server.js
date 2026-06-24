import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import aktivitasRoutes from './routes/aktivitasRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import kandidatRoutes from './routes/kandidatRoutes.js';
import magangRoutes from './routes/magangRoutes.js';
import hrRoutes from './routes/hrRoutes.js';
import mentorRoutes from './routes/mentorRoutes.js';
import penyelesaianRoutes from './routes/penyelesaianRoutes.js';
import onboardingRoutes from './routes/onboardingRoutes.js';
import notifikasiRoutes from './routes/notifikasiRoutes.js';
import { auditTrail } from './middleware/auditTrail.js';
import { initAbsensiCron } from './cron/absensiCron.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Inisialisasi Cron Jobs
initAbsensiCron();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(auditTrail);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/aktivitas', aktivitasRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/kandidat', kandidatRoutes);
app.use('/api/magang', magangRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/notifikasi', notifikasiRoutes);
app.use('/api', penyelesaianRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
