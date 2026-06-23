import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const FormEvaluasi = ({ pesertaId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [rekapLoading, setRekapLoading] = useState(true);
  const [rekap, setRekap] = useState(null);
  
  const [detailPenilaian, setDetailPenilaian] = useState({
    q1: 5, q2: 5, q3: 5, q4: 5, q5: 5,
    q6: 5, q7: 5, q8: 5, q9: 5, q10: 5,
    q11: 5, q12: 5, q13: 5,
    q14: 5, q15: 5
  });
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const fetchRekap = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/mentor/anak-magang/${pesertaId}/absensi`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRekap(response.data.data);
      } catch (err) {
        console.error('Error fetching rekap:', err);
      } finally {
        setRekapLoading(false);
      }
    };
    fetchRekap();
  }, [pesertaId]);

  const sumSikap = detailPenilaian.q1 + detailPenilaian.q2 + detailPenilaian.q3 + detailPenilaian.q4 + detailPenilaian.q5;
  const skorSikap = (sumSikap / 25) * 30;

  const sumKinerja = detailPenilaian.q6 + detailPenilaian.q7 + detailPenilaian.q8 + detailPenilaian.q9 + detailPenilaian.q10;
  const skorKinerja = (sumKinerja / 25) * 40;

  const sumKeterampilan = detailPenilaian.q11 + detailPenilaian.q12 + detailPenilaian.q13;
  const skorKeterampilan = (sumKeterampilan / 15) * 20;

  const sumAdministrasi = detailPenilaian.q14 + detailPenilaian.q15;
  const skorAdministrasi = (sumAdministrasi / 10) * 10;

  const totalAkhir = skorSikap + skorKinerja + skorKeterampilan + skorAdministrasi;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/mentor/anak-magang/${pesertaId}/evaluasi`, {
        tipe: 'FINAL',
        detail_penilaian: detailPenilaian,
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

  const handleScoreChange = (q, value) => {
    setDetailPenilaian(prev => ({ ...prev, [q]: parseInt(value) }));
  };

  const questions = {
    sikap: [
      { id: 'q1', text: 'Disiplin dan kepatuhan terhadap aturan' },
      { id: 'q2', text: 'Kejujuran dan integritas' },
      { id: 'q3', text: 'Tanggung jawab terhadap tugas' },
      { id: 'q4', text: 'Etika dan sopan santun' },
      { id: 'q5', text: 'Motivasi dan kemauan belajar' },
    ],
    kinerja: [
      { id: 'q6', text: 'Pemahaman terhadap tugas' },
      { id: 'q7', text: 'Kualitas hasil pekerjaan' },
      { id: 'q8', text: 'Ketepatan waktu penyelesaian tugas' },
      { id: 'q9', text: 'Kemampuan bekerja mandiri' },
      { id: 'q10', text: 'Kemampuan bekerja dalam tim' },
    ],
    keterampilan: [
      { id: 'q11', text: 'Komunikasi lisan dan tertulis' },
      { id: 'q12', text: 'Penggunaan alat/teknologi kerja' },
      { id: 'q13', text: 'Inisiatif dan kreativitas' },
    ],
    administrasi: [
      { id: 'q14', text: 'Kepatuhan jam kerja' },
      { id: 'q15', text: 'Kerapihan administrasi & laporan' },
    ]
  };

  const QuestionRow = ({ q }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-gray-100 last:border-0 gap-3">
      <div className="text-sm text-gray-700 flex-1">{q.text}</div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(score => (
          <label key={score} className="cursor-pointer">
            <input 
              type="radio" 
              name={q.id} 
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

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col my-8">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-indigo-50/50 rounded-t-2xl sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-800">Form Evaluasi Kinerja</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <form id="eval-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Informasi Skala */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
              <strong>Skala Penilaian:</strong> 1 = Sangat Kurang | 2 = Kurang | 3 = Cukup | 4 = Baik | 5 = Sangat Baik
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                {/* Aspek 1 */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 text-sm">1. Aspek Sikap & Etika Kerja (30%)</h3>
                    <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Skor: {skorSikap.toFixed(1)}</span>
                  </div>
                  <div className="px-4">
                    {questions.sikap.map(q => <QuestionRow key={q.id} q={q} />)}
                  </div>
                </div>

                {/* Aspek 3 */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 text-sm">3. Aspek Keterampilan Pendukung (20%)</h3>
                    <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Skor: {skorKeterampilan.toFixed(1)}</span>
                  </div>
                  <div className="px-4">
                    {questions.keterampilan.map(q => <QuestionRow key={q.id} q={q} />)}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {/* Aspek 2 */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 text-sm">2. Aspek Kinerja & Kemampuan Kerja (40%)</h3>
                    <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Skor: {skorKinerja.toFixed(1)}</span>
                  </div>
                  <div className="px-4">
                    {questions.kinerja.map(q => <QuestionRow key={q.id} q={q} />)}
                  </div>
                </div>

                {/* Aspek 4 */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 text-sm">4. Aspek Administrasi & Kepatuhan (10%)</h3>
                    <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Skor: {skorAdministrasi.toFixed(1)}</span>
                  </div>
                  <div className="px-4">
                    {questions.administrasi.map(q => <QuestionRow key={q.id} q={q} />)}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              {/* Rekap Kehadiran */}
              <div className="border border-gray-200 rounded-xl overflow-hidden h-fit">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-bold text-gray-800 text-sm">C. Rekap Kehadiran Magang (Otomatis)</h3>
                </div>
                <div className="p-4">
                  {rekapLoading ? (
                    <div className="text-center py-4 text-sm text-gray-500">Memuat data kehadiran...</div>
                  ) : rekap ? (
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b"><td className="py-2 text-gray-600">Total Hari Kerja</td><td className="py-2 font-medium text-right">{rekap.total} Hari</td></tr>
                        <tr className="border-b"><td className="py-2 text-gray-600">Hadir</td><td className="py-2 font-medium text-right text-green-600">{rekap.hadir} Hari</td></tr>
                        <tr className="border-b"><td className="py-2 text-gray-600">Izin</td><td className="py-2 font-medium text-right text-yellow-600">{rekap.izin} Hari</td></tr>
                        <tr className="border-b"><td className="py-2 text-gray-600">Sakit</td><td className="py-2 font-medium text-right text-orange-600">{rekap.sakit} Hari</td></tr>
                        <tr><td className="py-2 text-gray-600">Tanpa Keterangan</td><td className="py-2 font-medium text-right text-red-600">{rekap.alpa} Hari</td></tr>
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-4 text-sm text-gray-500">Gagal memuat rekap.</div>
                  )}
                  {rekap && rekap.total > 0 && (
                    <div className="mt-3 bg-indigo-50 p-3 rounded-lg text-center font-bold text-indigo-700 text-sm">
                      Persentase Kehadiran: {((rekap.hadir / rekap.total) * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>

              {/* Total Skor & Feedback */}
              <div className="space-y-6">
                <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                  <div className="text-indigo-100 text-sm font-medium mb-1 uppercase tracking-wider">Skor Akhir Evaluasi</div>
                  <div className="text-5xl font-black">{totalAkhir.toFixed(1)}</div>
                  <div className="text-indigo-100 text-xs mt-2">Dikonversi ke skala 1-100 berdasarkan pembobotan</div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Feedback Kualitatif (Komentar Tambahan)</label>
                  <textarea 
                    required
                    rows="4"
                    className="w-full rounded-xl border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-sm text-gray-700"
                    placeholder="Tuliskan evaluasi menyeluruh, kekuatan, dan kelemahan peserta..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl sticky bottom-0 z-10">
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
            Kirim Evaluasi Final
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormEvaluasi;
