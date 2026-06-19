import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('Memverifikasi email Anda...');
  const hasFetched = useRef(false);

  useEffect(() => {
    const verify = async () => {
      if (hasFetched.current) return;
      
      if (!token) {
        setStatus('error');
        setMessage('Token verifikasi tidak valid atau tidak ditemukan.');
        return;
      }

      hasFetched.current = true;

      try {
        const response = await axios.get(`http://localhost:5000/api/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(response.data.message || 'Email berhasil diverifikasi!');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Terjadi kesalahan saat memverifikasi email.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 flex flex-col items-center justify-center p-4 font-sans">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/40 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-8 sm:p-10 text-center">
          
          {status === 'loading' && (
            <div className="flex flex-col items-center">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Memproses...</h2>
              <p className="text-slate-600">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Verifikasi Berhasil!</h2>
              <p className="text-slate-600 mb-8">{message}</p>
              <button 
                onClick={() => navigate('/login')}
                className="w-full bg-[#004aad] text-white py-3 rounded-full font-bold text-lg hover:bg-blue-800 transition-colors shadow-md"
              >
                Lanjut ke Login
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center">
              <XCircle className="w-16 h-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Verifikasi Gagal</h2>
              <p className="text-slate-600 mb-8">{message}</p>
              <button 
                onClick={() => navigate('/login')}
                className="w-full bg-slate-200 text-slate-800 py-3 rounded-full font-bold text-lg hover:bg-slate-300 transition-colors shadow-sm"
              >
                Kembali ke Login
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
