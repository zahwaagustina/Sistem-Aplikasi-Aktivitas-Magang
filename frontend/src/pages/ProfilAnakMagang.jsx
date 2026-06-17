import React, { useState, useEffect } from 'react';
import api from '../api';
import { User, Mail, Phone, MapPin, Building, GraduationCap, Briefcase, Calendar } from 'lucide-react';

const ProfilAnakMagang = () => {
  const [interns, setInterns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadingId, setUploadingId] = useState(null);

  const handleFileUpload = async (userId, file) => {
    if (!file) return;
    try {
      setUploadingId(userId);
      const formData = new FormData();
      formData.append('surat', file);
      
      const res = await api.post(`/users/${userId}/surat-keterangan`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Update state
      setInterns(interns.map(i => i.id === userId ? { ...i, surat_keterangan: res.data.surat_keterangan } : i));
      alert('Berhasil mengunggah surat keterangan!');
    } catch (err) {
      console.error(err);
      alert('Gagal mengunggah surat keterangan: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingId(null);
    }
  };

  useEffect(() => {
    const fetchInterns = async () => {
      try {
        const res = await api.get('/users/magang');
        setInterns(res.data.data || []);
      } catch (err) {
        setError('Gagal memuat data profil anak magang.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterns();
  }, []);

  const filteredInterns = interns.filter(intern => 
    intern.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    intern.universitas?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intern.divisi?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Profil Anak Magang</h1>
          <p className="text-gray-500 mt-1">Daftar lengkap profil mahasiswa/siswa magang.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Cari nama, asal, divisi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredInterns.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Tidak ada data</h3>
          <p className="text-gray-500">Belum ada anak magang yang terdaftar atau tidak ada hasil pencarian.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInterns.map((intern) => (
            <div key={intern.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
              <div className="p-6 border-b border-gray-50 flex-grow">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                    {intern.nama ? intern.nama.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 line-clamp-1" title={intern.nama}>{intern.nama || 'Tanpa Nama'}</h2>
                    <p className="text-sm text-indigo-600 font-medium">{intern.id_magang || 'NIM/ID belum diatur'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3 text-sm text-gray-600">
                    <GraduationCap className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{intern.universitas || 'Asal Instansi belum diatur'}</p>
                      <p className="text-xs">
                        {intern.jurusan ? `${intern.jurusan} ` : ''}
                        {intern.angkatan ? `(Angkatan ${intern.angkatan})` : ''}
                        {intern.semester ? ` - Semester ${intern.semester}` : ''}
                      </p>
                    </div>
                  </div>
                  

                  {intern.email && (
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="line-clamp-1">{intern.email}</span>
                    </div>
                  )}

                  {intern.no_telepon && (
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{intern.no_telepon}</span>
                    </div>
                  )}
                  
                  {intern.mentor && (
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>Mentor: <span className="font-medium text-gray-800">{intern.mentor}</span></span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4 flex flex-col space-y-3">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{intern.lokasi || 'Lokasi -'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{intern.tanggal_selesai ? `Selesai: ${new Date(intern.tanggal_selesai).toLocaleDateString('id-ID')}` : 'Selesai: -'}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  {intern.surat_keterangan ? (
                    <div className="flex justify-between items-center">
                      <a href={`http://localhost:5000${intern.surat_keterangan}`} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-emerald-600 hover:text-emerald-800 flex items-center transition-colors">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Lihat Surat
                      </a>
                      <label className="text-xs font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer">
                        {uploadingId === intern.id ? 'Mengunggah...' : 'Perbarui'}
                        <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => handleFileUpload(intern.id, e.target.files[0])} disabled={uploadingId === intern.id} />
                      </label>
                    </div>
                  ) : (
                    <label className="block w-full text-center py-2 px-4 border border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition-colors">
                       {uploadingId === intern.id ? 'Mengunggah...' : 'Upload Surat Keterangan'}
                       <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => handleFileUpload(intern.id, e.target.files[0])} disabled={uploadingId === intern.id} />
                    </label>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilAnakMagang;
