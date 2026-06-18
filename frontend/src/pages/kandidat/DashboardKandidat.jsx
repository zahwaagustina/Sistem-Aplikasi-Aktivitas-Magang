import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Calendar, CheckCircle, Clock, Video, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardKandidat = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/kandidat/applications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(res.data.data);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const getStatusDisplay = (status) => {
    switch(status) {
      case 'DRAFT': return { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: <Clock className="w-4 h-4 mr-1" /> };
      case 'SUBMITTED': return { label: 'Sedang Direview HR', color: 'bg-blue-100 text-blue-800', icon: <Clock className="w-4 h-4 mr-1" /> };
      case 'REVIEWED': return { label: 'Sedang Direview HR', color: 'bg-indigo-100 text-indigo-800', icon: <Clock className="w-4 h-4 mr-1" /> };
      case 'SHORTLISTED': return { label: 'Lolos Administrasi', color: 'bg-yellow-100 text-yellow-800', icon: <CheckCircle className="w-4 h-4 mr-1" /> };
      case 'INTERVIEW': return { label: 'Tahap Wawancara', color: 'bg-purple-100 text-purple-800', icon: <Calendar className="w-4 h-4 mr-1" /> };
      case 'ACCEPTED': return { label: 'Diterima Magang', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4 mr-1" /> };
      case 'REJECTED': return { label: 'Tidak Lolos', color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-4 h-4 mr-1" /> };
      default: return { label: status, color: 'bg-gray-100 text-gray-800', icon: null };
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">Halo, {user?.nama}! 👋</h1>
        <p className="text-gray-500 mt-1">Pantau status lamaran magang Anda di sini.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : applications.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
          <Briefcase className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700">Belum Ada Lamaran</h2>
          <p className="text-gray-500 mt-2 mb-6">Anda belum melamar ke lowongan apapun.</p>
          <Link to="/kandidat/pilih-posisi" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
            Cari Lowongan Magang
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => {
            const statusDisplay = getStatusDisplay(app.status);
            return (
              <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:border-indigo-300 transition-colors">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full flex items-center ${statusDisplay.color}`}>
                      {statusDisplay.icon} {statusDisplay.label}
                    </span>
                    <span className="text-xs text-gray-400 font-semibold">
                      {new Date(app.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-800 mb-1">{app.lowongan.posisi}</h3>
                  <p className="text-sm text-gray-500 mb-4">{app.lowongan.program.nama}</p>

                  {/* Info Wawancara atau Hasil */}
                  {app.status === 'ACCEPTED' ? (
                    <div className="mt-4 bg-green-50 border border-green-100 rounded-lg p-4 text-center">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 mb-2">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-green-800 mb-1">Selamat! Anda Diterima</h4>
                      <p className="text-xs text-green-700 mb-3">Silakan lanjutkan ke tahap Onboarding.</p>
                      <Link to="/kandidat/onboarding" className="inline-block w-full py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors">
                        Mulai Onboarding
                      </Link>
                    </div>
                  ) : app.status === 'REJECTED' ? (
                    <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-lg text-sm font-medium border border-red-100 flex items-center">
                       <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" /> 
                       <div>
                         <span className="block font-bold">Tidak Lolos</span>
                         <span className="text-xs mt-1 block">Maaf, Anda belum terpilih untuk posisi ini.</span>
                       </div>
                    </div>
                  ) : app.interview && (
                    <div className="mt-4 bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                      <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" /> Jadwal Wawancara
                      </h4>
                      <p className="text-sm font-bold text-indigo-900 mb-1">
                        {new Date(app.interview.tanggal_waktu).toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {app.interview.link_meeting && (
                        <a 
                          href={app.interview.link_meeting} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-lg transition-colors w-full justify-center"
                        >
                          <Video className="w-4 h-4 mr-2" /> Gabung Meeting Online
                        </a>
                      )}
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardKandidat;
