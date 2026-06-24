import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { X, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api';

const FormEvaluasi = ({ pesertaId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [rekapLoading, setRekapLoading] = useState(true);
  const [rekap, setRekap] = useState(null);
  const [aspekList, setAspekList] = useState([]);
  
  const [detailPenilaian, setDetailPenilaian] = useState({});
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const fetchRekapAndAspek = async () => {
      try {
        const token = localStorage.getItem('token');
        const [rekapRes, aspekRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/mentor/anak-magang/${pesertaId}/absensi`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          api.get('/mentor/evaluasi-aspek')
        ]);
        
        setRekap(rekapRes.data.data);
        const aspekData = aspekRes.data.data || [];
        setAspekList(aspekData);

        // Initialize detailPenilaian with default score 5
        const initialPenilaian = {};
        aspekData.forEach(aspek => {
          aspek.pertanyaan.forEach(p => {
            initialPenilaian[p.id] = 5;
          });
        });
        setDetailPenilaian(initialPenilaian);

      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Gagal memuat data evaluasi');
      } finally {
        setRekapLoading(false);
      }
    };
    fetchRekapAndAspek();
  }, [pesertaId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formattedDetailPenilaian = Object.entries(detailPenilaian).map(([pertanyaan_id, skor]) => ({
        pertanyaan_id: parseInt(pertanyaan_id),
        skor: parseInt(skor)
      }));

      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/mentor/anak-magang/${pesertaId}/evaluasi`, {
        tipe: 'FINAL',
        detail_penilaian: formattedDetailPenilaian,
        feedback
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Evaluasi berhasil dikirim!');
      onSuccess();
    } catch (error) {
      console.error('Error submitting evaluasi:', error);
      toast.error(error.response?.data?.message || 'Gagal mengirim evaluasi');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (qId, value) => {
    setDetailPenilaian(prev => ({ ...prev, [qId]: parseInt(value) }));
  };

  const QuestionRow = ({ q }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-gray-100 last:border-0 gap-3">
      <div className="text-sm text-gray-700 flex-1">{q.pertanyaan}</div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(score => (
          <label key={score} className="cursor-pointer">
            <input 
              type="radio" 
              name={`q-${q.id}`} 
              value={score} 
              checked={detailPenilaian[q.id] === score}
              onChange={(e) => handleScoreChange(q.id, e.target.value)}
              className="peer sr-only"
            />
            <div className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium border border-gray-200 peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:border-indigo-600 hover:bg-gray-50 transition-colors">
              {score}
            </div>
          </label>
        ))}
      </div>
    </div>
  );

  let totalAkhir = 0;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col my-8">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-indigo-50/50 rounded-t-2xl sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-800">Form Evaluasi Kinerja</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          {aspekList.length === 0 && !rekapLoading ? (
             <div className="text-center py-10 text-gray-500">
               Belum ada aspek evaluasi yang dikonfigurasi oleh Admin.
             </div>
          ) : (
          <form id="eval-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Informasi Skala */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
              <strong>Skala Penilaian:</strong> 1 = Sangat Kurang | 2 = Kurang | 3 = Cukup | 4 = Baik | 5 = Sangat Baik
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {aspekList.map((aspek, index) => {
                if (!aspek.is_active) return null;
                
                // Calculate subtotal for this aspect
                let sumSkorAspek = 0;
                aspek.pertanyaan.forEach(p => {
                  sumSkorAspek += (detailPenilaian[p.id] || 0);
                });
                const maxSkor = (aspek.pertanyaan.length || 1) * 5;
                const subtotal = aspek.pertanyaan.length > 0 ? (sumSkorAspek / maxSkor) * aspek.bobot : 0;
                totalAkhir += subtotal;

                return (
                  <div key={aspek.id} className="border border-gray-200 rounded-xl overflow-hidden h-fit">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800 text-sm">{index + 1}. Aspek {aspek.nama} ({aspek.bobot}%)</h3>
                      <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Skor: {subtotal.toFixed(1)}</span>
                    </div>
                    <div className="px-4">
                      {aspek.pertanyaan.length > 0 ? (
                        aspek.pertanyaan.map(q => <QuestionRow key={q.id} q={q} />)
                      ) : (
                        <div className="py-3 text-sm text-gray-500 text-center">Belum ada pertanyaan</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              {/* Rekap Kehadiran */}
              <div className="border border-gray-200 rounded-xl overflow-hidden h-fit">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-bold text-gray-800 text-sm">Rekap Kehadiran Magang (Otomatis)</h3>
                </div>
                <div className="p-4">
                  {rekapLoading ? (
                    <div className="text-center text-gray-500 text-sm py-4">Memuat rekap...</div>
                  ) : rekap ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 p-3 rounded-lg border border-green-100 flex flex-col justify-between">
                        <div className="text-xs text-green-600 font-bold mb-1 uppercase tracking-wider">Hadir</div>
                        <div className="text-2xl font-black text-green-700 flex items-baseline gap-2">
                          {rekap.hadir || 0}
                          <span className="text-sm font-bold opacity-75">
                            ({rekap.total > 0 ? Math.round(((rekap.hadir || 0) / rekap.total) * 100) : 0}%)
                          </span>
                        </div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex flex-col justify-between">
                        <div className="text-xs text-yellow-600 font-bold mb-1 uppercase tracking-wider">Izin/Sakit</div>
                        <div className="text-2xl font-black text-yellow-700 flex items-baseline gap-2">
                          {(rekap.izin || 0) + (rekap.sakit || 0)}
                          <span className="text-sm font-bold opacity-75">
                            ({rekap.total > 0 ? Math.round((((rekap.izin || 0) + (rekap.sakit || 0)) / rekap.total) * 100) : 0}%)
                          </span>
                        </div>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex flex-col justify-between">
                        <div className="text-xs text-red-600 font-bold mb-1 uppercase tracking-wider">Alpa/Tanpa Keterangan</div>
                        <div className="text-2xl font-black text-red-700 flex items-baseline gap-2">
                          {rekap.alpa || 0}
                          <span className="text-sm font-bold opacity-75">
                            ({rekap.total > 0 ? Math.round(((rekap.alpa || 0) / rekap.total) * 100) : 0}%)
                          </span>
                        </div>
                      </div>
                      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                        <div className="text-xs text-indigo-600 font-bold mb-1 uppercase tracking-wider">Total Hari Kerja</div>
                        <div className="text-2xl font-black text-indigo-700">{rekap.total || 0}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 text-sm py-4">Data tidak tersedia.</div>
                  )}
                </div>
              </div>

              {/* Kolom Kanan: Skor & Feedback */}
              <div className="flex flex-col gap-4">
                {/* Skor Akhir Evaluasi */}
                <div className="bg-indigo-600 text-white px-6 py-4 rounded-xl flex items-center justify-between shadow-md">
                  <div className="text-indigo-100 font-medium uppercase tracking-wider">Skor Akhir Evaluasi</div>
                  <div className="text-4xl font-black">{totalAkhir.toFixed(1)}</div>
                </div>

                {/* Feedback Tambahan */}
                <div className="border border-gray-200 rounded-xl overflow-hidden flex-1 flex flex-col">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800 text-sm">Komentar & Catatan (Opsional)</h3>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <textarea
                      rows="6"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 flex-1 resize-none border"
                      placeholder="Tuliskan evaluasi menyeluruh, kekuatan, dan kelemahan peserta..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer for Submit */}
            <div className="bg-white border-t border-gray-100 pt-6 mt-8 flex items-center justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? 'Menyimpan...' : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Kirim Evaluasi Final
                  </>
                )}
              </button>
            </div>
            
          </form>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default FormEvaluasi;
