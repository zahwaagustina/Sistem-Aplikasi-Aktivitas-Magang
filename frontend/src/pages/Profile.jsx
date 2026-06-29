import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, User, MapPin, Building, FileText, Edit, Clock, X, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

const Profile = () => {
  const { user, updateUser } = useAuth();

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        if (res.data.data) {
          updateUser(res.data.data);
        }
      } catch (error) {
        console.error('Gagal mengambil profil terbaru', error);
      }
    };
    fetchProfile();
  }, []);
  // Ambil inisial dari nama
  const initials = user?.nama
    ? user.nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'US';

  // Kalkulasi sisa hari (Senin - Jumat)
  const sisaHari = () => {
    if (!user?.tanggal_selesai) return '-';
    const end = new Date(user.tanggal_selesai);
    const now = new Date();
    
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    if (end <= now) return 0;
    
    let count = 0;
    let cur = new Date(now);
    
    while (cur < end) {
      cur.setDate(cur.getDate() + 1);
      const day = cur.getDay();
      if (day !== 0 && day !== 6) { // Bukan Minggu (0) dan bukan Sabtu (6)
        count++;
      }
    }
    
    return count;
  };

  const formattedEndDate = user?.tanggal_selesai 
    ? new Date(user.tanggal_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Belum diatur';

  return (
    <div className="max-w-4xl mx-auto pb-8">
      {/* Cover Image & Header Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        
        {/* Cover Background (Indigo Theme) */}
        <div className="h-32 bg-indigo-100 relative overflow-hidden">
          {/* Decorative stripes mimicking the design but in indigo */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="diagonalStripes" width="40" height="40" patternTransform="rotate(45)">
                  <rect width="20" height="40" fill="#4f46e5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#diagonalStripes)" />
            </svg>
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="px-6 sm:px-10 pb-8 relative">
          
          {/* Avatar (Overlapping cover) */}
          <div className="absolute -top-16 border-4 border-white rounded-full bg-indigo-600 h-32 w-32 flex items-center justify-center text-4xl font-bold text-white shadow-md">
            {initials}
            {/* Status dot */}
            <div className="absolute bottom-2 right-2 h-5 w-5 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>

          {/* Action Buttons (Right Aligned) */}
          <div className="flex justify-end pt-4 space-x-3">
            {user?.dokumen?.find(d => d.tipe === 'LOA') && (
              <a href={`http://localhost:5000${user.dokumen.find(d => d.tipe === 'LOA').file_path}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 px-4 py-2 border border-indigo-200 bg-indigo-50 rounded-lg text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors">
                <FileText size={16} />
                <span>Unduh LoA</span>
              </a>
            )}
          </div>

          {/* Header Info */}
          <div className="mt-8 md:mt-2">
            <h1 className="text-3xl font-bold text-gray-900">{user?.nama} {user?.nickname ? `(${user?.nickname})` : ''}</h1>
            <p className="text-gray-600 mt-1">
              {user?.jurusan || 'Jurusan -'} · {user?.universitas || 'Universitas -'} {user?.semester ? `· (Semester ${user?.semester})` : ''}
            </p>
            <div className="mt-3 flex items-center space-x-2">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                Magang
              </span>
              {user?.id_magang && (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-sm font-bold font-mono tracking-wide shadow-sm">
                  {user.id_magang}
                </span>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="mt-8 border-t border-gray-100 pt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
            
            {/* Email */}
            <div>
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <Mail size={16} className="mr-1.5" />
                <span>Email</span>
              </div>
              <p className="font-medium text-gray-900">{user?.email || '-'}</p>
            </div>

            {/* Nomor Telepon */}
            <div>
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                <span>Nomor Telepon</span>
              </div>
              <p className="font-medium text-gray-900">{user?.no_telepon || '-'}</p>
            </div>

            {/* Mentor */}
            <div>
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <User size={16} className="mr-1.5" />
                <span>Mentor</span>
              </div>
              <p className="font-medium text-gray-900">{user?.mentor || '-'}</p>
            </div>

            {/* Perusahaan */}
            <div>
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <Building size={16} className="mr-1.5" />
                <span>Perusahaan</span>
              </div>
              <p className="font-medium text-gray-900">{user?.perusahaan || 'PT Pandu Cipta Solusi'}</p>
            </div>

            {/* Lokasi */}
            <div>
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <MapPin size={16} className="mr-1.5" />
                <span>Lokasi</span>
              </div>
              <p className="font-medium text-gray-900">{user?.lokasi || 'Kadu, Tangerang'}</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Profile;
