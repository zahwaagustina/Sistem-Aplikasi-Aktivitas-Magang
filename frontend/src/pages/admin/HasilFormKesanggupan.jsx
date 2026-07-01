import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Download, Search, Filter, Eye, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL}`;

const HasilFormKesanggupan = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [divisi, setDivisi] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal
  const [selectedResponse, setSelectedResponse] = useState(null);

  useEffect(() => {
    fetchResponses();
  }, [search, divisi, startDate, endDate]);

  const fetchResponses = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (divisi) params.append('divisi', divisi);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await axios.get(`${API_URL}/dynamic-forms/admin/responses?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResponses(res.data.data);
    } catch (error) {
      toast.error('Gagal mengambil data hasil form');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (divisi) params.append('divisi', divisi);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('format', format);

      const response = await axios.get(`${API_URL}/dynamic-forms/admin/responses/export?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Hasil_Form_Kesanggupan.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      toast.error(`Gagal mengekspor data ke ${format}`);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hasil Form Kesanggupan</h1>
          <p className="text-gray-600">Daftar kandidat yang telah mengisi form kesanggupan</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleExport('excel')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 shadow-sm"
          >
            <Download className="mr-2" /> Export Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-700 shadow-sm"
          >
            <Download className="mr-2" /> Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Cari Nama</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari kandidat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Divisi/Posisi</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Filter divisi..."
                value={divisi}
                onChange={(e) => setDivisi(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal Akhir</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="p-4 border-b font-medium">No</th>
                <th className="p-4 border-b font-medium">Kandidat</th>
                <th className="p-4 border-b font-medium">Posisi / Divisi</th>
                <th className="p-4 border-b font-medium">Form</th>
                <th className="p-4 border-b font-medium">Tgl Submit</th>
                <th className="p-4 border-b font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">Loading data...</td>
                </tr>
              ) : responses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Filter size={32} className="text-gray-300 mb-2" />
                      <p>Tidak ada data form kesanggupan ditemukan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                responses.map((r, index) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-600">{index + 1}</td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-800">{r.user.nama}</p>
                      <p className="text-xs text-gray-500">{r.user.email}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-700">{r.pendaftaran.lowongan.posisi}</p>
                      <p className="text-xs text-gray-500">{r.pendaftaran.lowongan.divisi}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{r.form.judul}</td>
                    <td className="p-4 text-sm text-gray-600">{new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedResponse(r)}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition-colors inline-flex items-center"
                        title="Lihat Detail Jawaban"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL */}
      {selectedResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Detail Form Kesanggupan</h3>
                <p className="text-xs text-gray-500">{selectedResponse.user.nama} - {selectedResponse.pendaftaran.lowongan.posisi}</p>
              </div>
              <button onClick={() => setSelectedResponse(null)} className="text-gray-400 hover:text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              <div className="space-y-6">
                {selectedResponse.jawaban.map((j, idx) => (
                  <div key={j.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="font-semibold text-gray-800 mb-2 flex items-start gap-2">
                      <span className="text-gray-400 font-mono text-sm mt-0.5">{idx + 1}.</span> 
                      {j.question.pertanyaan}
                    </p>
                    <div className="ml-6 text-gray-700 bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                      {j.jawaban_array && Array.isArray(j.jawaban_array) ? (
                        <ul className="list-disc ml-5 space-y-1">
                          {j.jawaban_array.map((ans, i) => <li key={i}>{ans}</li>)}
                        </ul>
                      ) : (
                        <p>{j.jawaban_teks || '-'}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-white rounded-b-xl flex justify-end">
              <button onClick={() => setSelectedResponse(null)} className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HasilFormKesanggupan;
