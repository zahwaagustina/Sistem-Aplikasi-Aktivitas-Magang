import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Clock, AlertCircle, ArrowLeft, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import api from '../api';

const Logbook = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [popup, setPopup] = useState(null);
  
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    deskripsi_kegiatan: '',
    hasil_kegiatan: '',
    waktu_mulai: '08:00',
    waktu_selesai: '17:00',
    kendala: '',
  });

  const [foto, setFoto] = useState(null);

  const [error, setError] = useState('');

  // Hitung batas waktu (maksimal hari ini untuk mencegah input masa depan)
  const todayDateObj = new Date();
  const maxDate = todayDateObj.toISOString().split('T')[0];

  useEffect(() => {
    if (location.state?.editLog) {
      const log = location.state.editLog;
      setFormData({
        tanggal: new Date(log.tanggal).toISOString().split('T')[0],
        deskripsi_kegiatan: log.deskripsi_kegiatan,
        hasil_kegiatan: log.hasil_kegiatan,
        waktu_mulai: log.waktu_mulai,
        waktu_selesai: log.waktu_selesai,
        kendala: log.kendala || '',
        status: log.status
      });
      setEditingId(log.id);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleKeyDownNumbering = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const { selectionStart, value, name } = e.target;
      
      const lines = value.substr(0, selectionStart).split('\n');
      const currentLine = lines[lines.length - 1];
      
      const match = currentLine.match(/^(\d+)\.\s/);
      
      let insertString = '\n';
      if (match) {
        // Jika baris saat ini kosong (hanya nomor), hapus nomornya
        if (currentLine.trim() === `${match[1]}.`) {
          const newValue = value.substring(0, selectionStart - match[0].length) + '\n' + value.substring(selectionStart);
          setFormData(prev => ({ ...prev, [name]: newValue }));
          setTimeout(() => {
            e.target.selectionStart = e.target.selectionEnd = selectionStart - match[0].length + 1;
          }, 0);
          return;
        }
        
        const nextNumber = parseInt(match[1], 10) + 1;
        insertString = `\n${nextNumber}. `;
      }
      
      const newValue = value.substring(0, selectionStart) + insertString + value.substring(selectionStart);
      
      setFormData(prev => ({ ...prev, [name]: newValue }));
      
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = selectionStart + insertString.length;
      }, 0);
    }
  };

  const handleFocusNumbering = (e) => {
    const { name, value } = e.target;
    if (value === '') {
      setFormData(prev => ({ ...prev, [name]: '1. ' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      let submitData = formData;
      let headers = {};

      if (foto) {
        submitData = new FormData();
        Object.keys(formData).forEach(key => {
          submitData.append(key, formData[key]);
        });
        submitData.append('foto', foto);
        headers = { 'Content-Type': 'multipart/form-data' };
      }

      let res;
      if (editingId) {
        res = await api.put(`/aktivitas/${editingId}`, submitData, { headers });
      } else {
        res = await api.post('/aktivitas', submitData, { headers });
      }
      
      const newStatus = res.data.data.status;
      if (newStatus === 'TELAT_MENGISI') {
        setPopup({ type: 'late', message: 'Logbook berhasil dikirim, namun tercatat TELAT karena melewati batas waktu pengumpulan.' });
      } else {
        setPopup({ type: 'success', message: 'Logbook berhasil dikirim tepat waktu!' });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan logbook.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Logbook Harian</h1>
          <p className="text-gray-500 mt-1">Catat dan laporkan aktivitas magang Anda setiap hari.</p>
        </div>
        <button
          onClick={() => navigate('/magang/dashboard')}
          className="flex items-center space-x-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Kembali ke Dashboard</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start space-x-3 border border-red-100">
          <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex justify-between items-center">
          <h2 className="font-semibold text-indigo-900">{editingId ? 'Edit Laporan' : 'Formulir Laporan Baru'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Kegiatan</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="text-gray-400" size={16} />
                  </div>
                  <input
                    type="date"
                    name="tanggal"
                    value={formData.tanggal}
                    onChange={handleInputChange}
                    max={maxDate}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="text-gray-400" size={16} />
                  </div>
                  <input
                    type="time"
                    name="waktu_mulai"
                    value={formData.waktu_mulai}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="text-gray-400" size={16} />
                  </div>
                  <input
                    type="time"
                    name="waktu_selesai"
                    value={formData.waktu_selesai}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Kegiatan</label>
              <textarea
                name="deskripsi_kegiatan"
                rows={4}
                value={formData.deskripsi_kegiatan}
                onChange={handleInputChange}
                onKeyDown={handleKeyDownNumbering}
                onFocus={handleFocusNumbering}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="1. Ceritakan detail apa saja yang Anda lakukan hari ini..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hasil Kegiatan</label>
              <textarea
                name="hasil_kegiatan"
                rows={3}
                value={formData.hasil_kegiatan}
                onChange={handleInputChange}
                onKeyDown={handleKeyDownNumbering}
                onFocus={handleFocusNumbering}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="1. Output atau pencapaian dari kegiatan tersebut..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kendala (Opsional)</label>
              <textarea
                name="kendala"
                rows={2}
                value={formData.kendala}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Adakah masalah yang dihadapi?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Foto/Bukti (Opsional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFoto(e.target.files[0])}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
              />
              <p className="text-xs text-gray-400 mt-1">Maksimal 5MB. Format: JPG, PNG.</p>
            </div>

            <div className="flex justify-end pt-4 space-x-3">
              <button
                type="button"
                onClick={() => navigate('/magang/dashboard')}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={(e) => {
                  setFormData(prev => ({ ...prev, status: 'DRAFT' }));
                  handleSubmit(e);
                }}
                disabled={isSubmitting}
                className="bg-gray-100 border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Simpan sebagai Draft
              </button>
              <button
                type="button"
                onClick={(e) => {
                  setFormData(prev => ({ ...prev, status: 'TERKIRIM' }));
                  handleSubmit(e);
                }}
                disabled={isSubmitting}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Menyimpan...' : 'Kirim Laporan'}
              </button>
            </div>
          </form>
      </div>

      {/* Popup Modal */}
      {popup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all">
            <div className={`p-6 flex flex-col items-center text-center ${popup.type === 'late' ? 'bg-amber-50' : 'bg-emerald-50'}`}>
              {popup.type === 'late' ? (
                <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle size={32} />
                </div>
              ) : (
                <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} />
                </div>
              )}
              <h2 className={`text-xl font-bold mb-2 ${popup.type === 'late' ? 'text-amber-700' : 'text-emerald-700'}`}>
                {popup.type === 'late' ? 'Terikirim (Terlambat)' : 'Berhasil Terkirim!'}
              </h2>
              <p className="text-gray-600">
                {popup.message}
              </p>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-center">
              <button 
                onClick={() => {
                  setPopup(null);
                  navigate('/magang/dashboard');
                }} 
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors w-full ${popup.type === 'late' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
              >
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logbook;
