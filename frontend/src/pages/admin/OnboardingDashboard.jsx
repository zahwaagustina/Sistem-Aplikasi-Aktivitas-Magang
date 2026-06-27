import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, CheckCircle, Clock, XCircle, ArrowRight, UserPlus, Upload, MapPin, Search } from 'lucide-react';
import api from '../../api';

const STEPS = [
  { id: 'WAITING_CONFIRMATION', label: 'Menunggu Konfirmasi' },
  { id: 'REJECTED_BY_CANDIDATE', label: 'Ditolak' },
  { id: 'DOCUMENT_VERIFICATION', label: 'Verifikasi Dokumen' },
  { id: 'DOCUMENT_REVISION', label: 'Revisi Dokumen' },
  { id: 'LOA_ISSUED', label: 'LoA Diterbitkan' },
  { id: 'PLACEMENT_ASSIGNED', label: 'Penempatan' },
  { id: 'ACCOUNT_CREATED', label: 'Akun Dibuat' },
  { id: 'CHECKLIST_IN_PROGRESS', label: 'Menunggu Orientasi' },
  { id: 'ORIENTATION_SCHEDULED', label: 'Jadwal Orientasi' },
  { id: 'COMPLETED', label: 'Selesai' }
];

const OnboardingDashboard = () => {
  const { user } = useAuth();
  const [onboardings, setOnboardings] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  
  // Modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(''); // 'VERIFY_DOCS', 'ISSUE_LOA', 'PLACEMENT', 'ORIENTATION'
  
  const [formData, setFormData] = useState({});
  
  // Revision states
  const [isRevising, setIsRevising] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');
  const [revisionDocs, setRevisionDocs] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resOnb = await api.get('/onboarding/all');
      setOnboardings(resOnb.data.data);
    } catch (err) {
      console.error('Error fetching onboardings:', err);
    }
    
    try {
      const resMentors = await api.get('/hr/mentors');
      setMentors(resMentors.data.data);
    } catch (err) {
      console.error('Error fetching mentors:', err);
      // It's ok if mentors fail, we still want to see onboardings
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item, type) => {
    setSelectedItem(item);
    setModalType(type);
    setFormData({});
    setIsRevising(false);
    setRevisionNote('');
    setRevisionDocs([]);
    if (type === 'PLACEMENT') {
      setFormData({ divisi: item.pendaftaran.lowongan.divisi, mentor_id: '' });
    } else if (type === 'ORIENTATION') {
      setFormData({ lokasi_orientasi: 'https://maps.app.goo.gl/jytpY2D48Qra8kWS7' }); // Tautan otomatis asli PCS
    }
  };

  const handleVerifyDocs = async (approved) => {
    if (!approved && (!revisionNote || revisionDocs.length === 0)) {
      alert('Harap isi catatan revisi dan pilih minimal satu dokumen yang perlu direvisi.');
      return;
    }
    try {
      await api.put(`/onboarding/${selectedItem.id}/verify-docs`, { 
        approved, 
        catatan_revisi: revisionNote, 
        dokumen_revisi: revisionDocs 
      });
      alert(approved ? 'Dokumen disetujui' : 'Revisi diminta');
      setModalType('');
      fetchData();
    } catch (e) { alert('Error: ' + e.message); }
  };

  const handleToggleDocRevision = (docType) => {
    setRevisionDocs(prev => 
      prev.includes(docType) ? prev.filter(d => d !== docType) : [...prev, docType]
    );
  };

  const handleIssueLoa = async (item) => {
    try {
      const npm = item.pendaftaran.user.profilKandidat?.npm || '';
      await api.post(`/onboarding/${item.id}/issue-loa`, { npm });
      alert('LoA berhasil diterbitkan secara otomatis');
      fetchData();
    } catch (e) { alert('Error: ' + e.message); }
  };

  const handlePlacement = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/onboarding/${selectedItem.id}/assign-placement`, formData);
      alert('Penempatan berhasil disimpan dan Akun Magang kandidat otomatis ter-upgrade!');
      setModalType('');
      fetchData();
    } catch (e) { alert('Error: ' + e.message); }
  };

  const handleOrientation = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/onboarding/${selectedItem.id}/schedule-orientation`, formData);
      alert('Jadwal orientasi berhasil disimpan');
      setModalType('');
      fetchData();
    } catch (e) { alert('Error: ' + e.message); }
  };

  const filtered = onboardings.filter(o => activeTab === 'ALL' || o.status === activeTab);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manajemen Onboarding</h2>
          <p className="text-gray-500 mt-1">Kelola proses orientasi dan verifikasi dokumen kandidat yang diterima.</p>
        </div>
      </div>

      <div className="flex overflow-x-auto space-x-2 pb-4 mb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <button onClick={() => setActiveTab('ALL')} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'ALL' ? 'bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow-sm' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>Semua Proses</button>
        {STEPS.map(s => (
          <button key={s.id} onClick={() => setActiveTab(s.id)} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === s.id ? 'bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow-sm' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {loading ? <div className="text-center py-12">Memuat data...</div> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kandidat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posisi / Divisi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Onboarding</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">Tidak ada data onboarding untuk filter ini.</td></tr>
              ) : filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{item.pendaftaran.user.nama}</div>
                    <div className="text-sm text-gray-500">{item.pendaftaran.user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{item.pendaftaran.lowongan.posisi}</div>
                    <div className="text-sm text-gray-500">{item.divisi || item.pendaftaran.lowongan.divisi}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {STEPS.find(s => s.id === item.status)?.label || item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {item.status === 'DOCUMENT_VERIFICATION' && (
                        <button onClick={() => openModal(item, 'VERIFY_DOCS')} className="whitespace-nowrap text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-medium">Verifikasi Dokumen</button>
                      )}
                      {!item.pendaftaran.user.dokumen?.some(d => d.tipe === 'LOA') && ['LOA_ISSUED', 'PLACEMENT_ASSIGNED', 'ACCOUNT_CREATED', 'CHECKLIST_IN_PROGRESS', 'ORIENTATION_SCHEDULED'].includes(item.status) ? (
                        <button onClick={() => handleIssueLoa(item)} className="whitespace-nowrap text-sm bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-100 font-medium">Terbitkan LoA</button>
                      ) : item.pendaftaran.user.dokumen?.some(d => d.tipe === 'LOA') ? (
                        <button onClick={() => handleIssueLoa(item)} className="whitespace-nowrap text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium">Cetak Ulang LoA</button>
                      ) : null}
                      {(item.status === 'LOA_ISSUED' || item.status === 'PLACEMENT_ASSIGNED' || item.status === 'ACCOUNT_CREATED') && (
                        <button onClick={() => openModal(item, 'PLACEMENT')} className="whitespace-nowrap text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-medium">Atur Penempatan</button>
                      )}
                      {item.status === 'CHECKLIST_IN_PROGRESS' && (
                        <button onClick={() => openModal(item, 'ORIENTATION')} className="whitespace-nowrap text-sm bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-100 font-medium">Jadwal Orientasi</button>
                      )}
                      {['WAITING_CONFIRMATION', 'REJECTED_BY_CANDIDATE'].includes(item.status) && (
                        <span className="whitespace-nowrap text-sm text-gray-400 italic">Menunggu Kandidat</span>
                      )}
                      {['ORIENTATION_SCHEDULED', 'COMPLETED'].includes(item.status) && (
                        <span className="whitespace-nowrap text-sm text-emerald-600 font-bold"><CheckCircle size={16} className="inline mr-1" /> Selesai</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {modalType && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
              <h3 className="font-bold text-gray-800">
                {modalType === 'VERIFY_DOCS' && 'Verifikasi Dokumen'}
                {modalType === 'PLACEMENT' && 'Atur Penempatan'}
                {modalType === 'ORIENTATION' && 'Jadwalkan Orientasi'}
              </h3>
              <button onClick={() => setModalType('')} className="text-gray-400 hover:text-gray-600"><XCircle size={20} /></button>
            </div>

            <div className="p-6 overflow-y-auto">
              {modalType === 'VERIFY_DOCS' && (
                <div>
                  <p className="text-gray-600 mb-4">Periksa dokumen yang telah diunggah oleh <b>{selectedItem.pendaftaran.user.nama}</b>.</p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm font-medium text-gray-700">
                        <FileText size={16} className="text-indigo-500 mr-2" />
                        Kartu Tanda Penduduk (KTP)
                      </div>
                      {selectedItem.pendaftaran.user.dokumen?.find(d => d.tipe === 'KTP') ? (
                        <a href={`http://localhost:5000${selectedItem.pendaftaran.user.dokumen.find(d => d.tipe === 'KTP').file_path}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-medium">
                          Buka PDF/Gambar
                        </a>
                      ) : (
                        <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded">Belum Diunggah</span>
                      )}
                    </div>
                    {selectedItem.pendaftaran.user.profilKandidat?.cv_path && (
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-3">
                        <div className="flex items-center text-sm font-medium text-gray-700">
                          <FileText size={16} className="text-emerald-500 mr-2" />
                          Curriculum Vitae (CV)
                        </div>
                        <a href={`http://localhost:5000${selectedItem.pendaftaran.user.profilKandidat.cv_path}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-medium">
                          Buka PDF
                        </a>
                      </div>
                    )}

                    {selectedItem.pendaftaran.user.dokumen?.find(d => d.tipe === 'TRANSKRIP') && (
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-3">
                        <div className="flex items-center text-sm font-medium text-gray-700">
                          <FileText size={16} className="text-emerald-500 mr-2" />
                          Transkrip Nilai Akademik
                        </div>
                        <a href={`http://localhost:5000${selectedItem.pendaftaran.user.dokumen.find(d => d.tipe === 'TRANSKRIP').file_path}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-medium">
                          Buka PDF
                        </a>
                      </div>
                    )}

                    {selectedItem.pendaftaran.user.profilKandidat?.portofolio_url && (
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-3">
                        <div className="flex items-center text-sm font-medium text-gray-700">
                          <FileText size={16} className="text-emerald-500 mr-2" />
                          Link Portofolio
                        </div>
                        <a href={selectedItem.pendaftaran.user.profilKandidat.portofolio_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-medium">
                          Kunjungi URL
                        </a>
                      </div>
                    )}
                    
                    {selectedItem.pendaftaran.user.dokumen?.find(d => d.tipe === 'SURAT_PENGANTAR') ? (
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-3">
                        <div className="flex items-center text-sm font-medium text-gray-700">
                          <FileText size={16} className="text-emerald-500 mr-2" />
                          Surat Pengantar Kampus
                        </div>
                        <a href={`http://localhost:5000${selectedItem.pendaftaran.user.dokumen.find(d => d.tipe === 'SURAT_PENGANTAR').file_path}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-medium">
                          Buka PDF
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-3">
                        <div className="flex items-center text-sm font-medium text-gray-700">
                          <FileText size={16} className="text-emerald-500 mr-2" />
                          Surat Pengantar Kampus
                        </div>
                        <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded">Belum Diunggah</span>
                      </div>
                    )}

                    {selectedItem.pendaftaran.user.dokumen?.find(d => d.tipe === 'SURAT_KERJASAMA') && (
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-3">
                        <div className="flex items-center text-sm font-medium text-gray-700">
                          <FileText size={16} className="text-emerald-500 mr-2" />
                          Surat Kerja Sama Kampus
                        </div>
                        <a href={`http://localhost:5000${selectedItem.pendaftaran.user.dokumen.find(d => d.tipe === 'SURAT_KERJASAMA').file_path}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-medium">
                          Buka PDF
                        </a>
                      </div>
                    )}
                  </div>

                  {!isRevising ? (
                    <div className="flex space-x-3">
                      <button onClick={() => setIsRevising(true)} className="flex-1 px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100">Minta Revisi</button>
                      <button onClick={() => handleVerifyDocs(true)} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">Setujui Dokumen</button>
                    </div>
                  ) : (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                      <h4 className="font-bold text-red-800 mb-3 text-sm">Form Permintaan Revisi</h4>
                      
                      <div className="mb-3">
                        <label className="block text-xs font-bold text-red-700 mb-1">Catatan Revisi *</label>
                        <textarea 
                          rows="3" 
                          required
                          value={revisionNote}
                          onChange={(e) => setRevisionNote(e.target.value)}
                          placeholder="Contoh: KTP tidak terbaca jelas, mohon upload foto yang lebih terang."
                          className="w-full p-2 border border-red-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-red-200"
                        ></textarea>
                      </div>

                      <div className="mb-4">
                        <label className="block text-xs font-bold text-red-700 mb-2">Dokumen yang perlu direvisi *</label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input type="checkbox" checked={revisionDocs.includes('KTP')} onChange={() => handleToggleDocRevision('KTP')} className="mr-2 text-red-600 rounded" />
                            <span className="text-sm text-gray-700">KTM / KTP</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" checked={revisionDocs.includes('SURAT_PENGANTAR')} onChange={() => handleToggleDocRevision('SURAT_PENGANTAR')} className="mr-2 text-red-600 rounded" />
                            <span className="text-sm text-gray-700">Surat Pengantar Kampus</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" checked={revisionDocs.includes('SURAT_KERJASAMA')} onChange={() => handleToggleDocRevision('SURAT_KERJASAMA')} className="mr-2 text-red-600 rounded" />
                            <span className="text-sm text-gray-700">Surat Kerja Sama (Opsional)</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex space-x-2 justify-end">
                        <button onClick={() => setIsRevising(false)} className="px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-md text-sm font-medium hover:bg-red-50">Batal</button>
                        <button onClick={() => handleVerifyDocs(false)} className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">Kirim Permintaan Revisi</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {modalType === 'PLACEMENT' && (
                <form onSubmit={handlePlacement} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Divisi / Unit</label>
                    <input type="text" required value={formData.divisi || ''} onChange={e => setFormData({...formData, divisi: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mentor / Pembimbing</label>
                    <select required value={formData.mentor_id || ''} onChange={e => setFormData({...formData, mentor_id: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2">
                      <option value="">-- Pilih Mentor --</option>
                      {mentors.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Simpan Penempatan</button>
                </form>
              )}

              {modalType === 'ORIENTATION' && (
                <form onSubmit={handleOrientation} className="space-y-4">
                  <p className="text-gray-600 mb-2">Masa pengenalan awal</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal & Waktu Orientasi</label>
                    <input type="datetime-local" required value={formData.jadwal_orientasi || ''} onChange={e => setFormData({...formData, jadwal_orientasi: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Share Location (Google Maps URL)</label>
                    <input type="url" value={formData.lokasi_orientasi || ''} onChange={e => setFormData({...formData, lokasi_orientasi: e.target.value})} placeholder="https://maps.app.goo.gl/..." className="w-full border border-gray-300 rounded-lg p-2" />
                  </div>
                  <button type="submit" className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Jadwalkan Orientasi</button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingDashboard;
