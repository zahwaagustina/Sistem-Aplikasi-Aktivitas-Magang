import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Clock, LogIn, LogOut, CheckCircle } from 'lucide-react';

const Absensi = () => {
  const [absensiList, setAbsensiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [todayAbsen, setTodayAbsen] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

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

  const formatTime = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">Absensi Kehadiran</h1>
        <p className="text-gray-500 mt-1">Lakukan check-in saat mulai bekerja dan check-out saat selesai bekerja.</p>
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
                <p className="text-xs text-gray-400 mt-1 flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {todayAbsen?.lokasi_masuk || 'Lokasi tidak direkam'}
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
                <p className="text-xs text-gray-400 mt-1 flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {todayAbsen?.lokasi_keluar || 'Belum check-out'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Riwayat */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg text-gray-800 mb-4">Riwayat Kehadiran</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                <th className="p-4 font-semibold rounded-tl-lg">Tanggal</th>
                <th className="p-4 font-semibold">Check-In</th>
                <th className="p-4 font-semibold">Check-Out</th>
                <th className="p-4 font-semibold rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {absensiList.map((item) => (
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
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {absensiList.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500 italic">
                    Belum ada riwayat absensi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Absensi;
