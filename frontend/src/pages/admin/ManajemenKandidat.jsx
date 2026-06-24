import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Users, Search, FileText, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

const ManajemenKandidat = () => {
  const location = useLocation();
  const [kandidatList, setKandidatList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modal states
  const [activeModal, setActiveModal] = useState(null); // 'STATUS', 'INTERVIEW', 'NILAI'
  const [selectedKandidat, setSelectedKandidat] = useState(null);

  // Form states
  const [statusForm, setStatusForm] = useState('');
  const [interviewForm, setInterviewForm] = useState({ tanggal_waktu: '', link_meeting: '' });
  const [nilaiForm, setNilaiForm] = useState({ skor_wawancara: '', skor_psikotes: '', skor_teknikal: '', catatan: '', keputusan: 'ACCEPTED' });

  const fetchKandidat = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/hr/kandidat', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKandidatList(res.data.data);
    } catch (error) {
      console.error('Error fetching kandidat:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKandidat();
    
    // Check if there is a query param 'posisi' to pre-fill search
    const queryParams = new URLSearchParams(location.search);
    const posisi = queryParams.get('posisi');
    if (posisi) {
      setSearchTerm(posisi);
    }
  }, [location.search]);

  const openStatusModal = (kandidat) => {
    setSelectedKandidat(kandidat);
    setStatusForm(kandidat.status);
    setActiveModal('STATUS');
  };

  const openInterviewModal = (kandidat) => {
    setSelectedKandidat(kandidat);
    setInterviewForm({ 
      tanggal_waktu: kandidat.interview?.tanggal_waktu ? new Date(kandidat.interview.tanggal_waktu).toISOString().slice(0,16) : '', 
      link_meeting: kandidat.interview?.link_meeting || '' 
    });
    setActiveModal('INTERVIEW');
  };

  const openNilaiModal = (kandidat) => {
    setSelectedKandidat(kandidat);
    setNilaiForm({ 
      skor_wawancara: kandidat.interview?.skor_wawancara || '',
      skor_psikotes: kandidat.interview?.skor_psikotes || '',
      skor_teknikal: kandidat.interview?.skor_teknikal || '',
      catatan: kandidat.interview?.catatan || '', 
      keputusan: kandidat.status === 'REJECTED' ? 'REJECTED' : 'ACCEPTED'
    });
    setActiveModal('NILAI');
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedKandidat(null);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/hr/kandidat/${selectedKandidat.id}/status`, 
        { status: statusForm }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Status berhasil diupdate');
      closeModal();
      fetchKandidat();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal update status');
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/hr/kandidat/${selectedKandidat.id}/interview`, 
        interviewForm, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Jadwal interview berhasil dibuat');
      closeModal();
      fetchKandidat();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal mengatur jadwal');
    }
  };

  const handleSubmitNilai = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/hr/kandidat/${selectedKandidat.id}/interview`, 
        nilaiForm, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Penilaian berhasil disimpan');
      closeModal();
      fetchKandidat();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menyimpan penilaian');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800';
      case 'REVIEWED': return 'bg-indigo-100 text-indigo-800';
      case 'SHORTLISTED': return 'bg-yellow-100 text-yellow-800';
      case 'INTERVIEW': return 'bg-purple-100 text-purple-800';
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredList = kandidatList.filter(k => 
    k.user.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    k.lowongan.posisi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Users className="mr-2 text-indigo-600" /> Manajemen Kandidat & Seleksi
          </h1>
          <p className="text-gray-500 mt-1">Kelola pelamar, jadwalkan wawancara, dan tetapkan keputusan.</p>
        </div>
        <div className="mt-4 md:mt-0 relative">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari nama atau posisi..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                <th className="p-4 font-semibold">Profil Kandidat</th>
                <th className="p-4 font-semibold">Lowongan</th>
                <th className="p-4 font-semibold">Status Lamaran</th>
                <th className="p-4 font-semibold">Jadwal Interview</th>
                <th className="p-4 font-semibold text-center">Aksi Seleksi</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((kandidat) => (
                <tr key={kandidat.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-gray-800">{kandidat.user.nama}</p>
                    <p className="text-xs text-gray-500 mb-1">{kandidat.user.email} | {kandidat.user.no_telepon}</p>
                    {kandidat.user.profilKandidat && (
                      <p className="text-xs text-indigo-600 font-medium">
                        {kandidat.user.profilKandidat.universitas} - {kandidat.user.profilKandidat.jurusan}
                      </p>
                    )}
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-gray-800 text-sm">{kandidat.lowongan.posisi}</p>
                    <p className="text-xs text-gray-500">{kandidat.lowongan.program.nama}</p>
                  </td>
                  <td className="p-4">
                    <button onClick={() => openStatusModal(kandidat)} className="focus:outline-none" title="Klik untuk ubah status">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full hover:opacity-80 transition-opacity cursor-pointer shadow-sm ${getStatusColor(kandidat.status)}`}>
                        {kandidat.status}
                      </span>
                    </button>
                  </td>
                  <td className="p-4">
                    {kandidat.interview ? (
                      <div>
                        <p className="text-xs font-semibold text-gray-700 flex items-center mb-1">
                          <Clock className="w-3 h-3 mr-1" /> {new Date(kandidat.interview.tanggal_waktu).toLocaleString('id-ID')}
                        </p>
                        {kandidat.interview.hasil_score ? (
                          <p className="text-xs font-bold text-green-600">Skor: {kandidat.interview.hasil_score}</p>
                        ) : (
                          <p className="text-xs text-yellow-600 italic">Belum dinilai</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Belum ada jadwal</span>
                    )}
                  </td>
                  <td className="p-4 flex flex-wrap justify-center gap-2">
                    {kandidat.user.profilKandidat?.cv_path && (
                      <a href={`http://localhost:5000${kandidat.user.profilKandidat.cv_path}`} target="_blank" rel="noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center justify-center" title="Lihat CV">
                        <FileText className="w-4 h-4" />
                      </a>
                    )}
                    {(kandidat.status === 'SHORTLISTED' || kandidat.status === 'INTERVIEW') && (
                      <button onClick={() => openInterviewModal(kandidat)} className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100" title="Jadwalkan Interview">
                        <Calendar className="w-4 h-4" />
                      </button>
                    )}
                    {kandidat.status === 'INTERVIEW' && kandidat.interview && (
                      <button onClick={() => openNilaiModal(kandidat)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100" title="Beri Penilaian">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">Tidak ada data kandidat.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION UI */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4 pb-4">
          <button 
            disabled={currentPage === 1} 
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3 py-1 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 text-gray-600"
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button 
              key={i} 
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1 border text-sm font-medium rounded-lg transition-colors ${
                currentPage === i + 1 
                  ? 'bg-indigo-600 border-indigo-600 text-white' 
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-3 py-1 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 text-gray-600"
          >
            Next
          </button>
        </div>
      )}

      {/* MODAL UBAH STATUS */}
      {activeModal === 'STATUS' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Ubah Status Lamaran</h2>
            <form onSubmit={handleUpdateStatus}>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Status Baru</label>
                <select value={statusForm} onChange={(e) => setStatusForm(e.target.value)} className="w-full border p-2 rounded-lg">
                  <option value="REVIEWED">REVIEWED</option>
                  <option value="SHORTLISTED">SHORTLISTED (Lolos Administrasi)</option>
                  <option value="REJECTED">REJECTED (Tolak)</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL JADWAL INTERVIEW */}
      {activeModal === 'INTERVIEW' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Jadwal & Undangan Interview</h2>
            <form onSubmit={handleScheduleInterview}>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Tanggal & Waktu</label>
                <input type="datetime-local" required value={interviewForm.tanggal_waktu} onChange={(e) => setInterviewForm({...interviewForm, tanggal_waktu: e.target.value})} className="w-full border p-2 rounded-lg" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Link Meeting Online</label>
                <input type="url" placeholder="https://zoom.us/..." required value={interviewForm.link_meeting} onChange={(e) => setInterviewForm({...interviewForm, link_meeting: e.target.value})} className="w-full border p-2 rounded-lg" />
              </div>
              <p className="text-xs text-gray-500 italic">*Status akan otomatis berubah menjadi INTERVIEW</p>
              <div className="flex justify-end space-x-2 mt-6">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg">Kirim Undangan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NILAI INTERVIEW */}
      {activeModal === 'NILAI' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Penilaian Interview & Keputusan</h2>
            <form onSubmit={handleSubmitNilai}>
              <div className="mb-4 grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-2">Wawancara (0-100)</label>
                  <input type="number" min="0" max="100" required value={nilaiForm.skor_wawancara} onChange={(e) => setNilaiForm({...nilaiForm, skor_wawancara: e.target.value})} className="w-full border p-2 rounded-lg text-sm" placeholder="Misal: 85" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2">Psikotes (0-100)</label>
                  <input type="number" min="0" max="100" required value={nilaiForm.skor_psikotes} onChange={(e) => setNilaiForm({...nilaiForm, skor_psikotes: e.target.value})} className="w-full border p-2 rounded-lg text-sm" placeholder="Misal: 80" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2">Teknikal (0-100)</label>
                  <input type="number" min="0" max="100" required value={nilaiForm.skor_teknikal} onChange={(e) => setNilaiForm({...nilaiForm, skor_teknikal: e.target.value})} className="w-full border p-2 rounded-lg text-sm" placeholder="Misal: 90" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Catatan Interviewer</label>
                <textarea required value={nilaiForm.catatan} onChange={(e) => setNilaiForm({...nilaiForm, catatan: e.target.value})} className="w-full border p-2 rounded-lg" rows="3" placeholder="Skill bagus, komunikasi lancar..."></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Keputusan Akhir</label>
                <select value={nilaiForm.keputusan} onChange={(e) => setNilaiForm({...nilaiForm, keputusan: e.target.value})} className="w-full border p-2 rounded-lg">
                  <option value="ACCEPTED">LULUS (Terima Magang)</option>
                  <option value="REJECTED">TIDAK LULUS (Tolak)</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">Simpan & Umumkan</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManajemenKandidat;
