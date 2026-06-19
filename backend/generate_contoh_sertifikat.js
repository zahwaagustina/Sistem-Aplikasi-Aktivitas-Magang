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
});

doc.pipe(fs.createWriteStream(fullPath));

// Draw Certificate
doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff');

// Add border
doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#4f46e5');

doc.fontSize(40).fillColor('#1e1b4b').text('SERTIFIKAT KELULUSAN MAGANG', 0, 150, { align: 'center' });
doc.fontSize(20).fillColor('#4338ca').text('Diberikan Kepada:', 0, 220, { align: 'center' });
doc.fontSize(35).fillColor('#111827').text('Siti Zahwa Agustina', 0, 260, { align: 'center' });

doc.fontSize(16).fillColor('#4b5563').text('Universitas: Universitas Gadjah Mada', 0, 320, { align: 'center' });
doc.text('Telah menyelesaikan program magang pada divisi Software Engineering', 0, 350, { align: 'center' });

doc.text('Periode: 01 Februari 2026 s.d. 30 Juni 2026', 0, 380, { align: 'center' });

doc.fontSize(14).fillColor('#1f2937').text('Manager HR', 150, 480);
doc.text('Mentor Pembimbing', doc.page.width - 300, 480);

doc.end();
console.log('PDF generated at:', fullPath);
