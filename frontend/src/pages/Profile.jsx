import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, User, MapPin, Building, FileText, Edit, Clock, X, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nama: user?.nama || '',
    universitas: user?.universitas || '',
    jurusan: user?.jurusan || '',
    angkatan: user?.angkatan || '',
    semester: user?.semester || '',
    email: user?.email || '',
    mentor: user?.mentor || '',
    perusahaan: user?.perusahaan || '',
    lokasi: user?.lokasi || '',
    tanggal_selesai: user?.tanggal_selesai ? new Date(user.tanggal_selesai).toISOString().split('T')[0] : '',
    nickname: user?.nickname || '',
    no_telepon: user?.no_telepon || ''
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await api.put('/users/profile', formData);
      updateUser(res.data.data);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert('Gagal memperbarui profil: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  
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
            {user?.surat_keterangan ? (
              <a href={`http://localhost:5000${user.surat_keterangan}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 px-4 py-2 border border-indigo-200 bg-indigo-50 rounded-lg text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors">
                <FileText size={16} />
                <span>Unduh Surat</span>
              </a>
            ) : (
              <button disabled className="flex items-center space-x-2 px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed" title="Surat keterangan belum diunggah oleh pembimbing">
                <FileText size={16} />
                <span>Surat belum tersedia</span>
              </button>
            )}
            <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Edit size={16} />
              <span>Edit profil</span>
            </button>
          </div>

          {/* Header Info */}
          <div className="mt-8 md:mt-2">
            <h1 className="text-3xl font-bold text-gray-900">{user?.nama} {user?.nickname ? `(${user?.nickname})` : ''}</h1>
            <p className="text-gray-600 mt-1">
              {user?.jurusan || 'Jurusan -'} · {user?.universitas || 'Universitas -'} · {user?.angkatan || 'Angkatan -'} {user?.semester ? `(Semester ${user?.semester})` : ''}
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


      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">Edit Profil</h2>
              <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Panggilan (Nickname)</label>
                  <input type="text" name="nickname" value={formData.nickname} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input type="text" name="nama" value={formData.nama} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                  <input type="tel" name="no_telepon" value={formData.no_telepon} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Universitas</label>
                  <input type="text" name="universitas" value={formData.universitas} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jurusan</label>
                  <input type="text" name="jurusan" value={formData.jurusan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Angkatan</label>
                  <input type="text" name="angkatan" value={formData.angkatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <input type="text" name="semester" value={formData.semester} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Mentor</label>
                  <input type="text" name="mentor" value={formData.mentor} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Perusahaan (Otomatis)</label>
                  <input type="text" value={user?.perusahaan || 'PT Pandu Cipta Solusi'} disabled className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi (Otomatis)</label>
                  <input type="text" value={user?.lokasi || 'Kadu, Tangerang'} disabled className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed outline-none" />
                </div>

              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors">
                Batal
              </button>
              <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center">
                {loading ? 'Menyimpan...' : <><Save size={16} className="mr-2" /> Simpan Perubahan</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
