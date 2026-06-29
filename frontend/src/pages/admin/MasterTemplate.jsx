import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { Plus, Edit2, Trash2, Download, FileText, CheckCircle, XCircle } from 'lucide-react';

const MasterTemplate = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    nama_template: '',
    kategori: '',
    deskripsi: '',
    status: 'true'
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/templates');
      if (res.data.success) {
        setTemplates(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Validasi ukuran (Max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrorMsg('Ukuran file maksimal 10MB');
        e.target.value = '';
        setFile(null);
        return;
      }
      
      const allowedExt = ['.ppt', '.pptx', '.doc', '.docx', '.pdf', '.xls', '.xlsx'];
      const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (!allowedExt.includes(fileExt)) {
        setErrorMsg('Format file tidak didukung');
        e.target.value = '';
        setFile(null);
        return;
      }
      
      setErrorMsg('');
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_template || !formData.kategori) {
      setErrorMsg('Nama Template dan Kategori wajib diisi');
      return;
    }
    
    if (!formData.id && !file) {
      setErrorMsg('File wajib diunggah untuk template baru');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      
      const form = new FormData();
      form.append('nama_template', formData.nama_template);
      form.append('kategori', formData.kategori);
      form.append('deskripsi', formData.deskripsi);
      form.append('status', formData.status);
      
      if (file) {
        form.append('file', file);
      }

      if (formData.id) {
        await api.put(`/templates/${formData.id}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/templates', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setShowModal(false);
      resetForm();
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      setErrorMsg(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan template');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (template) => {
    setFormData({
      id: template.id,
      nama_template: template.nama_template,
      kategori: template.kategori,
      deskripsi: template.deskripsi || '',
      status: template.status.toString()
    });
    setFile(null);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus template ini?')) {
      try {
        await api.delete(`/templates/${id}`);
        fetchTemplates();
      } catch (error) {
        console.error('Error deleting template:', error);
        alert('Gagal menghapus template');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/templates/${id}/status`);
      fetchTemplates();
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Gagal mengubah status template');
    }
  };

  const handleDownload = async (id, nama_file) => {
    try {
      const response = await api.get(`/templates/download/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nama_file);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading:', error);
      alert('Gagal mengunduh file');
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      nama_template: '',
      kategori: '',
      deskripsi: '',
      status: 'true'
    });
    setFile(null);
    setErrorMsg('');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Master Template Dokumen</h1>
          <p className="text-slate-500">Kelola template dokumen yang dapat diunduh oleh peserta magang</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          <span>Tambah Template</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-semibold text-slate-700 w-16">No</th>
                <th className="p-4 font-semibold text-slate-700">Nama Template</th>
                <th className="p-4 font-semibold text-slate-700">Kategori</th>
                <th className="p-4 font-semibold text-slate-700">Deskripsi</th>
                <th className="p-4 font-semibold text-slate-700">Nama File</th>
                <th className="p-4 font-semibold text-slate-700">Status</th>
                <th className="p-4 font-semibold text-slate-700 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">Memuat data...</td>
                </tr>
              ) : templates.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">Belum ada template dokumen</td>
                </tr>
              ) : (
                templates.map((template, index) => (
                  <tr key={template.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 text-slate-600">{index + 1}</td>
                    <td className="p-4 font-medium text-slate-800">{template.nama_template}</td>
                    <td className="p-4 text-slate-600">
                      <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm">
                        {template.kategori}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs truncate" title={template.deskripsi}>
                      {template.deskripsi || '-'}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDownload(template.id, template.nama_file)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                        title="Unduh File"
                      >
                        <FileText size={16} />
                        <span className="text-sm underline truncate max-w-[150px]">{template.nama_file}</span>
                      </button>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(template.id)}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          template.status 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {template.status ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        <span>{template.status ? 'Aktif' : 'Tidak Aktif'}</span>
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => handleEdit(template)}
                          className="text-amber-500 hover:text-amber-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">
                {formData.id ? 'Edit Template' : 'Tambah Template Baru'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">
                  {errorMsg}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nama Template <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama_template"
                    value={formData.nama_template}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Format Laporan Mingguan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="kategori"
                    value={formData.kategori}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Laporan, Presentasi"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    name="deskripsi"
                    value={formData.deskripsi}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Penjelasan singkat tentang template ini..."
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Tidak Aktif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    File Template {formData.id ? '(Opsional)' : <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    accept=".ppt,.pptx,.doc,.docx,.pdf,.xls,.xlsx"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Format: PPT, DOC, PDF, XLS (Max 10MB)
                  </p>
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterTemplate;
