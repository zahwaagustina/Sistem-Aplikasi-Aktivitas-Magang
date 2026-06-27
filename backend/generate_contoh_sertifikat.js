import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Artifacts directory for this conversation
const artifactDir = 'C:\\Users\\zahwa\\.gemini\\antigravity-ide\\brain\\bcb999d7-02c5-4209-ba31-57c287deb601\\scratch';
const fullPath = path.join(artifactDir, 'contoh_sertifikat.pdf');

// Buat direktori jika belum ada
if (!fs.existsSync(artifactDir)){
    fs.mkdirSync(artifactDir, { recursive: true });
}

const doc = new PDFDocument({
  layout: 'landscape',
  size: 'A4',
  margin: 0
});

doc.pipe(fs.createWriteStream(fullPath));

const templatePath = path.join(process.cwd(), 'uploads', 'template_sertifikat.png');
if (fs.existsSync(templatePath)) {
  doc.image(templatePath, 0, 0, { width: doc.page.width, height: doc.page.height });
} else {
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff');
}

const nameY = 265;
doc.font('Times-Bold').fontSize(38).fillColor('#1e1b4b').text('SITI ZAHWA AGUSTINA', 0, nameY, { align: 'center', width: doc.page.width });

doc.end();
console.log('PDF generated at:', fullPath);
