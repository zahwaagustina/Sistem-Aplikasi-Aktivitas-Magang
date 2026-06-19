import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Activity, FileText, Database, Trash2, Edit3, PlusCircle } from 'lucide-react';

const AuditTrail = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAksi, setFilterAksi] = useState('ALL');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data.data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => filterAksi === 'ALL' || log.aksi === filterAksi);

  const getActionIcon = (aksi) => {
    switch (aksi) {
      case 'CREATE': return <PlusCircle size={16} className="text-emerald-500" />;
      case 'UPDATE': return <Edit3 size={16} className="text-blue-500" />;
      case 'DELETE': return <Trash2 size={16} className="text-red-500" />;
      default: return <Activity size={16} className="text-gray-500" />;
    }
  };

  const getActionColor = (aksi) => {
    switch (aksi) {
      case 'CREATE': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'UPDATE': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'DELETE': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center">
            <Shield className="mr-3 text-indigo-600" size={32} />
            Audit Trail
          </h1>
          <p className="text-gray-500 mt-1">Sistem Perekaman Jejak Aktivitas Operasional</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['ALL', 'CREATE', 'UPDATE', 'DELETE'].map((aksi) => (
            <button
              key={aksi}
              onClick={() => setFilterAksi(aksi)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filterAksi === aksi 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {aksi}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Belum Ada Rekaman</h3>
            <p className="text-gray-500 mt-1">Sistem belum mencatat adanya modifikasi data.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-sm">
                  <th className="px-6 py-4 font-medium">Waktu</th>
                  <th className="px-6 py-4 font-medium">Aktor (Pengguna)</th>
                  <th className="px-6 py-4 font-medium">Aksi</th>
                  <th className="px-6 py-4 font-medium">Entitas</th>
                  <th className="px-6 py-4 font-medium">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {log.user ? (
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{log.user.nama}</p>
                          <p className="text-xs text-gray-500">{log.user.role}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 italic">Sistem / Anonim</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getActionColor(log.aksi)}`}>
                        <span className="mr-1.5">{getActionIcon(log.aksi)}</span>
                        {log.aksi}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      {log.entitas}
                      {log.entitas_id && <span className="text-gray-400 ml-1">#{log.entitas_id}</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded border border-gray-100 max-w-xs md:max-w-md truncate" title={log.detail}>
                        {log.detail}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditTrail;
