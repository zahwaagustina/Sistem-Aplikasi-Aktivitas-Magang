import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X, Upload, FileText, CheckCircle, Clock, AlertCircle, Calendar, Activity } from 'lucide-react';

const Logbook = () => {
  const [logbooks, setLogbooks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    waktu_mulai: '08:00',
    waktu_selesai: '17:00',
    deskripsi_kegiatan: '',
    hasil_kegiatan: '',
    kendala: ''
  });
  const [lampiran, setLampiran] = useState(null);

  const fetchLogbooks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/magang/logbook`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogbooks(res.data.data);
    } catch (error) {
      console.error('Error fetching logbook:', error);
    }
  };

  useEffect(() => {
    fetchLogbooks();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setLampiran(e.target.files); // bisa multiple
  };

  const handleNumberingFocus = (e) => {
    const { name, value } = e.target;
    if (value.trim() === '') {
      setFormData(prev => ({ ...prev, [name]: '1. ' }));
    }
  };

  const handleNumberingKeyDown = (e) => {
    const { name, value, selectionStart } = e.target;
    if (e.key === 'Enter') {
      e.preventDefault();
      const linesBeforeCursor = value.substring(0, selectionStart).split('\n');
      const lastLine = linesBeforeCursor[linesBeforeCursor.length - 1];
      
      const match = lastLine.match(/^(\d+)\.\s*/);
      if (match) {
        // Jika baris kosong (hanya nomor), Enter dua kali untuk keluar dari penomoran
        if (lastLine.trim() === `${match[1]}.`) {
           const newValue = value.substring(0, selectionStart - lastLine.length) + '\n' + value.substring(selectionStart);
           setFormData(prev => ({ ...prev, [name]: newValue }));
           setTimeout(() => e.target.setSelectionRange(selectionStart - lastLine.length + 1, selectionStart - lastLine.length + 1), 0);
           return;
        }
      
        const nextNum = parseInt(match[1]) + 1;
        const insertText = `\n${nextNum}. `;
        const newValue = value.substring(0, selectionStart) + insertText + value.substring(selectionStart);
        setFormData(prev => ({ ...prev, [name]: newValue }));
        setTimeout(() => {
          const newPos = selectionStart + insertText.length;
          e.target.setSelectionRange(newPos, newPos);
        }, 0);
      } else {
        const insertText = `\n`;
        const newValue = value.substring(0, selectionStart) + insertText + value.substring(selectionStart);
        setFormData(prev => ({ ...prev, [name]: newValue }));
        setTimeout(() => {
          const newPos = selectionStart + insertText.length;
          e.target.setSelectionRange(newPos, newPos);
        }, 0);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const dataSubmit = new FormData();
    Object.keys(formData).forEach(key => dataSubmit.append(key, formData[key]));
    
    if (lampiran) {
      for (let i = 0; i < lampiran.length; i++) {
        dataSubmit.append('lampiran', lampiran[i]);
      }
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/magang/logbook`, dataSubmit, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Logbook berhasil ditambahkan');
      setIsModalOpen(false);
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        waktu_mulai: '08:00',
        waktu_selesai: '17:00',
        deskripsi_kegiatan: '',
        hasil_kegiatan: '',
        kendala: ''
      });
      setLampiran(null);
      fetchLogbooks();
    } catch (error) {
      alert(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan logbook');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'TERKIRIM': return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full flex items-center w-max"><Clock className="w-3 h-3 mr-1"/> Menunggu Review</span>;
      case 'DISETUJUI': return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full flex items-center w-max"><CheckCircle className="w-3 h-3 mr-1"/> Disetujui</span>;
      case 'REVISI': return <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full flex items-center w-max"><AlertCircle className="w-3 h-3 mr-1"/> Revisi</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded-full">{status}</span>;
    }
  };

  const getLogbookStatsPerMonth = () => {
    const stats = {};
    logbooks.forEach(log => {
      const date = new Date(log.tanggal);
      const monthYearKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthYearLabel = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      
      if (!stats[monthYearKey]) {
        stats[monthYearKey] = { label: monthYearLabel, count: 0 };
      }
      stats[monthYearKey].count++;
    });
    
    // Sort descending
    return Object.keys(stats).sort().reverse().map(key => stats[key]);
  };

  const monthStats = getLogbookStatsPerMonth();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Logbook (Aktivitas Harian)</h1>
          <p className="text-gray-500 mt-1">Catat aktivitas magang Anda setiap harinya secara detail.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tambah Logbook
        </button>
      </div>

      {/* Tampilan Statistik Per Bulan */}
      {monthStats.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {monthStats.map((stat, idx) => (
            <div key={idx} className="bg-white border border-gray-100 shadow-sm rounded-xl px-4 py-3 min-w-[140px] flex flex-col justify-center shrink-0">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{stat.label}</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-indigo-600">{stat.count}</span>
                <span className="text-xs text-gray-400 font-medium">terkirim</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 bg-white border-b border-gray-100">
          <h2 className="text-gray-800 font-bold text-lg">Riwayat Aktivitas Anda</h2>
        </div>

        {logbooks.length === 0 ? (
          <div className="p-8 text-center text-gray-500 italic">
            Belum ada logbook yang diisi.
          </div>
        ) : (
          Object.entries(logbooks.reduce((acc, log) => {
            const date = new Date(log.tanggal);
            const monthYear = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
            if (!acc[monthYear]) {
              acc[monthYear] = [];
            }
            acc[monthYear].push(log);
            return acc;
          }, {})).map(([monthYear, logsInMonth]) => (
            <div key={monthYear}>
              {/* Header Bulan */}
              <div className="bg-indigo-50/50 border-b border-indigo-100 px-6 py-4 flex justify-between items-center">
                <span className="text-indigo-900 font-bold text-sm tracking-wide">{monthYear}</span>
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold">
                  {logsInMonth.length} Laporan Terkirim
                </span>
              </div>

              {/* Item Logbook */}
              <div className="flex flex-col">
                {logsInMonth.map((log) => (
                  <div key={log.id} className="p-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-gray-800 font-bold text-base">Laporan Aktivitas</h3>
                      {getStatusBadge(log.status)}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-medium mb-5">
                      <span className="flex items-center"><Activity className="w-4 h-4 mr-1.5"/> {new Date(log.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <span className="flex items-center"><Clock className="w-4 h-4 mr-1.5"/> {log.waktu_mulai} - {log.waktu_selesai}</span>
                      <span className="flex items-center text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100"><CheckCircle className="w-3.5 h-3.5 mr-1.5"/> Disubmit pada {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold text-gray-800 mb-1.5">Deskripsi Kegiatan:</p>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{log.deskripsi_kegiatan}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800 mb-1.5">Hasil:</p>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{log.hasil_kegiatan}</p>
                      </div>
                      
                      <div className="pt-2 flex flex-col gap-3">
                        {log.lampiran && log.lampiran.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-800 mr-2">Lampiran:</span>
                            <div className="flex flex-wrap gap-2">
                              {log.lampiran.map(file => (
                                <a key={file.id} href={`${import.meta.env.VITE_BACKEND_URL}${file.file_path}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg hover:underline hover:bg-indigo-100 transition-colors shadow-sm">
                                  <FileText className="w-3.5 h-3.5 mr-1.5" /> {file.nama_file}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {log.komentar_mentor && (
                          <div className="p-3 bg-red-50 border border-red-100 rounded-lg inline-block w-max mt-1">
                            <p className="text-xs font-bold text-red-800 mb-1">Komentar Mentor:</p>
                            <p className="text-xs text-red-700 italic pr-8">{log.komentar_mentor}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Tambah Logbook */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header (Fixed) */}
            <div className="flex justify-between items-center px-6 py-5 border-b bg-white rounded-t-2xl flex-shrink-0 relative z-10">
              <h2 className="text-xl font-bold text-gray-800">Isi Logbook Harian</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 p-2 rounded-xl -mr-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body (Scrollable) */}
            <div className="overflow-y-auto p-6 flex-grow custom-scrollbar">
              <form id="formLogbook" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal</label>
                    <input type="date" name="tanggal" required value={formData.tanggal} max={new Date().toISOString().split('T')[0]} onChange={handleChange} className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-gray-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Jam Mulai</label>
                    <input type="time" name="waktu_mulai" required value={formData.waktu_mulai} onChange={handleChange} className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-gray-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Jam Selesai</label>
                    <input type="time" name="waktu_selesai" required value={formData.waktu_selesai} onChange={handleChange} className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-gray-800" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Kegiatan</label>
                  <textarea name="deskripsi_kegiatan" required rows="4" value={formData.deskripsi_kegiatan} onChange={handleChange} onFocus={handleNumberingFocus} onKeyDown={handleNumberingKeyDown} placeholder="Contoh:&#10;1. Melakukan riset pasar&#10;2. Membuat laporan keuangan" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-gray-800 resize-none leading-relaxed"></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Hasil Kegiatan</label>
                  <textarea name="hasil_kegiatan" required rows="3" value={formData.hasil_kegiatan} onChange={handleChange} onFocus={handleNumberingFocus} onKeyDown={handleNumberingKeyDown} placeholder="Contoh:&#10;1. Fitur login berhasil dibuat" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-gray-800 resize-none leading-relaxed"></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kendala (Opsional)</label>
                  <textarea name="kendala" rows="2" value={formData.kendala} onChange={handleChange} placeholder="Hambatan yang ditemui saat bekerja" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-gray-800 resize-none"></textarea>
                </div>

                <div className="border border-gray-300 rounded-xl p-4 bg-gray-50 border-dashed">
                  <div className="flex items-center space-x-2 mb-2">
                    <Upload className="w-5 h-5 text-indigo-500" />
                    <label className="text-sm font-semibold text-gray-800">Lampiran Bukti Kerja / Dokumen Pendukung</label>
                  </div>
                  <input type="file" multiple onChange={handleFileChange} className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 mt-2" />
                  <p className="text-xs text-gray-400 mt-2">Bisa mengunggah lebih dari 1 file (Gambar/PDF/Doc)</p>
                </div>
              </form>
            </div>

            {/* Modal Footer (Fixed) */}
            <div className="flex justify-end p-5 border-t bg-gray-50 rounded-b-2xl flex-shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 mr-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition-colors bg-white">
                Batal
              </button>
              <button type="submit" form="formLogbook" disabled={loading} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 flex items-center">
                {loading ? 'Menyimpan...' : 'Kirim Logbook'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Logbook;
