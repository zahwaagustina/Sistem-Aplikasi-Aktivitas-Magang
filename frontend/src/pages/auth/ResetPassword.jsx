import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import api from '../../api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Token tidak ditemukan.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      setSuccess(response.data.message || 'Password berhasil diubah.');
      // Arahkan ke login setelah 3 detik
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengubah password. Link mungkin sudah kedaluwarsa.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Token Tidak Valid</h2>
          <p className="text-slate-600 mb-6">Link reset password tidak valid atau tidak lengkap.</p>
          <Link to="/forgot-password" className="text-[#004aad] font-medium hover:underline">
            Minta Link Baru
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 flex flex-col items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Buat Password Baru</h1>
          <p className="text-slate-500 text-lg">Silakan masukkan password baru Anda.</p>
        </div>
        
        <div className="bg-white/30 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-8 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Password Baru*</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="block w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                  placeholder="Minimal 8 karakter"
                  required
                />
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

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Konfirmasi Password Baru*</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="block w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                  placeholder="Ulangi password baru"
                  required
                />
                <div 
                  className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <Eye className="w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors" />
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !newPassword || !confirmPassword}
              className="w-full bg-[#004aad] text-white rounded-full py-4 font-bold hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center justify-center shadow-md disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Simpan Password Baru"
              )}
            </button>
          </form>

          {/* Notifikasi */}
          {error && (
            <div className="mt-6">
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-100 flex items-center space-x-3 transition-all">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                <p className="font-semibold text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mt-6">
              <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg border border-green-100 flex items-center space-x-3 transition-all">
                <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                <p className="font-semibold text-sm">{success}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
