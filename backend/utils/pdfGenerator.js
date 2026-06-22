import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const drawRow = (doc, label, value, labelWidth = 100, isBoldValue = false, isUnderlineValue = false) => {
  const startY = doc.y;
  doc.font('Helvetica').text(label, 60, startY);
  doc.text(':', 60 + labelWidth, startY);
  
  if (isBoldValue) doc.font('Helvetica-Bold');
  else doc.font('Helvetica');
  
  doc.text(value, 60 + labelWidth + 15, startY, { underline: isUnderlineValue });
  doc.font('Helvetica'); // reset
};

/**
 * Generate LoA PDF
 * @param {Object} data 
 * @param {String} outputPath 
 */
const generateLoA = (data, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 60, size: 'A4' });
      const stream = fs.createWriteStream(outputPath);
      
      doc.pipe(stream);

      // Header
      doc.fontSize(11).font('Helvetica');
      
      drawRow(doc, 'Nomor', data.nomorSurat, 80);
      drawRow(doc, 'Hal', 'Surat Keterangan Diterima Magang', 80, true, true);
      doc.moveDown(2.5);

      doc.text('Yang bertanda tangan dibawah ini :');
      doc.moveDown(0.5);
      
      drawRow(doc, 'Nama', 'Nanda Gita Anggini S.M', 80);
      drawRow(doc, 'Jabatan', 'HR', 80);
      drawRow(doc, 'Perusahaan', 'PT. Pandu Cipta Solusi', 80);
      doc.moveDown(2);

      doc.text('Dengan ini menerangkan bahwa :');
      doc.moveDown(0.5);
      
      drawRow(doc, 'Nama', data.nama, 80);
      drawRow(doc, 'NPM/NIM', data.npm || '-', 80);
      drawRow(doc, 'Universitas', data.universitas || '-', 80);
      doc.moveDown(2.5);

      // Rich text paragraph
      doc.font('Helvetica').text('Mahasiswa tersebut ', { continued: true })
         .font('Helvetica-Bold').text('DITERIMA ', { continued: true })
         .font('Helvetica').text('untuk melaksanakan program magang di PT. Pandu Cipta Solusi. Selama masa magang, mahasiswa yang bersangkutan diharapkan dapat mematuhi seluruh peraturan dan tata tertib yang berlaku di PT. Pandu Cipta Solusi.');
      
      doc.moveDown(2);

      doc.text('Demikian surat penerimaan magang ini dibuat untuk dapat dipergunakan sebagaimana mestinya.');
      doc.moveDown(3);

      // Signature area (Right side)
      // We use a fixed X coordinate for the signature block to keep it perfectly aligned on the right
      const sigX = 350; 
      
      doc.text(data.tanggalTerbit, sigX, doc.y, { align: 'right', width: 180 });
      doc.moveDown(1.5);
      doc.text('Hormat kami,', sigX, doc.y, { align: 'right', width: 180 });
      doc.text('PT. Pandu Cipta Solusi', sigX, doc.y, { align: 'right', width: 180 });
      doc.moveDown(4);
      
      doc.font('Helvetica-Bold').text('Nanda Gita Anggini S,M', sigX, doc.y, { align: 'right', width: 180 });
      doc.font('Helvetica').text('(HR)', sigX, doc.y, { align: 'right', width: 180 });

      doc.end();

      stream.on('finish', () => resolve());
      stream.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

export { generateLoA };
