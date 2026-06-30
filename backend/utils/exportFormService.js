import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export const generateExcelKesanggupan = async (responses, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Hasil Form Kesanggupan');

  // Cari semua pertanyaan yang unik dari seluruh responses (berjaga-jaga jika form diubah)
  // Tapi idealnya 1 form aktif, kita ambil list pertanyaan dari form.
  let questionsSet = new Map();
  responses.forEach(r => {
    r.jawaban.forEach(j => {
      if (!questionsSet.has(j.question.id)) {
        questionsSet.set(j.question.id, j.question.pertanyaan);
      }
    });
  });

  const questionIds = Array.from(questionsSet.keys());

  // Columns
  const columns = [
    { header: 'No', key: 'no', width: 5 },
    { header: 'Nama Kandidat', key: 'nama', width: 25 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Posisi/Divisi', key: 'posisi', width: 25 },
    { header: 'Tanggal Pengisian', key: 'tanggal', width: 20 },
    { header: 'Status Form', key: 'status', width: 20 }
  ];

  questionIds.forEach(id => {
    columns.push({
      header: questionsSet.get(id),
      key: `q_${id}`,
      width: 30
    });
  });

  worksheet.columns = columns;

  responses.forEach((r, index) => {
    const rowData = {
      no: index + 1,
      nama: r.user.nama,
      email: r.user.email,
      posisi: `${r.pendaftaran.lowongan.posisi} / ${r.pendaftaran.lowongan.divisi}`,
      tanggal: new Date(r.created_at).toLocaleDateString('id-ID'),
      status: r.status
    };

    r.jawaban.forEach(j => {
      let val = j.jawaban_teks;
      if (j.jawaban_array && Array.isArray(j.jawaban_array)) {
        val = j.jawaban_array.join(', ');
      }
      rowData[`q_${j.question.id}`] = val;
    });

    worksheet.addRow(rowData);
  });

  // Style header
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD9E1F2' }
  };
  
  // Iterate all rows to add borders and align data
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      
      if (rowNumber > 1) {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      }
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=Hasil_Form_Kesanggupan.xlsx');

  await workbook.xlsx.write(res);
  res.end();
};

export const generatePDFKesanggupan = async (responses, res) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=Hasil_Form_Kesanggupan.pdf');

  doc.pipe(res);

  doc.fontSize(16).font('Helvetica-Bold').text('Laporan Hasil Form Kesanggupan', { align: 'center' });
  doc.moveDown(2);

  responses.forEach((r, idx) => {
    doc.fontSize(12).font('Helvetica-Bold').text(`${idx + 1}. ${r.user.nama}`);
    doc.fontSize(10).font('Helvetica').text(`Email: ${r.user.email}`);
    doc.fontSize(10).text(`Posisi: ${r.pendaftaran.lowongan.posisi} / ${r.pendaftaran.lowongan.divisi}`);
    doc.fontSize(10).text(`Tanggal Pengisian: ${new Date(r.created_at).toLocaleDateString('id-ID')}`);
    doc.moveDown(0.5);

    r.jawaban.forEach((j) => {
      doc.fontSize(10).font('Helvetica-Bold').text(`Q: ${j.question.pertanyaan}`);
      
      let val = j.jawaban_teks;
      if (j.jawaban_array && Array.isArray(j.jawaban_array)) {
        val = j.jawaban_array.join(', ');
      }
      doc.fontSize(10).font('Helvetica').text(`A: ${val || '-'}`);
      doc.moveDown(0.5);
    });

    doc.moveDown(1);
    
    // Page break if not last
    if (idx !== responses.length - 1) {
      doc.addPage();
    }
  });

  doc.end();
};
