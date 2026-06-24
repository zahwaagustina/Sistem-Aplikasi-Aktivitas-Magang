import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import api from '../../api';

const MasterEvaluasi = () => {
  const [aspekList, setAspekList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Aspek
  const [showAspekModal, setShowAspekModal] = useState(false);
  const [editAspekId, setEditAspekId] = useState(null);
  const [formAspek, setFormAspek] = useState({ nama: '', bobot: '', is_active: true });

  // Form Pertanyaan
  const [showPertanyaanModal, setShowPertanyaanModal] = useState(false);
  const [editPertanyaanId, setEditPertanyaanId] = useState(null);
  const [formPertanyaan, setFormPertanyaan] = useState({ aspek_id: '', pertanyaan: '', is_active: true });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/evaluasi-aspek');
      setAspekList(res.data.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
      alert('Gagal memuat data master evaluasi');
    } finally {
      setLoading(false);
    }
  };

  // --- ASPEK HANDLERS ---
  const handleSaveAspek = async (e) => {
    e.preventDefault();
    try {
      if (editAspekId) {
        await api.put(`/admin/evaluasi-aspek/${editAspekId}`, formAspek);
      } else {
        await api.post('/admin/evaluasi-aspek', formAspek);
      }
      setShowAspekModal(false);
      fetchData();
    } catch (err) {
      alert('Gagal menyimpan aspek');
    }
  };

  const handleDeleteAspek = async (id) => {
    if (window.confirm('Yakin ingin menghapus aspek ini? Semua pertanyaan di dalamnya akan terhapus.')) {
      try {
        await api.delete(`/admin/evaluasi-aspek/${id}`);
        fetchData();
      } catch (err) {
        alert('Gagal menghapus aspek');
      }
    }
  };

  const openAspekModal = (aspek = null) => {
    if (aspek) {
      setEditAspekId(aspek.id);
      setFormAspek({ nama: aspek.nama, bobot: aspek.bobot, is_active: aspek.is_active });
    } else {
      setEditAspekId(null);
      setFormAspek({ nama: '', bobot: '', is_active: true });
    }
    setShowAspekModal(true);
  };

  // --- PERTANYAAN HANDLERS ---
  const handleSavePertanyaan = async (e) => {
    e.preventDefault();
    try {
      if (editPertanyaanId) {
        await api.put(`/admin/evaluasi-pertanyaan/${editPertanyaanId}`, formPertanyaan);
      } else {
        await api.post('/admin/evaluasi-pertanyaan', formPertanyaan);
      }
      setShowPertanyaanModal(false);
      fetchData();
    } catch (err) {
      alert('Gagal menyimpan pertanyaan');
    }
  };

  const handleDeletePertanyaan = async (id) => {
    if (window.confirm('Yakin ingin menghapus pertanyaan ini?')) {
      try {
        await api.delete(`/admin/evaluasi-pertanyaan/${id}`);
        fetchData();
      } catch (err) {
        alert('Gagal menghapus pertanyaan');
      }
    }
  };

  const openPertanyaanModal = (aspekId, pertanyaan = null) => {
    if (pertanyaan) {
      setEditPertanyaanId(pertanyaan.id);
      setFormPertanyaan({ aspek_id: aspekId, pertanyaan: pertanyaan.pertanyaan, is_active: pertanyaan.is_active });
    } else {
      setEditPertanyaanId(null);
      setFormPertanyaan({ aspek_id: aspekId, pertanyaan: '', is_active: true });
    }
    setShowPertanyaanModal(true);
  };

  const totalBobot = aspekList.reduce((sum, a) => sum + (a.is_active ? parseFloat(a.bobot) : 0), 0);

  if (loading) return <div className="p-8 text-center">Memuat data...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Master Evaluasi</h1>
          <p className="text-gray-500 mt-1">Kelola aspek dan pertanyaan penilaian evaluasi kinerja magang secara dinamis.</p>
        </div>
        <div className="text-right">
          <div className={`text-sm font-bold ${totalBobot !== 100 ? 'text-red-500' : 'text-green-500'}`}>
            Total Bobot Aktif: {totalBobot}%
          </div>
          {totalBobot !== 100 && <div className="text-xs text-red-500">Peringatan: Total bobot aktif harus 100%</div>}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Daftar Aspek Penilaian</h2>
        <button 
          onClick={() => openAspekModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah Aspek
        </button>
      </div>

      <div className="space-y-6">
        {aspekList.length === 0 && (
          <div className="bg-white p-8 text-center text-gray-500 rounded-xl shadow-sm border border-gray-100">
            Belum ada aspek penilaian.
          </div>
        )}

        {aspekList.map(aspek => (
          <div key={aspek.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${!aspek.is_active ? 'opacity-70' : ''}`}>
            <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                  {aspek.nama} <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-sm">{aspek.bobot}%</span>
                  {!aspek.is_active && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">Nonaktif</span>}
                </h3>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openPertanyaanModal(aspek.id)} className="p-2 text-green-600 hover:bg-green-50 rounded" title="Tambah Pertanyaan">
                  <Plus className="w-4 h-4" />
                </button>
                <button onClick={() => openAspekModal(aspek)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded" title="Edit Aspek">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeleteAspek(aspek.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Hapus Aspek">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 font-medium">Pertanyaan</th>
                    <th className="px-4 py-3 font-medium w-24">Status</th>
                    <th className="px-4 py-3 font-medium w-24 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {aspek.pertanyaan.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-4 py-4 text-center text-gray-500">Belum ada pertanyaan untuk aspek ini.</td>
                    </tr>
                  ) : (
                    aspek.pertanyaan.map(p => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className={`px-4 py-3 text-gray-700 ${!p.is_active ? 'line-through text-gray-400' : ''}`}>{p.pertanyaan}</td>
                        <td className="px-4 py-3">
                          {p.is_active ? (
                            <span className="text-green-600 flex items-center gap-1 text-xs"><CheckCircle className="w-3 h-3" /> Aktif</span>
                          ) : (
                            <span className="text-red-500 flex items-center gap-1 text-xs"><XCircle className="w-3 h-3" /> Nonaktif</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button onClick={() => openPertanyaanModal(aspek.id, p)} className="text-indigo-600 hover:text-indigo-800"><Edit2 className="w-3.5 h-3.5 inline" /></button>
                          <button onClick={() => handleDeletePertanyaan(p.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-3.5 h-3.5 inline" /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Aspek */}
      {showAspekModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">{editAspekId ? 'Edit Aspek' : 'Tambah Aspek Baru'}</h3>
              <button onClick={() => setShowAspekModal(false)}><XCircle className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleSaveAspek} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Aspek</label>
                <input 
                  type="text" required
                  value={formAspek.nama} onChange={(e) => setFormAspek({...formAspek, nama: e.target.value})}
                  className="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bobot (%)</label>
                <input 
                  type="number" required min="1" max="100"
                  value={formAspek.bobot} onChange={(e) => setFormAspek({...formAspek, bobot: e.target.value})}
                  className="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center mt-4">
                <input 
                  type="checkbox" id="activeAspek"
                  checked={formAspek.is_active} onChange={(e) => setFormAspek({...formAspek, is_active: e.target.checked})}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-2"
                />
                <label htmlFor="activeAspek" className="text-sm font-medium text-gray-700">Aktif digunakan</label>
              </div>
              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAspekModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Batal</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pertanyaan */}
      {showPertanyaanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">{editPertanyaanId ? 'Edit Pertanyaan' : 'Tambah Pertanyaan Baru'}</h3>
              <button onClick={() => setShowPertanyaanModal(false)}><XCircle className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleSavePertanyaan} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pertanyaan / Indikator</label>
                <textarea 
                  required rows="3"
                  value={formPertanyaan.pertanyaan} onChange={(e) => setFormPertanyaan({...formPertanyaan, pertanyaan: e.target.value})}
                  className="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Contoh: Disiplin dan kepatuhan terhadap aturan"
                ></textarea>
              </div>
              <div className="flex items-center mt-4">
                <input 
                  type="checkbox" id="activePertanyaan"
                  checked={formPertanyaan.is_active} onChange={(e) => setFormPertanyaan({...formPertanyaan, is_active: e.target.checked})}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-2"
                />
                <label htmlFor="activePertanyaan" className="text-sm font-medium text-gray-700">Aktif digunakan</label>
              </div>
              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowPertanyaanModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Batal</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MasterEvaluasi;
