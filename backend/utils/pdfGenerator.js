import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

/**
 * Generate LoA PDF using pdf-lib and a static template
 * @param {Object} data 
 * @param {String} outputPath 
 */
const generateLoA = async (data, outputPath) => {
  try {
    // Load the template PDF
    const templatePath = path.resolve('LoA.pdf');
    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Embed Helvetica font
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Get the first page of the document
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Coordinate system in pdf-lib:
    // (0, 0) is at the bottom-left of the page.
    // Since the page is usually A4 (595.28 x 841.89 points), Y goes from 0 (bottom) to 842 (top).
    // We will guess the coordinates based on typical A4 letterhead.
    
    const textSize = 11;
    const color = rgb(0, 0, 0);

    const drawText = (text, x, y) => {
      firstPage.drawText(text, {
        x,
        y,
        size: textSize,
        font: helveticaFont,
        color,
      });
    };

    // TWEAK THESE COORDINATES AS NEEDED
    // Y is from bottom to top. 842 is top, 0 is bottom.
    
    // Nomor Surat (Top part)
    // Gambar kotak putih untuk menutupi titik-titik dan tulisan '/PCS/HRD/...' bawaan template
    firstPage.drawRectangle({
      x: 135,
      y: 705,
      width: 250,
      height: 15,
      color: rgb(1, 1, 1),
    });
    drawText(data.nomorSurat || '', 140, 707);

    // Data Kandidat (Middle part)
    drawText(data.nama || '', 160, 574);
    drawText(data.npm || '', 160, 558);
    drawText(data.universitas || '', 160, 542);
    
    // Periode & Penempatan
    drawText(data.periode || '', 160, 482);
    drawText(data.penempatan || '', 160, 466);

    // Tanggal Terbit (Bottom part, above signature)
    // Karena template sudah ada 'Tangerang, ', kita hapus kata 'Tangerang, ' dari variabel
    const tglSaja = (data.tanggalTerbit || '').replace('Tangerang, ', '');
    drawText(tglSaja, 140, 245);

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();

    // Write the modified PDF to the output path
    fs.writeFileSync(outputPath, pdfBytes);
    
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
};

export { generateLoA };
