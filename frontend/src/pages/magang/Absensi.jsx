import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Clock, LogIn, LogOut, CheckCircle, FileText, X } from 'lucide-react';

const Absensi = () => {
  const [absensiList, setAbsensiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [todayAbsen, setTodayAbsen] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [addressMasuk, setAddressMasuk] = useState('Memuat lokasi...');
  const [addressKeluar, setAddressKeluar] = useState('Memuat lokasi...');

  // State untuk Izin/Sakit
  const [showIzinModal, setShowIzinModal] = useState(false);
  const [izinData, setIzinData] = useState({ tipe: 'IZIN', tanggal: '', keterangan: '' });
  const [izinFile, setIzinFile] = useState(null);
  const [submittingIzin, setSubmittingIzin] = useState(false);

  // Update jam real-time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAbsensi = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/magang/absensi', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAbsensiList(res.data.data);
      
      // Cek apakah hari ini sudah absen
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      const foundToday = res.data.data.find(a => a.tanggal.startsWith(todayStr));
      setTodayAbsen(foundToday || null);
    } catch (error) {
      console.error('Error fetching absensi:', error);
    }
  };

  useEffect(() => {
    fetchAbsensi();
  }, []);

  // Effect untuk Reverse Geocoding
  useEffect(() => {
    const getAddress = async (coordString, setter, defaultText) => {
      if (!coordString || !coordString.includes(',')) {
        setter(coordString || defaultText);
        return;
      }
      
      const parts = coordString.split(',');
      if (parts.length === 2) {
        const lat = parts[0].trim();
        const lon = parts[1].trim();
        try {
          const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          if (res.data && res.data.display_name) {
            // Ambil 3 komponen pertama saja agar tidak terlalu panjang (misal: "Nama Gedung, Nama Jalan, Kecamatan")
            const simpleName = res.data.display_name.split(',').slice(0, 3).join(',');
            setter(simpleName);
          } else {
            setter(coordString);
          }
        } catch (err) {
          console.error("Geocoding error", err);
          setter(coordString);
        }
      } else {
        setter(coordString);
      }
    };

    if (todayAbsen?.lokasi_masuk) {
      getAddress(todayAbsen.lokasi_masuk, setAddressMasuk, 'Lokasi tidak direkam');
    } else {
      setAddressMasuk('Lokasi tidak direkam');
    }

    if (todayAbsen?.lokasi_keluar) {
      getAddress(todayAbsen.lokasi_keluar, setAddressKeluar, 'Belum check-out');
    } else {
      setAddressKeluar('Belum check-out');
    }
  }, [todayAbsen]);

  const getLokasi = () => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve(`${position.coords.latitude}, ${position.coords.longitude}`);
          },
          () => resolve('Lokasi tidak diizinkan')
        );
      } else {
        resolve('Geolocation tidak didukung');
      }
    });
  };

  const handleAbsen = async (type) => {
    setLoading(true);
    try {
      const lokasi = await getLokasi();
      const token = localStorage.getItem('token');
      const url = `http://localhost:5000/api/magang/absensi/${type}`;
      
      await axios.post(url, { lokasi }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(`Berhasil ${type === 'checkin' ? 'Check-In' : 'Check-Out'}!`);
      fetchAbsensi();
    } catch (error) {
      alert(error.response?.data?.message || `Gagal ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitIzin = async (e) => {
    e.preventDefault();
    setSubmittingIzin(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('tanggal', izinData.tanggal);
      formData.append('tipe', izinData.tipe);
      formData.append('keterangan', izinData.keterangan);
      if (izinFile) formData.append('bukti', izinFile);

      await axios.post('http://localhost:5000/api/magang/absensi/izin', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      alert(`Pengajuan ${izinData.tipe} berhasil!`);
      setShowIzinModal(false);
      setIzinData({ tipe: 'IZIN', tanggal: '', keterangan: '' });
      setIzinFile(null);
      fetchAbsensi();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal mengajukan izin/sakit');
    } finally {
      setSubmittingIzin(false);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const groupedAbsensi = absensiList.reduce((acc, item) => {
    const monthYear = new Date(item.tanggal).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Absensi Kehadiran</h1>
          <p className="text-gray-500 mt-1">Lakukan check-in saat mulai bekerja dan check-out saat selesai bekerja.</p>
        </div>
        <button 
          onClick={() => setShowIzinModal(true)} 
          className="mt-4 md:mt-0 px-5 py-2 bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 rounded-lg font-semibold shadow-sm transition-colors flex items-center"
        >
          <FileText size={18} className="mr-2" /> Ajukan Izin / Sakit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel Jam & Tombol */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <Clock className="w-16 h-16 text-indigo-500 mb-4" />
          <h2 className="text-4xl font-bold text-gray-800 tracking-wider font-mono">
            {currentTime.toLocaleTimeString('id-ID')}
          </h2>
          <p className="text-gray-500 mt-2 mb-8">{formatDate(currentTime)}</p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button
              onClick={() => handleAbsen('checkin')}
              disabled={loading || todayAbsen}
              className={`flex-1 py-4 px-6 rounded-xl font-bold text-white flex items-center justify-center transition-all ${
                todayAbsen 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-green-500 hover:bg-green-600 shadow-md hover:shadow-lg'
              }`}
            >
              <LogIn className="w-5 h-5 mr-2" />
              Check-In
            </button>

            <button
              onClick={() => handleAbsen('checkout')}
              disabled={loading || !todayAbsen || todayAbsen.waktu_keluar}
              className={`flex-1 py-4 px-6 rounded-xl font-bold text-white flex items-center justify-center transition-all ${
                (!todayAbsen || todayAbsen.waktu_keluar)
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-red-500 hover:bg-red-600 shadow-md hover:shadow-lg'
              }`}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Check-Out
            </button>
          </div>
          
          {todayAbsen && todayAbsen.waktu_keluar && (
             <div className="mt-6 flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-lg font-medium">
               <CheckCircle className="w-5 h-5 mr-2" />
               Anda sudah menyelesaikan absensi hari ini.
             </div>
          )}
        </div>

        {/* Panel Status Hari Ini */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-gray-800 mb-6 border-b pb-2">Status Hari Ini</h3>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="p-3 bg-green-50 rounded-lg mr-4">
                <LogIn className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold">Waktu Masuk (Check-In)</p>
                <p className="text-xl font-bold text-gray-800">{formatTime(todayAbsen?.waktu_masuk)}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-start">
                  <MapPin className="w-3 h-3 mr-1 mt-0.5 shrink-0" />
                  <span>{addressMasuk}</span>
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="p-3 bg-red-50 rounded-lg mr-4">
                <LogOut className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold">Waktu Keluar (Check-Out)</p>
                <p className="text-xl font-bold text-gray-800">{formatTime(todayAbsen?.waktu_keluar)}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-start">
                  <MapPin className="w-3 h-3 mr-1 mt-0.5 shrink-0" />
                  <span>{addressKeluar}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Riwayat */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg text-gray-800 mb-6">Riwayat Kehadiran</h3>
        
        {absensiList.length === 0 ? (
          <div className="text-center text-gray-500 italic py-8">
            Belum ada riwayat absensi.
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedAbsensi).map(([month, records]) => (
              <div key={month} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-indigo-50 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200">
                  <h4 className="font-bold text-indigo-900 mb-3 md:mb-0 text-lg">{month}</h4>
                  <div className="flex gap-4 text-sm font-semibold">
                    <span className="text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">Hadir: {records.filter(r => r.status === 'HADIR').length}</span>
                    <span className="text-blue-700 bg-blue-100 px-3 py-1 rounded-full">Izin: {records.filter(r => r.status === 'IZIN').length}</span>
                    <span className="text-amber-700 bg-amber-100 px-3 py-1 rounded-full">Sakit: {records.filter(r => r.status === 'SAKIT').length}</span>
                    <span className="text-red-700 bg-red-100 px-3 py-1 rounded-full">Alpa: {records.filter(r => r.status === 'ALPA' || r.status === 'TANPA_KETERANGAN').length}</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white border-b border-gray-200 text-sm text-gray-600">
                        <th className="p-4 font-semibold">Tanggal</th>
                        <th className="p-4 font-semibold">Check-In</th>
                        <th className="p-4 font-semibold">Check-Out</th>
                        <th className="p-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="p-4 text-sm font-medium text-gray-800">{formatDate(item.tanggal)}</td>
                          <td className="p-4 text-sm text-gray-600">
                            <span className="bg-green-50 text-green-700 px-2 py-1 rounded font-mono text-xs font-semibold">
                              {formatTime(item.waktu_masuk)}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-gray-600">
                            {item.waktu_keluar ? (
                              <span className="bg-red-50 text-red-700 px-2 py-1 rounded font-mono text-xs font-semibold">
                                {formatTime(item.waktu_keluar)}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">Belum</span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              item.status === 'HADIR' ? 'bg-green-100 text-green-800' :
                              item.status === 'IZIN' ? 'bg-amber-100 text-amber-800' :
                              item.status === 'SAKIT' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.status}
                            </span>
                            {item.bukti_path && (
                              <a href={`http://localhost:5000${item.bukti_path}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-blue-600 hover:underline">
                                Lihat Bukti
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Izin/Sakit */}
      {showIzinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-800">Form Izin / Sakit</h3>
              <button onClick={() => setShowIzinModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitIzin} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Ketidakhadiran</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center">
                    <input type="radio" name="tipe" value="IZIN" checked={izinData.tipe === 'IZIN'} onChange={(e) => setIzinData({...izinData, tipe: e.target.value})} className="mr-2" />
                    Izin
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="tipe" value="SAKIT" checked={izinData.tipe === 'SAKIT'} onChange={(e) => setIzinData({...izinData, tipe: e.target.value})} className="mr-2" />
                    Sakit
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <input type="date" required value={izinData.tanggal} onChange={(e) => setIzinData({...izinData, tanggal: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alasan / Keterangan</label>
                <textarea required rows="3" value={izinData.keterangan} onChange={(e) => setIzinData({...izinData, keterangan: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Tuliskan alasan ketidakhadiran..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unggah Bukti {izinData.tipe === 'SAKIT' && <span className="text-red-500">* (Wajib)</span>}
                </label>
                <input type="file" accept="image/*,.pdf" onChange={(e) => setIzinFile(e.target.files[0])} required={izinData.tipe === 'SAKIT'} className="w-full border border-gray-300 rounded-lg p-1.5 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-700" />
                {izinData.tipe === 'SAKIT' && <p className="text-xs text-red-500 mt-1">Surat Keterangan Dokter wajib dilampirkan.</p>}
                {izinData.tipe === 'IZIN' && <p className="text-xs text-gray-500 mt-1">Opsional untuk izin (misal: surat kampus).</p>}
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowIzinModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">Batal</button>
                <button type="submit" disabled={submittingIzin} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
                  {submittingIzin ? 'Mengirim...' : 'Kirim Pengajuan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Absensi;
