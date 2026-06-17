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
    if (!files.cv || !files.ktp || !files.transkrip) {
      alert('Mohon unggah dokumen yang wajib (CV, KTP, dan Transkrip Nilai)');
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
    if (files.surat_pengantar) submitData.append('surat_pengantar', files.surat_pengantar);
    if (files.ktp) submitData.append('ktp', files.ktp);
    if (files.transkrip) submitData.append('transkrip', files.transkrip);

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
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-indigo-600 px-6 py-8 text-white">
          <h2 className="text-3xl font-bold">Lengkapi Data Lamaran</h2>
          <p className="mt-2 text-indigo-100">Silakan lengkapi profil akademik dan unggah dokumen yang diperlukan.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Card: Informasi Akademik */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center border-b pb-3">
              <GraduationCap className="mr-2 text-indigo-600" /> Profil Akademik
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Institusi / Kampus</label>
                <input type="text" name="universitas" required value={formData.universitas} onChange={handleChange} className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-gray-800 placeholder-gray-400" placeholder="Universitas / Sekolah" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Jurusan / Program Studi</label>
                <input type="text" name="jurusan" required value={formData.jurusan} onChange={handleChange} className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-gray-800 placeholder-gray-400" placeholder="Teknik Informatika" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Angkatan</label>
                <input type="text" name="angkatan" required value={formData.angkatan} onChange={handleChange} className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-gray-800 placeholder-gray-400" placeholder="Contoh: 2021" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Semester / Kelas</label>
                <select name="semester" required value={formData.semester} onChange={handleChange} className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-gray-800 bg-white">
                  <option value="" disabled>Pilih semester</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
                  <option value="Lulus">Lulus / Fresh Graduate</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center border-b pb-3">
              <Upload className="mr-2 text-indigo-600" /> Dokumen Pendukung
            </h3>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
              <h4 className="font-semibold text-blue-800">Perhatian:</h4>
              <p className="text-sm text-blue-600 mt-1">Pastikan format menggunakan PDF atau JPG (khusus KTP). Maksimal ukuran file 5MB per dokumen.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CV */}
              <div className="border border-gray-300 rounded-xl p-4 hover:border-indigo-500 transition-colors bg-gray-50">
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="w-6 h-6 text-indigo-500" />
                  <label className="text-sm font-semibold text-gray-800">Curriculum Vitae (CV) <span className="text-red-500">*</span></label>
                </div>
                <input type="file" name="cv" accept=".pdf" required onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
              </div>

              {/* Transkrip Nilai */}
              <div className="border border-gray-300 rounded-xl p-4 hover:border-indigo-500 transition-colors bg-gray-50">
                <div className="flex items-center space-x-3 mb-4">
                  <FileBadge className="w-6 h-6 text-indigo-500" />
                  <label className="text-sm font-semibold text-gray-800">Transkrip Nilai <span className="text-red-500">*</span></label>
                </div>
                <input type="file" name="transkrip" accept=".pdf" required onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
              </div>

              {/* KTP */}
              <div className="border border-gray-300 rounded-xl p-4 hover:border-indigo-500 transition-colors bg-gray-50">
                <div className="flex items-center space-x-3 mb-4">
                  <FileBadge className="w-6 h-6 text-indigo-500" />
                  <label className="text-sm font-semibold text-gray-800">Scan KTP/KTM <span className="text-red-500">*</span></label>
                </div>
                <input type="file" name="ktp" accept=".pdf,.jpg,.jpeg,.png" required onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
              </div>

              {/* Surat Pengantar */}
              <div className="border border-gray-300 rounded-xl p-4 hover:border-indigo-500 transition-colors bg-gray-50">
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="w-6 h-6 text-indigo-500" />
                  <label className="text-sm font-semibold text-gray-800">Surat Pengantar (Opsional)</label>
                </div>
                <input type="file" name="surat_pengantar" accept=".pdf" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 mr-4 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-70 flex items-center transition-colors shadow-md"
            >
              {loading ? 'Memproses Lamaran...' : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Kirim Lamaran Magang
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
