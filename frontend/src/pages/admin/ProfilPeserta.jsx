import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, GraduationCap, Building, MapPin, Search, FileText } from 'lucide-react';

const ProfilPeserta = () => {
  const [peserta, setPeserta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPeserta();
  }, []);

  const fetchPeserta = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/hr/peserta-aktif', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPeserta(res.data.data);
    } catch (error) {
      console.error('Error fetching peserta:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPeserta = peserta.filter(p => 
    (p.user?.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.id_magang || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTestSertifikat = async (userId) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/test-generate-sertifikat/${userId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data?.file_path) {
        window.open(`http://localhost:5000${response.data.file_path}`, '_blank');
      }
    } catch (error) {
      alert('Gagal test sertifikat: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Data Peserta Aktif</h2>
        <p className="text-gray-500 mt-1">Daftar anak magang yang sedang menjalani program.</p>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Cari nama atau divisi..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full md:w-1/3 border border-gray-300 rounded-lg py-2 focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full text-left border-collapse min-w-full">
            <thead>
              <tr className="bg-indigo-50 border-b border-gray-100">
                <th className="py-2.5 px-3 text-sm font-semibold text-indigo-900">ID Magang</th>
                <th className="py-2.5 px-3 text-sm font-semibold text-indigo-900">Nama Lengkap</th>
                <th className="py-2.5 px-3 text-sm font-semibold text-indigo-900">Universitas</th>
                <th className="py-2.5 px-3 text-sm font-semibold text-indigo-900">Divisi & Mentor</th>
                <th className="py-2.5 px-3 text-sm font-semibold text-indigo-900">Periode Magang</th>
                <th className="py-2.5 px-3 text-sm font-semibold text-indigo-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-6 text-gray-500">Memuat data...</td></tr>
              ) : filteredPeserta.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-6 text-gray-500">Belum ada peserta magang aktif.</td></tr>
              ) : (
                filteredPeserta.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-3 text-xs font-medium text-gray-600">{p.id_magang}</td>
                    <td className="py-2.5 px-3">
                      <div className="text-sm font-bold text-gray-900">{p.user?.nama}</div>
                      <div className="text-xs text-gray-500">{p.user?.email}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-xs text-gray-800 flex items-center"><Building className="w-3.5 h-3.5 mr-1 text-gray-400"/> {p.universitas || '-'}</div>
                      <div className="text-xs text-gray-500 flex items-center mt-1"><GraduationCap className="w-3.5 h-3.5 mr-1 text-gray-400"/> {p.jurusan || '-'}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-xs font-semibold text-indigo-600">{p.divisi}</div>
                      <div className="text-xs text-gray-500 mt-1">Mentor: {p.mentor?.nama || '-'}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-xs text-gray-800">
                        {p.tanggal_mulai ? new Date(p.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} 
                        <br/><span className="text-gray-400">s/d</span><br/> 
                        {p.tanggal_selesai ? new Date(p.tanggal_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-md text-[11px] font-semibold tracking-wide uppercase ${
                        p.status === 'AKTIF' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        p.status === 'SELESAI' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {p.status}
                      </span>
                      <button 
                        onClick={() => handleTestSertifikat(p.user_id)} 
                        className="p-1.5 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors" 
                        title="Test Generate Sertifikat"
                      >
                        <FileText size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfilPeserta;
