import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Calendar, Briefcase, MapPin, Search } from 'lucide-react';

const OnboardingDashboard = () => {
  const [kandidat, setKandidat] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPendaftaran, setSelectedPendaftaran] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    mentor_id: '',
    divisi: '',
    lokasi: '',
    tanggal_mulai: '',
    tanggal_selesai: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [kandidatRes, mentorRes] = await Promise.all([
        axios.get('http://localhost:5000/api/hr/kandidat', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/hr/mentors', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      // Filter hanya yang lolos seleksi / interview dan belum accepted/rejected
      const filteredKandidat = kandidatRes.data.data.filter(k => 
        k.status === 'SHORTLISTED' || k.status === 'INTERVIEW'
      );

      setKandidat(filteredKandidat);
      setMentors(mentorRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (p) => {
    setSelectedPendaftaran(p);
    setFormData({
      mentor_id: '',
      divisi: p.lowongan.divisi,
      lokasi: p.lowongan.lokasi,
      tanggal_mulai: '',
      tanggal_selesai: ''
    });
    setShowModal(true);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/hr/onboarding/${selectedPendaftaran.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Onboarding berhasil! Peserta kini berstatus Magang.');
      setShowModal(false);
      fetchData(); // refresh list
    } catch (error) {
      alert('Terjadi kesalahan: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredData = kandidat.filter(k => 
    k.user?.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.lowongan?.posisi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Onboarding Kandidat</h2>
        <p className="text-gray-500 mt-1">Terima kandidat pilihan dan tempatkan mereka ke divisi terkait.</p>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Cari nama kandidat atau posisi..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full md:w-1/3 border border-gray-300 rounded-lg py-2 focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : filteredData.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
          <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">Belum ada kandidat siap Onboarding</h3>
          <p className="text-gray-500">Kandidat yang berstatus Shortlisted atau Interview akan muncul di sini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredData.map(p => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{p.user?.nama}</h3>
                    <p className="text-sm text-indigo-600 font-medium">{p.lowongan?.posisi}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.status === 'INTERVIEW' ? 'bg-yellow-100 text-yellow-800' : 'bg-indigo-100 text-indigo-800'}`}>
                    {p.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <div className="flex items-center"><Briefcase className="w-4 h-4 mr-2" /> Divisi: {p.lowongan?.divisi}</div>
                  <div className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> Universitas: {p.user?.profilKandidat?.universitas || '-'}</div>
                  <div className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> Lamar: {new Date(p.created_at).toLocaleDateString('id-ID')}</div>
                </div>

                <button 
                  onClick={() => openModal(p)}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
                >
                  Proses Terima (Onboarding)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && selectedPendaftaran && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="bg-indigo-600 p-6 text-white">
              <h3 className="text-xl font-bold">Onboarding: {selectedPendaftaran.user.nama}</h3>
              <p className="text-indigo-100 text-sm mt-1">Lengkapi data penempatan dan pembuatan akun magang</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mentor Pembimbing <span className="text-red-500">*</span></label>
                <select name="mentor_id" required value={formData.mentor_id} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2">
                  <option value="">-- Pilih Mentor --</option>
                  {mentors.map(m => (
                    <option key={m.id} value={m.id}>{m.nama} - {m.email}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Divisi Penempatan <span className="text-red-500">*</span></label>
                  <input type="text" name="divisi" required value={formData.divisi} onChange={handleChange} className="w-full border-gray-300 rounded-lg border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                  <input type="text" name="lokasi" required value={formData.lokasi} onChange={handleChange} className="w-full border-gray-300 rounded-lg border p-2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai <span className="text-red-500">*</span></label>
                  <input type="date" name="tanggal_mulai" required value={formData.tanggal_mulai} onChange={handleChange} className="w-full border-gray-300 rounded-lg border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai <span className="text-red-500">*</span></label>
                  <input type="date" name="tanggal_selesai" required value={formData.tanggal_selesai} onChange={handleChange} className="w-full border-gray-300 rounded-lg border p-2" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">
                  Batal
                </button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
                  Selesaikan Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingDashboard;
