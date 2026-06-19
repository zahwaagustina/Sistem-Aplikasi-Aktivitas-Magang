import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard, Clock, PlayCircle, CheckCircle, Upload, AlertCircle, Calendar } from 'lucide-react';

const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [fileHasil, setFileHasil] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/magang/tugas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/magang/tugas/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal memperbarui status tugas');
    }
  };

  const handleOpenSubmitModal = (task) => {
    setSelectedTask(task);
    setIsSubmitModalOpen(true);
  };

  const handleSubmitResult = async (e) => {
    e.preventDefault();
    if (!fileHasil && !selectedTask.file_hasil) {
      alert('Mohon unggah file hasil pekerjaan.');
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    if (fileHasil) formData.append('file_hasil', fileHasil);

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/magang/tugas/${selectedTask.id}/submit`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Hasil tugas berhasil dikumpulkan untuk direview mentor!');
      setIsSubmitModalOpen(false);
      setFileHasil(null);
      fetchTasks();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal mengumpulkan tugas');
    } finally {
      setLoading(false);
    }
  };

  const renderTasksByStatus = (status) => {
    return tasks.filter(t => t.status === status).map(task => (
      <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-3 hover:border-indigo-300 transition-colors">
        <div className="flex justify-between items-start mb-2">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
            task.prioritas === 'HIGH' ? 'bg-red-100 text-red-700' :
            task.prioritas === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            {task.prioritas}
          </span>
          <span className="flex items-center text-xs text-gray-500 font-semibold">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
          </span>
        </div>
        
        <h4 className="font-bold text-gray-800 text-sm mb-1 leading-tight">{task.judul}</h4>
        <p className="text-xs text-gray-600 line-clamp-2 mb-3">{task.deskripsi}</p>
        
        {task.status === 'TODO' && (
          <button onClick={() => updateStatus(task.id, 'IN_PROGRESS')} className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg flex items-center justify-center transition-colors">
            <PlayCircle className="w-3 h-3 mr-1" /> Mulai Kerjakan
          </button>
        )}
        
        {task.status === 'IN_PROGRESS' && (
          <button onClick={() => handleOpenSubmitModal(task)} className="w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg flex items-center justify-center transition-colors">
            <Upload className="w-3 h-3 mr-1" /> Kumpulkan Hasil
          </button>
        )}

        {task.status === 'REVIEW' && (
          <div className="w-full py-1.5 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-lg flex items-center justify-center cursor-default">
            <Clock className="w-3 h-3 mr-1" /> Menunggu Review Mentor
          </div>
        )}

        {task.status === 'DONE' && (
          <div className="w-full py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg flex items-center justify-center cursor-default">
            <CheckCircle className="w-3 h-3 mr-1" /> Selesai
          </div>
        )}

        {task.feedback && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-[10px] font-bold text-gray-500 mb-1">Feedback Mentor:</p>
            <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded-lg italic">"{task.feedback}"</p>
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="space-y-6 h-[85vh] flex flex-col">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <LayoutDashboard className="mr-2 text-indigo-600" /> Papan Tugas (Kanban)
          </h1>
          <p className="text-gray-500 mt-1">Selesaikan tugas yang diberikan mentor tepat waktu.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 overflow-hidden">
        {/* Kolom TODO */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
            <h3 className="font-bold text-gray-700 flex items-center">
              <span className="w-2 h-2 rounded-full bg-gray-400 mr-2"></span> To Do
            </h3>
            <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">{tasks.filter(t => t.status === 'TODO').length}</span>
          </div>
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {renderTasksByStatus('TODO')}
            {tasks.filter(t => t.status === 'TODO').length === 0 && <p className="text-xs text-gray-400 text-center italic mt-4">Belum ada tugas.</p>}
          </div>
        </div>

        {/* Kolom IN PROGRESS */}
        <div className="bg-indigo-50/30 rounded-xl p-4 border border-indigo-100 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-indigo-100">
            <h3 className="font-bold text-indigo-800 flex items-center">
              <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span> In Progress
            </h3>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-full">{tasks.filter(t => t.status === 'IN_PROGRESS').length}</span>
          </div>
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {renderTasksByStatus('IN_PROGRESS')}
            {tasks.filter(t => t.status === 'IN_PROGRESS').length === 0 && <p className="text-xs text-indigo-300 text-center italic mt-4">Belum ada yang dikerjakan.</p>}
          </div>
        </div>

        {/* Kolom REVIEW */}
        <div className="bg-yellow-50/30 rounded-xl p-4 border border-yellow-100 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-yellow-100">
            <h3 className="font-bold text-yellow-800 flex items-center">
              <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span> Review
            </h3>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">{tasks.filter(t => t.status === 'REVIEW').length}</span>
          </div>
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {renderTasksByStatus('REVIEW')}
            {tasks.filter(t => t.status === 'REVIEW').length === 0 && <p className="text-xs text-yellow-500 text-center italic mt-4">Kosong.</p>}
          </div>
        </div>

        {/* Kolom DONE */}
        <div className="bg-green-50/30 rounded-xl p-4 border border-green-100 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-green-100">
            <h3 className="font-bold text-green-800 flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> Done
            </h3>
            <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full">{tasks.filter(t => t.status === 'DONE').length}</span>
          </div>
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {renderTasksByStatus('DONE')}
            {tasks.filter(t => t.status === 'DONE').length === 0 && <p className="text-xs text-green-400 text-center italic mt-4">Belum ada yang selesai.</p>}
          </div>
        </div>
      </div>

      {/* Modal Submit Tugas */}
      {isSubmitModalOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 pb-2 text-left">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Kumpulkan Hasil Tugas</h3>
              <p className="text-gray-500 text-sm">
                Unggah hasil akhir untuk tugas <span className="font-semibold text-gray-700">"{selectedTask.judul}"</span>.
              </p>
            </div>
            
            <form onSubmit={handleSubmitResult}>
              <div className="p-6 pt-4 space-y-5">
                <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-100 text-left">
                  <p className="font-semibold mb-1 flex items-center">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> Perhatian:
                  </p>
                  <p>Pastikan file hasil akhir sudah benar. Setelah dikumpulkan, tugas akan pindah ke kolom Review.</p>
                </div>

                <div className="w-full text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload File (PDF/Zip/Gambar)</label>
                  <input 
                    type="file" 
                    required 
                    onChange={(e) => setFileHasil(e.target.files[0])} 
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100
                      border border-gray-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => { setIsSubmitModalOpen(false); setFileHasil(null); }} 
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-200 bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="px-5 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? 'Mengirim...' : 'Kirim ke Mentor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Style for custom scrollbar within this component scope */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
};

export default TaskBoard;
