import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload, FileText, FileBadge, CheckCircle, GraduationCap } from 'lucide-react';

const ApplyLowongan = () => {
  const location = useLocation();
  const lowonganId = location.state?.lowonganId;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    universitas: '',
    jurusan: '',
    angkatan: '',
    semester: ''
  });

  const [files, setFiles] = useState({
    cv: null,
    surat_pengantar: null,
    ktp: null,
    transkrip: null
  });
  const [loading, setLoading] = useState(false);

  // Jika lowonganId tidak ada, arahkan kembali ke landing page
  if (!lowonganId) {
    navigate('/');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.cv) {
      alert('Mohon unggah dokumen Curriculum Vitae (CV) Anda');
      return;
    }

    setLoading(true);
    const submitData = new FormData();
    submitData.append('lowongan_id', lowonganId);
    
    // Append academic data
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });

    if (files.cv) submitData.append('cv', files.cv);

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/kandidat/apply', submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Berhasil mengirim lamaran!');
      navigate('/kandidat/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Terjadi kesalahan saat melamar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-10 px-4 relative overflow-hidden font-sans">
      
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-indigo-400/20 blur-[100px]"></div>
      </div>

      <div className="max-w-4xl mx-auto bg-white/60 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] border border-white/50 overflow-hidden">
        
        {/* Glassmorphism Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-white relative overflow-hidden">
          {/* Header decorative elements */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-black/10 blur-2xl pointer-events-none"></div>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight relative z-10">Lengkapi Data Lamaran</h2>
          <p className="mt-3 text-blue-100 text-lg relative z-10 max-w-2xl">Silakan lengkapi profil akademik dan unggah dokumen yang diperlukan untuk melangkah ke tahap selanjutnya.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Card: Informasi Akademik */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white/60 p-8 hover:shadow-md transition-shadow">
            <h3 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center border-b border-gray-100 pb-4 tracking-tight">
              <div className="p-2.5 bg-blue-100 rounded-xl mr-3">
                <GraduationCap className="text-blue-600 w-6 h-6" />
              </div>
              Profil Akademik
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Institusi / Kampus</label>
                <input type="text" name="universitas" required value={formData.universitas} onChange={handleChange} className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-slate-800 placeholder-slate-400 bg-white/80 transition-all outline-none" placeholder="Universitas / Sekolah" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Jurusan / Program Studi</label>
                <input type="text" name="jurusan" required value={formData.jurusan} onChange={handleChange} className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-slate-800 placeholder-slate-400 bg-white/80 transition-all outline-none" placeholder="Teknik Informatika" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Angkatan</label>
                <input type="text" name="angkatan" required value={formData.angkatan} onChange={handleChange} className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-slate-800 placeholder-slate-400 bg-white/80 transition-all outline-none" placeholder="Contoh: 2021" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Semester / Kelas</label>
                <select name="semester" required value={formData.semester} onChange={handleChange} className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-slate-800 bg-white/80 transition-all outline-none">
                  <option value="" disabled>Pilih semester</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
                  <option value="Lulus">Lulus / Fresh Graduate</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white/60 p-8 hover:shadow-md transition-shadow">
            <h3 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center border-b border-gray-100 pb-4 tracking-tight">
              <div className="p-2.5 bg-indigo-100 rounded-xl mr-3">
                <Upload className="text-indigo-600 w-6 h-6" />
              </div>
              Dokumen Pendukung
            </h3>
            
            <div className="bg-blue-50/80 border border-blue-100 p-5 rounded-2xl mb-8 flex gap-4 items-start">
              <div className="text-blue-600 mt-0.5">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-blue-900">Perhatian sebelum mengunggah</h4>
                <p className="text-sm text-blue-700 mt-1">Pastikan format dokumen Curriculum Vitae (CV) menggunakan PDF. Maksimal ukuran file adalah 5MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
              {/* CV */}
              <div className="border border-indigo-100 rounded-2xl p-5 hover:border-indigo-400 hover:shadow-md hover:-translate-y-1 transition-all bg-white/80 group">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <label className="text-sm font-bold text-slate-800">Curriculum Vitae (CV) <span className="text-red-500">*</span></label>
                </div>
                <input type="file" name="cv" accept=".pdf" required onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer transition-colors" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-8">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3.5 border-2 border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-300 mr-4 transition-all"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 flex items-center transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {loading ? 'Memproses Lamaran...' : (
                <>
                  Kirim Lamaran Magang <CheckCircle className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLowongan;
