import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { Download, FileText, File, Search } from 'lucide-react';

const TemplateDokumen = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchActiveTemplates();
  }, []);

  const fetchActiveTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/templates/active');
      if (res.data.success) {
        setTemplates(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
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

  const getFileIcon = (ekstensi) => {
    switch (ekstensi) {
      case '.pdf':
        return <div className="p-3 bg-red-100 text-red-600 rounded-lg"><FileText size={24} /></div>;
      case '.doc':
      case '.docx':
        return <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><FileText size={24} /></div>;
      case '.xls':
      case '.xlsx':
        return <div className="p-3 bg-green-100 text-green-600 rounded-lg"><FileText size={24} /></div>;
      case '.ppt':
      case '.pptx':
        return <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><FileText size={24} /></div>;
      default:
        return <div className="p-3 bg-slate-100 text-slate-600 rounded-lg"><File size={24} /></div>;
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.nama_template.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Template Dokumen</h1>
        <p className="text-slate-500">Unduh format dokumen resmi untuk keperluan magang Anda</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            Memuat template dokumen...
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
            <FileText className="mx-auto h-12 w-12 text-slate-400 mb-3" />
            <p className="text-slate-500 font-medium">Tidak ada template yang tersedia</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="flex items-start space-x-4 mb-4">
                  {getFileIcon(template.ekstensi)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 line-clamp-2" title={template.nama_template}>
                      {template.nama_template}
                    </h3>
                    <span className="inline-block px-2 py-0.5 mt-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                      {template.kategori}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 line-clamp-3 mb-6 flex-grow" title={template.deskripsi}>
                  {template.deskripsi || 'Tidak ada deskripsi.'}
                </p>
                
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-500 truncate max-w-[150px]" title={template.nama_file}>
                    {template.ekstensi.toUpperCase().replace('.', '')} • {(template.ukuran_file / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <button
                    onClick={() => handleDownload(template.id, template.nama_file)}
                    className="flex items-center space-x-1.5 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Download size={16} />
                    <span>Unduh</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateDokumen;
