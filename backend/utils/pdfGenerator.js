import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const drawRow = (doc, label, value, labelWidth = 100) => {
  const startY = doc.y;
  doc.text(label, 50, startY);
  doc.text(':', 50 + labelWidth, startY);
  doc.text(value, 50 + labelWidth + 10, startY);
  // doc.y is automatically updated to the next line by the last text call
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
      doc.fontSize(12).font('Times-Roman');
      
      drawRow(doc, 'Nomor', data.nomorSurat, 60);
      drawRow(doc, 'Hal', 'Surat Keterangan Diterima Magang', 60);
      doc.moveDown(2);

      doc.text('Yang bertanda tangan di bawah ini :');
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
      doc.moveDown(2);

      const bodyText = 'Mahasiswa tersebut DITERIMA untuk melaksanakan program magang di PT. Pandu Cipta Solusi. Selama masa magang, mahasiswa yang bersangkutan diharapkan dapat mematuhi seluruh peraturan dan tata tertib yang berlaku di PT. Pandu Cipta Solusi.';
      
      doc.text(bodyText, { align: 'justify' });
      doc.moveDown(2);

      doc.text('Demikian surat penerimaan magang ini dibuat untuk dapat dipergunakan sebagaimana mestinya.');
      doc.moveDown(3);

      // Signature area (Right side)
      const rightX = doc.page.width - 200;
      doc.text(data.tanggalTerbit, rightX, doc.y);
      doc.moveDown(0.5);
      doc.text('Hormat kami,', rightX, doc.y);
      doc.text('PT. Pandu Cipta Solusi', rightX, doc.y);
      doc.moveDown(4);
      doc.text('Nanda Gita Anggini S.M', rightX, doc.y, { underline: true });
      doc.text('HR', rightX, doc.y);

      doc.end();

      stream.on('finish', () => resolve());
      stream.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

export { generateLoA };
