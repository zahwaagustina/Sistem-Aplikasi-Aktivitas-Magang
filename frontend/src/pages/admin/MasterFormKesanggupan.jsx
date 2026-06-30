import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiCheck, FiArrowUp, FiArrowDown
} from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MasterFormKesanggupan = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showFormModal, setShowFormModal] = useState(false);
  const [currentForm, setCurrentForm] = useState({ judul: '', deskripsi: '', is_active: false });
  const [isEditingForm, setIsEditingForm] = useState(false);

  const [selectedForm, setSelectedForm] = useState(null); // untuk manage pertanyaan

  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    pertanyaan: '',
    tipe_pertanyaan: 'SHORT_TEXT',
    is_required: true,
    opsi: [''] // for radio, checkbox, dropdown
  });
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/dynamic-forms/admin/forms?tipe=KESANGGUPAN`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForms(res.data.data);
      if (selectedForm) {
        const updatedSelected = res.data.data.find(f => f.id === selectedForm.id);
        if (updatedSelected) setSelectedForm(updatedSelected);
      }
    } catch (error) {
      toast.error('Gagal mengambil data form');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = { ...currentForm, tipe: 'KESANGGUPAN' };
      if (isEditingForm) {
        await axios.put(`${API_URL}/dynamic-forms/admin/forms/${currentForm.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Form berhasil diupdate');
      } else {
        await axios.post(`${API_URL}/dynamic-forms/admin/forms`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Form berhasil dibuat');
      }
      setShowFormModal(false);
      fetchForms();
    } catch (error) {
      toast.error('Gagal menyimpan form');
    }
  };

  const handleDeleteForm = async (id) => {
    if (!window.confirm('Yakin ingin menghapus form ini beserta semua pertanyaannya?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/dynamic-forms/admin/forms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Form berhasil dihapus');
      if (selectedForm && selectedForm.id === id) setSelectedForm(null);
      fetchForms();
    } catch (error) {
      toast.error('Gagal menghapus form');
    }
  };

  const handleToggleActiveForm = async (form) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/dynamic-forms/admin/forms/${form.id}`, {
        judul: form.judul,
        deskripsi: form.deskripsi,
        tipe: 'KESANGGUPAN',
        is_active: !form.is_active
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Form berhasil ${!form.is_active ? 'diaktifkan' : 'dinonaktifkan'}`);
      fetchForms();
    } catch (error) {
      toast.error('Gagal mengupdate status form');
    }
  };

  // --- QUESTION MANAGEMENT ---

  const openAddQuestion = () => {
    setCurrentQuestion({ pertanyaan: '', tipe_pertanyaan: 'SHORT_TEXT', is_required: true, opsi: [''] });
    setIsEditingQuestion(false);
    setShowQuestionModal(true);
  };

  const openEditQuestion = (q) => {
    setCurrentQuestion({
      id: q.id,
      pertanyaan: q.pertanyaan,
      tipe_pertanyaan: q.tipe_pertanyaan,
      is_required: q.is_required,
      opsi: q.opsi_json ? JSON.parse(q.opsi_json) : ['']
    });
    setIsEditingQuestion(true);
    setShowQuestionModal(true);
  };

  const handleAddOption = () => {
    setCurrentQuestion({ ...currentQuestion, opsi: [...currentQuestion.opsi, ''] });
  };

  const handleOptionChange = (index, value) => {
    const newOpsi = [...currentQuestion.opsi];
    newOpsi[index] = value;
    setCurrentQuestion({ ...currentQuestion, opsi: newOpsi });
  };

  const handleRemoveOption = (index) => {
    const newOpsi = currentQuestion.opsi.filter((_, i) => i !== index);
    setCurrentQuestion({ ...currentQuestion, opsi: newOpsi.length ? newOpsi : [''] });
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const requiresOptions = ['RADIO', 'CHECKBOX', 'DROPDOWN'].includes(currentQuestion.tipe_pertanyaan);
      const payload = {
        pertanyaan: currentQuestion.pertanyaan,
        tipe_pertanyaan: currentQuestion.tipe_pertanyaan,
        is_required: currentQuestion.is_required,
        opsi_json: requiresOptions ? JSON.stringify(currentQuestion.opsi.filter(o => o.trim() !== '')) : null,
        urutan: isEditingQuestion ? undefined : selectedForm.pertanyaan.length + 1
      };

      if (isEditingQuestion) {
        await axios.put(`${API_URL}/dynamic-forms/admin/questions/${currentQuestion.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Pertanyaan berhasil diupdate');
      } else {
        await axios.post(`${API_URL}/dynamic-forms/admin/forms/${selectedForm.id}/questions`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Pertanyaan berhasil ditambahkan');
      }
      setShowQuestionModal(false);
      fetchForms();
    } catch (error) {
      toast.error('Gagal menyimpan pertanyaan');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Yakin ingin menghapus pertanyaan ini?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/dynamic-forms/admin/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Pertanyaan berhasil dihapus');
      fetchForms();
    } catch (error) {
      toast.error('Gagal menghapus pertanyaan');
    }
  };

  const handleMoveQuestion = async (index, direction) => {
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === selectedForm.pertanyaan.length - 1) return;

    const newQuestions = [...selectedForm.pertanyaan];
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[index + direction];
    newQuestions[index + direction] = temp;

    const orders = newQuestions.map((q, i) => ({ id: q.id, urutan: i + 1 }));
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/dynamic-forms/admin/forms/${selectedForm.id}/questions/reorder`, { orders }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchForms();
    } catch (error) {
      toast.error('Gagal mengubah urutan');
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Master Form Kesanggupan</h1>
          <p className="text-gray-600">Kelola form dan pertanyaan secara dinamis</p>
        </div>
        <button
          onClick={() => {
            setCurrentForm({ judul: '', deskripsi: '', is_active: false });
            setIsEditingForm(false);
            setShowFormModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <FiPlus className="mr-2" /> Buat Form Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolom Kiri: Daftar Form */}
        <div className="col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Daftar Form</h2>
          {forms.length === 0 ? (
            <div className="text-center text-gray-500 py-8">Belum ada form.</div>
          ) : (
            <div className="space-y-3">
              {forms.map(form => (
                <div
                  key={form.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedForm?.id === form.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  onClick={() => setSelectedForm(form)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{form.judul}</h3>
                      <p className="text-xs text-gray-500 line-clamp-1">{form.deskripsi}</p>
                    </div>
                    <div className="flex flex-col gap-1 items-end ml-2">
                      <span className={`px-2 py-1 text-[10px] rounded-full font-medium ${form.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {form.is_active ? 'Aktif' : 'Draft'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleActiveForm(form); }}
                      className={`text-xs px-2 py-1 rounded border ${form.is_active ? 'text-orange-600 border-orange-200 hover:bg-orange-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}
                    >
                      {form.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentForm(form);
                          setIsEditingForm(true);
                          setShowFormModal(true);
                        }}
                        className="text-gray-500 hover:text-blue-600"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteForm(form.id);
                        }}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Detail & Pertanyaan */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {selectedForm ? (
            <div>
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedForm.judul}</h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedForm.deskripsi}</p>
                </div>
                <button
                  onClick={openAddQuestion}
                  className="bg-indigo-50 text-indigo-600 border border-indigo-200 px-3 py-2 rounded-lg flex items-center hover:bg-indigo-100 transition-colors text-sm font-medium"
                >
                  <FiPlus className="mr-1" /> Tambah Pertanyaan
                </button>
              </div>

              {selectedForm.pertanyaan.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p>Belum ada pertanyaan pada form ini.</p>
                  <button onClick={openAddQuestion} className="text-indigo-600 mt-2 font-medium hover:underline">Tambah Sekarang</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedForm.pertanyaan.map((q, index) => (
                    <div key={q.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex gap-4 hover:border-indigo-300 transition-colors group">
                      <div className="flex flex-col gap-1 items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleMoveQuestion(index, -1)} disabled={index === 0} className="hover:text-indigo-600 disabled:opacity-30"><FiArrowUp size={16} /></button>
                        <span className="text-xs font-mono">{index + 1}</span>
                        <button onClick={() => handleMoveQuestion(index, 1)} disabled={index === selectedForm.pertanyaan.length - 1} className="hover:text-indigo-600 disabled:opacity-30"><FiArrowDown size={16} /></button>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-800 text-lg">
                            {q.pertanyaan} 
                            {q.is_required && <span className="text-red-500 ml-1" title="Wajib Diisi">*</span>}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-2 py-1 bg-gray-200 text-gray-600 rounded uppercase font-bold tracking-wider">
                              {q.tipe_pertanyaan.replace('_', ' ')}
                            </span>
                            <button onClick={() => openEditQuestion(q)} className="text-gray-400 hover:text-blue-600 p-1"><FiEdit2 size={16} /></button>
                            <button onClick={() => handleDeleteQuestion(q.id)} className="text-gray-400 hover:text-red-600 p-1"><FiTrash2 size={16} /></button>
                          </div>
                        </div>
                        
                        {/* Preview Preview Field */}
                        <div className="mt-3 opacity-70 pointer-events-none">
                          {q.tipe_pertanyaan === 'SHORT_TEXT' && <input type="text" disabled className="w-full border-gray-300 rounded-md shadow-sm bg-white p-2 text-sm" placeholder="Jawaban singkat..." />}
                          {q.tipe_pertanyaan === 'PARAGRAPH' && <textarea disabled className="w-full border-gray-300 rounded-md shadow-sm bg-white p-2 text-sm h-16" placeholder="Jawaban panjang..."></textarea>}
                          {q.tipe_pertanyaan === 'DATE' && <input type="date" disabled className="border-gray-300 rounded-md shadow-sm bg-white p-2 text-sm" />}
                          {['RADIO', 'CHECKBOX'].includes(q.tipe_pertanyaan) && q.opsi_json && (
                            <div className="space-y-1">
                              {JSON.parse(q.opsi_json).map((opt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <input type={q.tipe_pertanyaan === 'RADIO' ? 'radio' : 'checkbox'} disabled className="border-gray-300" />
                                  <span className="text-sm text-gray-600">{opt}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {q.tipe_pertanyaan === 'DROPDOWN' && q.opsi_json && (
                            <select disabled className="border-gray-300 rounded-md shadow-sm bg-white p-2 text-sm w-full md:w-1/2">
                              <option>Pilih salah satu...</option>
                              {JSON.parse(q.opsi_json).map((opt, i) => (
                                <option key={i}>{opt}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 min-h-[400px]">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FiEdit2 size={32} className="text-gray-300" />
              </div>
              <p className="text-lg">Pilih form di sebelah kiri untuk mengelola pertanyaan</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL FORM */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">{isEditingForm ? 'Edit Form' : 'Buat Form Baru'}</h3>
              <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <FiX size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveForm} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Form</label>
                <input
                  type="text"
                  required
                  value={currentForm.judul}
                  onChange={(e) => setCurrentForm({ ...currentForm, judul: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Misal: Form Kesanggupan Magang"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={currentForm.deskripsi}
                  onChange={(e) => setCurrentForm({ ...currentForm, deskripsi: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Penjelasan singkat form ini..."
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={currentForm.is_active}
                  onChange={(e) => setCurrentForm({ ...currentForm, is_active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Set sebagai form aktif (Akan menonaktifkan form kesanggupan lain)
                </label>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowFormModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center transition-colors">
                  <FiSave className="mr-2" /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PERTANYAAN */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up my-8">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">{isEditingQuestion ? 'Edit Pertanyaan' : 'Tambah Pertanyaan'}</h3>
              <button onClick={() => setShowQuestionModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <FiX size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveQuestion} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pertanyaan</label>
                <textarea
                  required
                  value={currentQuestion.pertanyaan}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, pertanyaan: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Tuliskan pertanyaan Anda..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Pertanyaan</label>
                  <select
                    value={currentQuestion.tipe_pertanyaan}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, tipe_pertanyaan: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="SHORT_TEXT">Teks Pendek</option>
                    <option value="PARAGRAPH">Paragraf</option>
                    <option value="RADIO">Pilihan Ganda (Satu Jawaban)</option>
                    <option value="CHECKBOX">Kotak Centang (Banyak Jawaban)</option>
                    <option value="DROPDOWN">Dropdown</option>
                    <option value="DATE">Tanggal</option>
                  </select>
                </div>
                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    id="isRequired"
                    checked={currentQuestion.is_required}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, is_required: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isRequired" className="ml-2 block text-sm font-medium text-gray-900">
                    Wajib Diisi (Required)
                  </label>
                </div>
              </div>

              {['RADIO', 'CHECKBOX', 'DROPDOWN'].includes(currentQuestion.tipe_pertanyaan) && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Opsi Jawaban</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {currentQuestion.opsi.map((opt, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={(e) => handleOptionChange(i, e.target.value)}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                          placeholder={`Opsi ${i + 1}`}
                        />
                        <button type="button" onClick={() => handleRemoveOption(i)} className="text-red-500 hover:text-red-700 p-1.5 bg-white border border-gray-200 rounded-md"><FiTrash2 /></button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="mt-3 text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center"
                  >
                    <FiPlus className="mr-1" /> Tambah Opsi Lain
                  </button>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t">
                <button type="button" onClick={() => setShowQuestionModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Batal</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center">
                  <FiCheck className="mr-2" /> Simpan Pertanyaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MasterFormKesanggupan;
