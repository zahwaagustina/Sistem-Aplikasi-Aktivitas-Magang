import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, Search, ArrowLeft, MoreVertical, X, Check, Eye, EyeOff, Edit, Trash2, AlertTriangle } from 'lucide-react';
import api from '../../api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [editingUserId, setEditingUserId] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    password: '',
    role: 'MAGANG',
    email: '',
    universitas: '',
    jurusan: ''
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/users');
      console.log('fetchUsers response:', res.data);
      const data = res.data.data || res.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Gagal mengambil data pengguna', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (editingUserId) {
        await api.put(`/admin/users/${editingUserId}`, formData);
        setSuccess('Data pengguna berhasil diperbarui!');
      } else {
        await api.post('/admin/users', formData);
        setSuccess('Pengguna berhasil ditambahkan!');
      }
      
      fetchUsers();
      
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess('');
        setEditingUserId(null);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || `Gagal ${editingUserId ? 'memperbarui' : 'menambahkan'} pengguna`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      nama: user.nama || '',
      username: user.username || '',
      password: '', // Leave blank, only fill if changing
      role: user.role || 'MAGANG',
      email: user.email || '',
      universitas: user.universitas || '',
      jurusan: user.jurusan || ''
    });
    setEditingUserId(user.id);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/admin/users/${deletingUser.id}`);
      setDeletingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus pengguna');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      nama: '',
      username: '',
      password: '',
      role: 'MAGANG',
      email: '',
      universitas: '',
      jurusan: ''
    });
    setEditingUserId(null);
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.universitas && user.universitas.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header & Back Button */}
      <div>
        <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors mb-4">
          <ArrowLeft size={16} className="mr-1.5" />
          Kembali ke Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola akun Anak Magang dan Pembimbing</p>
          </div>
          <button 
            onClick={openAddModal}
            className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center shadow-sm"
          >
            <UserPlus size={18} className="mr-2" />
            Tambah Pengguna
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={16} />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Cari nama, username, atau universitas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-500 font-medium">
            Total: {filteredUsers.length}
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
          ) : filteredUsers.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Pengguna</th>
                  <th className="px-6 py-4 font-medium">Role & Info</th>
                  <th className="px-6 py-4 font-medium">Status Akun</th>
                  <th className="px-6 py-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold flex-shrink-0">
                          {u.nama.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{u.nama}</p>
                          <p className="text-xs text-gray-500 font-mono">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-1
                        ${u.role === 'MENTOR' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                        {u.role}
                      </span>
                      {u.role === 'MAGANG' && (
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">
                          {u.universitas || 'Universitas -'}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-green-600 font-medium">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        Aktif
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleEdit(u)}
                          className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                          title="Edit Pengguna"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => setDeletingUser(u)}
                          className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                          title="Hapus Pengguna"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={24} className="text-gray-400" />
              </div>
              <h3 className="text-gray-900 font-medium text-lg">Tidak ada pengguna</h3>
              <p className="text-gray-500 text-sm mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-up">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                {editingUserId ? (
                  <><Edit size={20} className="mr-2 text-indigo-600" /> Edit Pengguna</>
                ) : (
                  <><UserPlus size={20} className="mr-2 text-indigo-600" /> Tambah Pengguna Baru</>
                )}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {success ? (
                <div className="py-8 flex flex-col items-center justify-center text-center animate-fade-in-down">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                    <Check size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800">Berhasil!</h4>
                  <p className="text-gray-600 mt-2">{success}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-100 text-sm font-medium">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                      <input 
                        type="text" required name="nama" value={formData.nama} onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                        placeholder="Contoh: Budi Santoso"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                      <input 
                        type="text" required name="username" value={formData.username} onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                        placeholder="Untuk login"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password {editingUserId && <span className="text-gray-400 text-xs font-normal">(Kosongkan jika tidak diubah)</span>} {!editingUserId && '*'}
                      </label>
                      <div className="relative">
                        <input 
                          type={showPassword ? 'text' : 'password'} required={!editingUserId} name="password" value={formData.password} onChange={handleInputChange}
                          className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                          placeholder="••••••••"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role Akses *</label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className={`border rounded-lg p-3 flex items-center cursor-pointer transition-all ${formData.role === 'MAGANG' ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600' : 'border-gray-200 hover:bg-gray-50'}`}>
                          <input type="radio" name="role" value="MAGANG" checked={formData.role === 'MAGANG'} onChange={handleInputChange} className="hidden" />
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${formData.role === 'MAGANG' ? 'border-indigo-600' : 'border-gray-300'}`}>
                            {formData.role === 'MAGANG' && <div className="w-2 h-2 rounded-full bg-indigo-600"></div>}
                          </div>
                          <span className="font-medium text-gray-800 text-sm">Anak Magang</span>
                        </label>
                        <label className={`border rounded-lg p-3 flex items-center cursor-pointer transition-all ${formData.role === 'MENTOR' ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600' : 'border-gray-200 hover:bg-gray-50'}`}>
                          <input type="radio" name="role" value="MENTOR" checked={formData.role === 'MENTOR'} onChange={handleInputChange} className="hidden" />
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${formData.role === 'MENTOR' ? 'border-emerald-600' : 'border-gray-300'}`}>
                            {formData.role === 'MENTOR' && <div className="w-2 h-2 rounded-full bg-emerald-600"></div>}
                          </div>
                          <span className="font-medium text-gray-800 text-sm">Pembimbing</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {formData.role === 'MAGANG' && (
                    <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 mt-4">
                      <div className="col-span-2 text-sm font-semibold text-gray-800 mb-2">Informasi Opsional (Magang)</div>
                      
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Universitas</label>
                        <input type="text" name="universitas" value={formData.universitas} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Jurusan</label>
                        <input type="text" name="jurusan" value={formData.jurusan} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                    </div>
                  )}

                  <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end space-x-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                      Batal
                    </button>
                    <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-70">
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <Check size={18} className="mr-2" />
                      )}
                      {editingUserId ? 'Simpan Perubahan' : 'Simpan Pengguna'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-slide-up text-center">
            <div className="p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Hapus Pengguna?</h3>
              <p className="text-gray-500 text-sm">
                Apakah Anda yakin ingin menghapus akun <strong>{deletingUser.nama}</strong>? Semua data laporan magang terkait akun ini juga akan ikut terhapus secara permanen.
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex space-x-3">
              <button 
                onClick={() => setDeletingUser(null)} 
                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button 
                onClick={handleDeleteConfirm} 
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Ya, Hapus'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
