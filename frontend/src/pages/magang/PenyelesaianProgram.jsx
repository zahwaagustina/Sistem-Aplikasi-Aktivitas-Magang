import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, Clock, AlertCircle, Download, Award } from 'lucide-react';
import api from '../../api';

const PenyelesaianProgram = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/magang/status');
      setData(res.data.data);
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('laporan', file);

    setUploading(true);
    try {
      await api.post('/magang/upload-laporan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Laporan akhir berhasil diunggah!');
      setFile(null);
      fetchStatus();
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Gagal mengunggah laporan akhir');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>;
  }

  const { status_magang, laporan_akhir, sertifikat } = data || {};
  const isSelesai = status_magang === 'SELESAI';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 z-0"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Penyelesaian Program</h1>
          <p className="text-gray-500">Selesaikan seluruh persyaratan administratif untuk mendapatkan sertifikat kelulusan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Checklist & Upload Laporan */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <CheckCircle className="w-6 h-6 mr-2 text-indigo-600" /> Clearance Checklist
          </h2>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-start">
              <div className={`mt-0.5 p-1 rounded-full mr-3 ${laporan_akhir ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <p className={`font-semibold ${laporan_akhir ? 'text-gray-800' : 'text-gray-500'}`}>Upload Laporan Akhir</p>
                <p className="text-sm text-gray-500">Unggah laporan akhir format PDF atau Word.</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className={`mt-0.5 p-1 rounded-full mr-3 ${isSelesai ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <p className={`font-semibold ${isSelesai ? 'text-gray-800' : 'text-gray-500'}`}>Persetujuan Kelulusan</p>
                <p className="text-sm text-gray-500">Mentor menyetujui laporan & memberikan nilai evaluasi final.</p>
              </div>
            </li>
          </ul>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Upload Laporan Akhir</h3>
            
            {laporan_akhir ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between mb-4">
                <div className="flex items-center text-emerald-800">
                  <FileText className="w-5 h-5 mr-3" />
                  <div>
                    <p className="font-semibold text-sm">{laporan_akhir.nama_file}</p>
                    <p className="text-xs opacity-80">Terunggah pada {new Date(laporan_akhir.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
            ) : null}

            {!isSelesai && (
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors bg-gray-50">
                  <input 
                    type="file" 
                    id="laporan" 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept=".pdf,.doc,.docx" 
                  />
                  <label htmlFor="laporan" className="cursor-pointer flex flex-col items-center justify-center">
                    <Upload className={`w-8 h-8 mb-3 ${file ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <span className="font-medium text-indigo-600 hover:text-indigo-700">Pilih file laporan</span>
                    <span className="text-xs text-gray-500 mt-1">{file ? file.name : 'Format didukung: PDF, DOCX (Maks 10MB)'}</span>
                  </label>
                </div>
                <button 
                  type="submit" 
                  disabled={!file || uploading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center"
                >
                  {uploading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Unggah Laporan'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Sertifikat Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-center text-white flex-1 flex flex-col justify-center items-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Sertifikat Magang</h2>
            <p className="text-indigo-100 text-sm max-w-xs mx-auto">Sertifikat kelulusan resmi akan tersedia di sini setelah seluruh proses diselesaikan.</p>
          </div>
          <div className="p-6 bg-white">
            {sertifikat ? (
              <div>
                <div className="bg-green-50 text-green-800 text-sm p-4 rounded-xl mb-6 flex items-start">
                  <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                  <p>Selamat! Anda telah resmi menyelesaikan program magang. Sertifikat kelulusan Anda sudah bisa diunduh.</p>
                </div>
                <a 
                  href={`http://localhost:5000${sertifikat.file_path}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-5 h-5" />
                  Unduh Sertifikat Kelulusan
                </a>
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Sertifikat Belum Tersedia</p>
                <p className="text-sm text-gray-400 mt-1">Selesaikan checklist di samping untuk membuka kunci sertifikat Anda.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PenyelesaianProgram;
