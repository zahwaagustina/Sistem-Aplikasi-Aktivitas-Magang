import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'controllers/aktivitasController.js',
  'controllers/adminController.js',
  'controllers/authController.js',
  'controllers/dynamicFormController.js',
  'controllers/evaluasiMasterController.js',
  'controllers/hrController.js',
  'controllers/kandidatController.js',
  'controllers/magangController.js',
  'controllers/mentorController.js',
  'controllers/notifikasiController.js',
  'controllers/onboardingController.js',
  'controllers/penyelesaianController.js',
  'controllers/publicController.js',
  'controllers/templateController.js',
  'controllers/userController.js',
  'cron/absensiCron.js',
  'cron/notifikasiCron.js',
  'middleware/auditTrail.js',
  'middleware/auth.js'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace import
    content = content.replace(/import\s*{\s*PrismaClient\s*}\s*from\s*['"]@prisma\/client['"];?\s*/g, '');
    
    // Replace instantiation
    content = content.replace(/const\s+prisma\s*=\s*new\s+PrismaClient\(\s*\);?\s*/g, '');
    
    // Add import prisma at the top
    content = `import prisma from '../utils/prisma.js';\n` + content;
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
