import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Users } from 'lucide-react';

const ManajemenLowongan = () => {
  const [lowongan, setLowongan] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
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
    status: 'OPEN'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [lowonganRes, programRes] = await Promise.all([
        axios.get('http://localhost:5000/api/hr/lowongan', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/hr/program-batch', { headers: { Authorization: `Bearer ${token}` } })
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/hr/lowongan', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert('Terjadi kesalahan: ' + error.response?.data?.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manajemen Lowongan</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5 mr-2" /> Tambah Lowongan
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-3 px-4 font-semibold text-gray-600">Posisi</th>
              <th className="py-3 px-4 font-semibold text-gray-600">Program Batch</th>
              <th className="py-3 px-4 font-semibold text-gray-600">Divisi</th>
              <th className="py-3 px-4 font-semibold text-gray-600">Kuota</th>
              <th className="py-3 px-4 font-semibold text-gray-600">Pelamar</th>
              <th className="py-3 px-4 font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="6" className="text-center py-4">Memuat data...</td></tr>
            ) : lowongan.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-4">Belum ada data lowongan</td></tr>
            ) : (
              lowongan.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{item.posisi}</td>
                  <td className="py-3 px-4">{item.program?.nama}</td>
                  <td className="py-3 px-4">{item.divisi}</td>
                  <td className="py-3 px-4">{item.kuota}</td>
                  <td className="py-3 px-4">
                    <span className="flex items-center text-indigo-600 font-medium">
                      <Users className="w-4 h-4 mr-1" />
                      {item._count?.pendaftaran || 0}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-4">Tambah Lowongan Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Posisi / Judul Lowongan</label>
                  <input required type="text" name="posisi" onChange={handleChange} className="w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Program Batch</label>
                  <select required name="program_id" onChange={handleChange} className="w-full border rounded-lg p-2">
                    <option value="">-- Pilih Program --</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Deskripsi Pekerjaan</label>
                  <textarea required name="deskripsi" onChange={handleChange} className="w-full border rounded-lg p-2 h-24" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Kualifikasi</label>
                  <textarea required name="kualifikasi" onChange={handleChange} className="w-full border rounded-lg p-2 h-24" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Divisi Penempatan</label>
                  <input required type="text" name="divisi" onChange={handleChange} className="w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Lokasi</label>
                  <input required type="text" name="lokasi" onChange={handleChange} className="w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kuota Penerimaan</label>
                  <input required type="number" name="kuota" onChange={handleChange} className="w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mode Kerja</label>
                  <select name="mode_kerja" onChange={handleChange} className="w-full border rounded-lg p-2">
                    <option value="WFO">Work From Office</option>
                    <option value="WFH">Work From Home</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-4 space-x-3 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Simpan Lowongan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManajemenLowongan;
