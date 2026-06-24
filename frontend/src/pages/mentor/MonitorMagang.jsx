import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Users, BookOpen, Clock, ChevronRight, Activity, Search } from 'lucide-react';

const MonitorMagang = () => {
  const [anakMagang, setAnakMagang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnakMagang = async () => {
      try {
        const res = await api.get('/mentor/anak-magang');
        console.log('Response dari API mentor:', res.data);
        setAnakMagang(res.data.data || res.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMsg(error.response?.data?.message || error.message);
        if (error.response) {
          console.error('Response error data:', error.response.data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAnakMagang();
  }, []);

  const filteredData = (anakMagang || [])
    .filter(m => {
      const search = searchTerm.toLowerCase();
      const nama = m?.user?.nama || '';
      const univ = m?.universitas || '';
      return nama.toLowerCase().includes(search) || univ.toLowerCase().includes(search);
    })
    .sort((a, b) => {
      if (a.status === 'SELESAI' && b.status !== 'SELESAI') return 1;
      if (a.status !== 'SELESAI' && b.status === 'SELESAI') return -1;
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Monitor Anak Magang</h1>
          <p className="text-gray-500 mt-1">Pantau perkembangan dan aktivitas logbook anak bimbingan Anda.</p>
        </div>
        
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="Cari nama / kampus..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700">Tidak ada data</h2>
          <p className="text-gray-500 mt-2">Belum ada anak magang yang ditugaskan kepada Anda atau cocok dengan pencarian.</p>
          {errorMsg && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-left font-mono">
              <strong>Error Debug:</strong> {errorMsg}
            </div>
          )}
          <div className="mt-4 p-3 bg-gray-100 text-gray-700 rounded-lg text-xs text-left font-mono overflow-auto max-h-40">
            <strong>Data Debug:</strong> {JSON.stringify(anakMagang)}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((magang) => (
            <div 
              key={magang.id} 
              onClick={() => navigate(`/mentor/profil-magang`, { state: { userId: magang.user_id } })}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-1">{magang.user?.nama}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">{magang.universitas}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${magang.status === 'AKTIF' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {magang.status}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2 text-center border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium flex justify-center items-center gap-1"><BookOpen className="w-3 h-3"/> Total</p>
                    <p className="font-bold text-gray-800">{magang.stats?.total_logbook || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-600 mb-1 font-medium flex justify-center items-center gap-1"><Clock className="w-3 h-3"/> Review</p>
                    <p className="font-bold text-amber-600">{magang.stats?.pending_review || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600 mb-1 font-medium flex justify-center items-center gap-1"><Activity className="w-3 h-3"/> Disetujui</p>
                    <p className="font-bold text-emerald-600">{magang.stats?.approved || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 flex justify-center items-center text-sm font-medium text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                Lihat Detail <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MonitorMagang;
