import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Users, Eye, Copy, Power, Search, Lock, Unlock, FileText } from 'lucide-react';

const ManajemenLowongan = () => {
  const navigate = useNavigate();
  const [lowongan, setLowongan] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filters and Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBatch, setFilterBatch] = useState('Semua');
  const [filterDivisi, setFilterDivisi] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // Modal State
  const [modalType, setModalType] = useState(null); // 'ADD', 'EDIT', 'DETAIL', 'DELETE'
  const [selectedLowongan, setSelectedLowongan] = useState(null);
  const [formData, setFormData] = useState({
    program_id: '',
    posisi: '',
    deskripsi: '',
    kualifikasi: '',
    benefit: '',
    divisi: '',
    lokasi: '',
    mode_kerja: 'WFO',
    kuota: '',
    status: 'DRAFT'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [lowonganRes, programRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/hr/lowongan`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_URL}/hr/program-batch`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setLowongan(lowonganRes.data.data);
      setPrograms(programRes.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setSelectedLowongan(item);
    if (type === 'ADD') {
      setFormData({
        program_nama: '',
        posisi: '', deskripsi: '', 
        kualifikasi: '1. Mahasiswa aktif minimal semester 5\n2. Memiliki semangat belajar yang tinggi\n3. Mampu bekerja sama dalam tim\n4. ', 
        benefit: '1. Sertifikat Kelulusan Resmi\n2. Uang Saku / Transportasi\n3. Konversi SKS (Bagi Mahasiswa)\n4. Mentorship & Pengalaman Proyek Nyata', 
        divisi: '', 
        lokasi: 'PT. Pandu Cipta Solusi, Kampung Kadu, Tangerang', mode_kerja: 'WFO', kuota: '', status: 'DRAFT'
      });
    } else if (type === 'EDIT' || type === 'DUPLICATE') {
      setFormData({
        program_nama: item.program?.nama || '',
        posisi: type === 'DUPLICATE' ? `${item.posisi} (Copy)` : item.posisi,
        deskripsi: item.deskripsi,
        kualifikasi: item.kualifikasi,
        benefit: item.benefit || '',
        divisi: item.divisi,
        lokasi: item.lokasi,
        mode_kerja: item.mode_kerja,
        kuota: item.kuota,
        status: type === 'DUPLICATE' ? 'DRAFT' : item.status
      });
      if(type === 'DUPLICATE') setModalType('ADD'); // Treat duplicate as ADD with prefilled data
    }
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedLowongan(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (modalType === 'ADD') {
        await axios.post(`${import.meta.env.VITE_API_URL}/hr/lowongan`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Lowongan berhasil ditambahkan');
      } else if (modalType === 'EDIT') {
        await axios.put(`${import.meta.env.VITE_API_URL}/hr/lowongan/${selectedLowongan.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Lowongan berhasil diperbarui');
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      alert('Terjadi kesalahan: ' + error.response?.data?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/hr/lowongan/${selectedLowongan.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Lowongan berhasil dihapus');
      handleCloseModal();
      fetchData();
    } catch (error) {
      alert('Gagal menghapus lowongan: ' + error.response?.data?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      let newStatus = 'OPEN';
      if (item.status === 'OPEN') newStatus = 'CLOSED';
      if (item.status === 'CLOSED') newStatus = 'OPEN';
      
      await axios.put(`${import.meta.env.VITE_API_URL}/hr/lowongan/${item.id}`, {
        ...item,
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      alert('Gagal mengubah status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePelamarClick = (posisi) => {
    navigate(`/hr/kandidat?posisi=${encodeURIComponent(posisi)}`);
  };

  const renderLokasi = (lokasiText) => {
    if (!lokasiText) return '';
    const idx = lokasiText.indexOf(',');
    if (idx !== -1) {
      return <><span className="font-bold text-gray-800">{lokasiText.substring(0, idx)}</span>{lokasiText.substring(idx)}</>;
    }
    return lokasiText;
  };

  // Derived Filter Options
  const uniqueDivisi = ['Semua', ...new Set(lowongan.map(l => l.divisi))];
  const uniqueBatches = ['Semua', ...new Set(lowongan.map(l => l.program?.nama).filter(Boolean))];

  // Filtering Logic
  const filteredLowongan = lowongan.filter(item => {
    if (filterBatch !== 'Semua' && item.program?.nama !== filterBatch) return false;
    if (filterDivisi !== 'Semua' && item.divisi !== filterDivisi) return false;
    if (filterStatus !== 'Semua' && item.status !== filterStatus) return false;
    if (searchTerm && !item.posisi.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manajemen Lowongan</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola posisi magang yang ditawarkan, kuota, dan status pendaftaran.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleOpenModal('ADD')}
            className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white px-4 py-2 rounded-lg flex items-center font-medium hover:from-blue-700 hover:to-cyan-500 transition shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" /> Tambah Lowongan
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari nama posisi..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <select value={filterBatch} onChange={e => setFilterBatch(e.target.value)} className="border border-gray-300 rounded-lg p-2 min-w-[150px]">
          {uniqueBatches.map(b => <option key={b} value={b}>{b === 'Semua' ? 'Semua Batch' : b}</option>)}
        </select>
        
        <select value={filterDivisi} onChange={e => setFilterDivisi(e.target.value)} className="border border-gray-300 rounded-lg p-2 min-w-[150px]">
          {uniqueDivisi.map(d => <option key={d} value={d}>{d === 'Semua' ? 'Semua Divisi' : d}</option>)}
        </select>

        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-300 rounded-lg p-2 min-w-[150px]">
          <option value="Semua">Semua Status</option>
          <option value="DRAFT">Draft</option>
          <option value="OPEN">Published (Open)</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-3 px-4 font-semibold text-gray-600">Posisi & Batch</th>
                <th className="py-3 px-4 font-semibold text-gray-600">Divisi</th>
                <th className="py-3 px-4 font-semibold text-gray-600 text-center">Kuota</th>
                <th className="py-3 px-4 font-semibold text-gray-600 text-center">Pelamar</th>
                <th className="py-3 px-4 font-semibold text-gray-600">Status</th>
                <th className="py-3 px-4 font-semibold text-gray-600 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8"><div className="animate-spin h-6 w-6 border-b-2 border-indigo-600 mx-auto rounded-full"></div></td></tr>
              ) : filteredLowongan.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-500">Tidak ada lowongan yang sesuai filter.</td></tr>
              ) : (
                filteredLowongan.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-gray-800">{item.posisi}</p>
                      <p className="text-xs text-gray-500">{item.program?.nama}</p>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-700">{item.divisi}</td>
                    <td className="py-3 px-4 text-center font-bold text-gray-700">{item.kuota}</td>
                    <td className="py-3 px-4 text-center">
                      <button 
                        onClick={() => handlePelamarClick(item.posisi)}
                        className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full font-bold hover:bg-indigo-100 transition-colors"
                        title="Lihat Pelamar"
                      >
                        <Users className="w-4 h-4 mr-1.5" />
                        {item._count?.pendaftaran || 0}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      {item.status === 'OPEN' && <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-green-100 text-green-800 border border-green-200">OPEN</span>}
                      {item.status === 'CLOSED' && <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-800 border border-red-200">CLOSED</span>}
                      {item.status === 'DRAFT' && <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">DRAFT</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center items-center gap-1.5">
                        <button onClick={() => handleOpenModal('DETAIL', item)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="Lihat Detail">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleOpenModal('EDIT', item)} className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleOpenModal('DUPLICATE', item)} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Duplikat">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(item)} 
                          disabled={isSubmitting}
                          className={`p-1.5 rounded ${item.status === 'OPEN' ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'} disabled:opacity-50`} 
                          title={item.status === 'OPEN' ? 'Tutup Lowongan' : 'Buka Lowongan'}
                        >
                          {item.status === 'OPEN' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleOpenModal('DELETE', item)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL (ADD / EDIT) */}
      {(modalType === 'ADD' || modalType === 'EDIT') && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{modalType === 'ADD' ? 'Tambah Lowongan' : 'Edit Lowongan'}</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Posisi / Judul Lowongan</label>
                  <input required type="text" name="posisi" value={formData.posisi} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Program Batch</label>
                  <input required type="text" name="program_nama" value={formData.program_nama} onChange={handleChange} placeholder="Contoh: Batch Juli 2025" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi Pekerjaan</label>
                  <textarea required name="deskripsi" value={formData.deskripsi} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 h-24 focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Kualifikasi</label>
                  <textarea required name="kualifikasi" value={formData.kualifikasi} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 h-24 focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Benefit</label>
                  <textarea name="benefit" value={formData.benefit} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 h-16 focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Divisi Penempatan</label>
                  <input required type="text" name="divisi" value={formData.divisi} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Lokasi</label>
                  <input type="text" name="lokasi" value={formData.lokasi} readOnly className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Kuota Penerimaan</label>
                  <input required type="number" min="1" name="kuota" value={formData.kuota} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Mode Kerja</label>
                  <input type="text" value="Work From Office" readOnly className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none" />
                </div>
                <div className="col-span-1 md:col-span-2 mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                   <label className="block text-sm font-bold text-gray-800 mb-2">Status Publikasi</label>
                   <div className="flex gap-4">
                     <label className="flex items-center gap-2 cursor-pointer">
                       <input type="radio" name="status" value="DRAFT" checked={formData.status === 'DRAFT'} onChange={handleChange} className="text-indigo-600 focus:ring-indigo-500" />
                       <span className="text-sm font-medium">DRAFT (Sembunyikan)</span>
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer">
                       <input type="radio" name="status" value="OPEN" checked={formData.status === 'OPEN'} onChange={handleChange} className="text-indigo-600 focus:ring-indigo-500" />
                       <span className="text-sm font-medium">PUBLISH (Buka Pendaftaran)</span>
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer">
                       <input type="radio" name="status" value="CLOSED" checked={formData.status === 'CLOSED'} onChange={handleChange} className="text-indigo-600 focus:ring-indigo-500" />
                       <span className="text-sm font-medium">CLOSED (Tutup Pendaftaran)</span>
                     </label>
                   </div>
                </div>
              </div>
              <div className="flex justify-end pt-4 space-x-3 border-t mt-6">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 font-medium">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-sm flex items-center disabled:opacity-50">
                  <FileText className="w-4 h-4 mr-2" /> {isSubmitting ? 'Memproses...' : 'Simpan Lowongan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {modalType === 'DETAIL' && selectedLowongan && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
             <div className="flex justify-between items-start mb-6">
               <div>
                 <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold mb-2 inline-block">{selectedLowongan.divisi}</span>
                 <h2 className="text-2xl font-bold text-gray-900">{selectedLowongan.posisi}</h2>
                 <p className="text-sm text-gray-500 mt-1">{selectedLowongan.program?.nama} • {renderLokasi(selectedLowongan.lokasi)} • {selectedLowongan.mode_kerja}</p>
               </div>
               <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
               </button>
             </div>
             
             <div className="space-y-6">
               <div>
                 <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Deskripsi Pekerjaan</h4>
                 <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{selectedLowongan.deskripsi}</p>
               </div>
               <div>
                 <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Kualifikasi</h4>
                 <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{selectedLowongan.kualifikasi}</p>
               </div>
               {selectedLowongan.benefit && (
                 <div>
                   <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Benefit</h4>
                   <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{selectedLowongan.benefit}</p>
                 </div>
               )}
               <div className="flex items-center justify-between border-t pt-4">
                 <div className="text-sm">
                   <span className="font-bold text-gray-900">Kuota:</span> {selectedLowongan.kuota} Orang
                 </div>
                 <div className="text-sm">
                   <span className="font-bold text-gray-900">Status:</span> <span className="font-bold text-indigo-600">{selectedLowongan.status}</span>
                 </div>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {modalType === 'DELETE' && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Hapus Lowongan?</h3>
            <p className="text-gray-500 mb-6 text-sm">Apakah Anda yakin ingin menghapus lowongan <b>{selectedLowongan?.posisi}</b>? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex justify-center space-x-3">
              <button onClick={handleCloseModal} className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 w-full">Batal</button>
              <button onClick={handleDelete} disabled={isSubmitting} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 w-full shadow-sm disabled:opacity-50">{isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManajemenLowongan;
