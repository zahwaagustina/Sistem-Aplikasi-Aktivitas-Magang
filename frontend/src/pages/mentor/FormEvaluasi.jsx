import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const FormEvaluasi = ({ pesertaId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipe: 'MID', // 'MID' or 'FINAL'
    skor_teknis: 80,
    skor_komunikasi: 80,
    skor_disiplin: 80,
    skor_inisiatif: 80,
    skor_teamwork: 80,
    feedback: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/mentor/anak-magang/${pesertaId}/evaluasi`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Evaluasi berhasil dikirim!');
      onSuccess();
    } catch (error) {
      console.error('Error submitting evaluasi:', error);
      alert(error.response?.data?.message || 'Gagal mengirim evaluasi');
    } finally {
      setLoading(false);
    }
  };

  const RangeInput = ({ label, name, value }) => (
    <div className="mb-4">
      <div className="flex justify-between items-end mb-1">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <span className="font-bold text-indigo-600 w-8 text-right">{value}</span>
      </div>
      <input 
        type="range" 
        min="0" max="100" 
        value={value}
        onChange={(e) => setFormData({...formData, [name]: parseInt(e.target.value)})}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-indigo-50/50">
          <h2 className="text-xl font-bold text-gray-800">Form Evaluasi Kinerja</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form id="eval-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Evaluasi</label>
              <div className="flex gap-4">
                <label className={`flex-1 border rounded-xl p-3 flex items-center justify-center cursor-pointer transition-all ${formData.tipe === 'MID' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  <input 
                    type="radio" name="tipe" value="MID" 
                    checked={formData.tipe === 'MID'} 
                    onChange={(e) => setFormData({...formData, tipe: e.target.value})}
                    className="hidden"
                  />
                  <span className="font-semibold">Evaluasi Tengah Program (Mid)</span>
                </label>
                <label className={`flex-1 border rounded-xl p-3 flex items-center justify-center cursor-pointer transition-all ${formData.tipe === 'FINAL' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  <input 
                    type="radio" name="tipe" value="FINAL" 
                    checked={formData.tipe === 'FINAL'} 
                    onChange={(e) => setFormData({...formData, tipe: e.target.value})}
                    className="hidden"
                  />
                  <span className="font-semibold">Evaluasi Akhir (Final)</span>
                </label>
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">Penilaian Kuantitatif (0 - 100)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                <RangeInput label="Keterampilan Teknis (Hard Skill)" name="skor_teknis" value={formData.skor_teknis} />
                <RangeInput label="Kemampuan Komunikasi" name="skor_komunikasi" value={formData.skor_komunikasi} />
                <RangeInput label="Disiplin & Tanggung Jawab" name="skor_disiplin" value={formData.skor_disiplin} />
                <RangeInput label="Inisiatif & Proaktif" name="skor_inisiatif" value={formData.skor_inisiatif} />
                <RangeInput label="Kerjasama Tim (Teamwork)" name="skor_teamwork" value={formData.skor_teamwork} />
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="font-bold text-gray-700">Skor Rata-Rata:</span>
                <span className="text-2xl font-black text-indigo-600">
                  {((formData.skor_teknis + formData.skor_komunikasi + formData.skor_disiplin + formData.skor_inisiatif + formData.skor_teamwork) / 5).toFixed(1)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Kualitatif (Komentar)</label>
              <textarea 
                required
                rows="4"
                className="w-full rounded-xl border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-sm text-gray-700"
                placeholder="Berikan komentar mengenai kekuatan, kelemahan, dan hal yang perlu ditingkatkan oleh peserta magang ini..."
                value={formData.feedback}
                onChange={(e) => setFormData({...formData, feedback: e.target.value})}
              ></textarea>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-white transition-colors"
          >
            Batal
          </button>
          <button 
            type="submit" 
            form="eval-form"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 flex items-center"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> : null}
            Kirim Evaluasi
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormEvaluasi;
