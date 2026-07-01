import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, CheckCircle, ArrowRight } from 'lucide-react';

const PilihPosisi = () => {
  const [lowongan, setLowongan] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLowongan = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/public/lowongan`);
        setLowongan(response.data.data);
      } catch (error) {
        console.error('Error fetching lowongan:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLowongan();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Pendaftaran Akun Berhasil!</h1>
          <p className="text-lg text-gray-600">Langkah selanjutnya, silakan pilih posisi magang yang ingin Anda lamar.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lowongan.map((job) => (
              <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col h-full hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                    <Briefcase className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{job.posisi}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{job.deskripsi}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">{job.lokasi}</span>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium">{job.divisi}</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => navigate('/apply', { state: { lowonganId: job.id } })}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
                  >
                    Pilih & Lengkapi CV <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <button onClick={() => navigate('/kandidat/dashboard')} className="text-gray-500 hover:text-indigo-600 font-medium underline">
            Nanti saja, masuk ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PilihPosisi;
