import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RegisterKandidat = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    username: '',
    password: '',
    no_telepon: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Tunggu hingga register selesai
      await axios.post('http://localhost:5000/api/public/register', formData);
      
      // Auto login dengan kredensial yang sama
      await login(formData.username, formData.password);
      
      // Arahkan ke halaman pemilihan posisi
      navigate('/kandidat/pilih-posisi');
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat membuat akun');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-2xl mb-8">
        <div className="bg-indigo-600 rounded-2xl px-8 py-10 text-white text-center shadow-sm">
          <h2 className="text-3xl font-bold mb-2">Registrasi Akun</h2>
          <p className="text-indigo-100 text-lg">Buat akun untuk bergabung dan melamar posisi magang</p>
        </div>
      </div>

      <div className="w-full max-w-2xl">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100 shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">Informasi Data Diri</h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="text" name="nama" required value={formData.nama} onChange={handleChange} className="pl-10 w-full border border-gray-300 rounded-lg py-2.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-gray-800 placeholder-gray-400" placeholder="Masukkan nama lengkap" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className="pl-10 w-full border border-gray-300 rounded-lg py-2.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-gray-800 placeholder-gray-400" placeholder="email@contoh.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor HP</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="text" name="no_telepon" required value={formData.no_telepon} onChange={handleChange} className="pl-10 w-full border border-gray-300 rounded-lg py-2.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-gray-800 placeholder-gray-400" placeholder="08xx-xxxx-xxxx" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="text" name="username" required value={formData.username} onChange={handleChange} className="pl-10 w-full border border-gray-300 rounded-lg py-2.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-gray-800 placeholder-gray-400" placeholder="Pilih username" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="password" name="password" required value={formData.password} onChange={handleChange} className="pl-10 w-full border border-gray-300 rounded-lg py-2.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-gray-800 placeholder-gray-400" placeholder="Buat password" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3.5 px-4 rounded-xl font-bold text-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-70 transition-all shadow-md"
            >
              {loading ? 'Memproses Registrasi...' : 'Buat Akun'}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-gray-600 text-sm">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterKandidat;
