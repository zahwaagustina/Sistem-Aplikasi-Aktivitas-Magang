import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RegisterKandidat = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    username: '',
    password: '',
    no_telepon: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/api/public/register', formData);
      
      // Tampilkan pesan sukses alih-alih auto-login
      setSuccessMsg('Registrasi berhasil! Silakan cek kotak masuk atau folder Spam email Anda untuk memverifikasi akun sebelum login.');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat membuat akun');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Create an Account!</h1>
          <p className="text-slate-500 text-lg">Join us and start your journey.</p>
        </div>
        
        <div className="bg-white/30 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-8 sm:p-10">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100 shadow-sm font-medium">
              {error}
            </div>
          )}

          {successMsg ? (
            <div className="text-center">
              <div className="bg-green-50 text-green-700 p-6 rounded-xl mb-6 border border-green-200 shadow-sm">
                <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h3 className="text-lg font-bold mb-2">Cek Email Anda!</h3>
                <p className="text-sm">{successMsg}</p>
              </div>
              <button 
                onClick={() => navigate('/login')}
                className="w-full bg-[#004aad] text-white py-3 rounded-full font-bold hover:bg-blue-800 transition-colors"
              >
                Ke Halaman Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Nama Lengkap*</label>
                <div className="relative">
                  <input type="text" name="nama" required value={formData.nama} onChange={handleChange} 
                    className="block w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm" 
                    placeholder="Masukkan nama lengkap" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Email*</label>
                <div className="relative">
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} 
                    className="block w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm" 
                    placeholder="email@contoh.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Nomor HP*</label>
                <div className="relative">
                  <input type="text" name="no_telepon" required value={formData.no_telepon} onChange={handleChange} 
                    className="block w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm" 
                    placeholder="08xx-xxxx-xxxx" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Username*</label>
                <div className="relative">
                  <input type="text" name="username" required value={formData.username} onChange={handleChange} 
                    className="block w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm" 
                    placeholder="Pilih username" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Password*</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" required value={formData.password} onChange={handleChange} 
                    className="block w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm" 
                    placeholder="Buat password" />
                  <div 
                    className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <Eye className="w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors" />
                    )}
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#004aad] text-white py-4 rounded-full font-bold text-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 transition-all shadow-md mt-6"
              >
                {loading ? 'Memproses Registrasi...' : 'Buat Akun'}
              </button>
            </form>
          )}

          <div className="mt-8 text-center text-slate-600">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-[#004aad] font-bold hover:underline transition-colors">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterKandidat;
