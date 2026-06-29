import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Pastikan folder uploads/templates ada
const uploadDir = 'uploads/templates/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'template-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|ppt|pptx|xls|xlsx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  // Mimetype check might be too strict for some office documents, 
  // but we can check it loosely or rely on extname if needed.
  // For safety, we will rely primarily on extname for these office files 
  // since mimetypes can vary across OS and browsers.
  if (extname) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file dokumen (.pdf, .doc, .docx, .ppt, .pptx, .xls, .xlsx) yang diperbolehkan!'));
  }
};

export const uploadTemplate = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB
  fileFilter
});
