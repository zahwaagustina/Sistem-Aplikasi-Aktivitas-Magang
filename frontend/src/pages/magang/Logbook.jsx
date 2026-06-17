import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X, Upload, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const Logbook = () => {
  const [logbooks, setLogbooks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    waktu_mulai: '',
    waktu_selesai: '',
    deskripsi_kegiatan: '',
    hasil_kegiatan: '',
    kendala: ''
  });
  const [lampiran, setLampiran] = useState(null);

  const fetchLogbooks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/magang/logbook', {
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
      await axios.post('http://localhost:5000/api/magang/logbook', dataSubmit, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Logbook berhasil ditambahkan');
      setIsModalOpen(false);
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        waktu_mulai: '',
        waktu_selesai: '',
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                <th className="p-4 font-semibold">Tanggal & Waktu</th>
                <th className="p-4 font-semibold w-1/3">Aktivitas & Hasil</th>
                <th className="p-4 font-semibold">Lampiran</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {logbooks.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors align-top">
                  <td className="p-4">
                    <p className="font-semibold text-gray-800">{new Date(log.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">{log.waktu_mulai} - {log.waktu_selesai}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-bold text-gray-800 mb-1">Deskripsi:</p>
                    <p className="text-sm text-gray-600 mb-3">{log.deskripsi_kegiatan}</p>
                    <p className="text-sm font-bold text-gray-800 mb-1">Hasil:</p>
                    <p className="text-sm text-gray-600">{log.hasil_kegiatan}</p>
                  </td>
                  <td className="p-4">
                    {log.lampiran && log.lampiran.length > 0 ? (
                      <div className="space-y-2">
                        {log.lampiran.map(file => (
                          <a key={file.id} href={`http://localhost:5000${file.file_path}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-indigo-600 hover:underline">
                            <FileText className="w-4 h-4 mr-1" /> {file.nama_file}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Tidak ada lampiran</span>
                    )}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(log.status)}
                    {log.komentar_mentor && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                        <p className="text-xs font-bold text-red-800 mb-1">Komentar Mentor:</p>
                        <p className="text-xs text-red-700 italic">{log.komentar_mentor}</p>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {logbooks.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500 italic">
                    Belum ada logbook yang diisi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Logbook */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">Isi Logbook Harian</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal</label>
                  <input type="date" name="tanggal" required value={formData.tanggal} onChange={handleChange} className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-gray-800" />
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
                <textarea name="deskripsi_kegiatan" required rows="3" value={formData.deskripsi_kegiatan} onChange={handleChange} placeholder="Ceritakan apa saja yang Anda kerjakan..." className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-gray-800 resize-none"></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hasil Kegiatan</label>
                <textarea name="hasil_kegiatan" required rows="2" value={formData.hasil_kegiatan} onChange={handleChange} placeholder="Output atau pencapaian yang dihasilkan" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-gray-800 resize-none"></textarea>
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

              <div className="flex justify-end pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 mr-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 flex items-center">
                  {loading ? 'Menyimpan...' : 'Kirim Logbook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logbook;
