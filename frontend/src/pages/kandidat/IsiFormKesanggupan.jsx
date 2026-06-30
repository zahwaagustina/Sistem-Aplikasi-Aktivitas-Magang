import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const IsiFormKesanggupan = () => {
  const [form, setForm] = useState(null);
  const [pendaftaran, setPendaftaran] = useState(null); // Assuming pendaftaranId is passed or we get it
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveFormAndPendaftaran();
  }, []);

  const fetchActiveFormAndPendaftaran = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get candidates lamaran (find the one waiting for kesanggupan)
      const resLamaran = await axios.get(`${API_URL}/kandidat/lamaran`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const targetLamaran = resLamaran.data.data.find(l => l.status === 'WAITING_KESANGGUPAN');
      
      if (!targetLamaran) {
        toast.info('Tidak ada form kesanggupan yang perlu Anda isi saat ini.');
        navigate('/kandidat/dashboard');
        return;
      }
      setPendaftaran(targetLamaran);

      // Get active form
      const resForm = await axios.get(`${API_URL}/dynamic-forms/kandidat/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm(resForm.data.data);
      
      // Initialize answers
      const initialAnswers = {};
      resForm.data.data.pertanyaan.forEach(q => {
        if (q.tipe_pertanyaan === 'CHECKBOX') {
          initialAnswers[q.id] = [];
        } else {
          initialAnswers[q.id] = '';
        }
      });
      setAnswers(initialAnswers);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Form kesanggupan belum tersedia. Silakan hubungi HR.');
      } else {
        toast.error('Gagal mengambil data form');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (questionId, value, type) => {
    if (type === 'CHECKBOX') {
      const currentArr = answers[questionId] || [];
      if (currentArr.includes(value)) {
        setAnswers({ ...answers, [questionId]: currentArr.filter(v => v !== value) });
      } else {
        setAnswers({ ...answers, [questionId]: [...currentArr, value] });
      }
    } else {
      setAnswers({ ...answers, [questionId]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi required
    for (const q of form.pertanyaan) {
      if (q.is_required) {
        const val = answers[q.id];
        if (q.tipe_pertanyaan === 'CHECKBOX') {
          if (!val || val.length === 0) {
            toast.error(`Pertanyaan "${q.pertanyaan}" wajib diisi`);
            return;
          }
        } else {
          if (!val || val.trim() === '') {
            toast.error(`Pertanyaan "${q.pertanyaan}" wajib diisi`);
            return;
          }
        }
      }
    }

    if (!window.confirm('Apakah Anda yakin dengan jawaban ini? Jawaban tidak dapat diubah setelah dikirim.')) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const payloadAnswers = Object.keys(answers).map(qId => {
        const q = form.pertanyaan.find(p => p.id === parseInt(qId));
        return {
          question_id: parseInt(qId),
          jawaban_teks: q.tipe_pertanyaan !== 'CHECKBOX' ? answers[qId] : null,
          jawaban_array: q.tipe_pertanyaan === 'CHECKBOX' ? answers[qId] : null
        };
      });

      await axios.post(`${API_URL}/dynamic-forms/kandidat/submit/${pendaftaran.id}`, {
        form_id: form.id,
        answers: payloadAnswers
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Form Kesanggupan berhasil dikirim!');
      navigate('/kandidat/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengirim form');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Memuat Form...</div>;
  if (!form) return <div className="p-6 text-center text-red-500">Form tidak ditemukan.</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 mb-12">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">{form.judul}</h1>
          <p className="text-blue-100 text-lg opacity-90">{form.deskripsi}</p>
        </div>
        
        <div className="p-8 bg-gray-50/50">
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 text-blue-800">
            <FiAlertCircle className="shrink-0 mt-0.5 text-blue-600" size={20} />
            <div>
              <p className="font-semibold text-sm">Informasi Penting</p>
              <p className="text-xs mt-1">Harap isi form ini dengan sebenar-benarnya. Jawaban Anda akan menentukan proses wawancara. Form yang telah disubmit tidak dapat diubah kembali.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {form.pertanyaan.map((q, index) => {
              const opts = q.opsi_json ? JSON.parse(q.opsi_json) : [];
              return (
                <div key={q.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all hover:border-blue-300">
                  <label className="block text-gray-800 font-semibold mb-3 text-lg">
                    {index + 1}. {q.pertanyaan}
                    {q.is_required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {q.tipe_pertanyaan === 'SHORT_TEXT' && (
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                      value={answers[q.id] || ''}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                      placeholder="Ketik jawaban Anda..."
                      required={q.is_required}
                    />
                  )}

                  {q.tipe_pertanyaan === 'PARAGRAPH' && (
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow h-32"
                      value={answers[q.id] || ''}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                      placeholder="Ketik jawaban Anda secara detail..."
                      required={q.is_required}
                    />
                  )}

                  {q.tipe_pertanyaan === 'DATE' && (
                    <input
                      type="date"
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                      value={answers[q.id] || ''}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                      required={q.is_required}
                    />
                  )}

                  {q.tipe_pertanyaan === 'RADIO' && (
                    <div className="space-y-3 mt-4">
                      {opts.map((opt, i) => (
                        <label key={i} className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <input
                            type="radio"
                            name={`q_${q.id}`}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={(e) => handleChange(q.id, e.target.value)}
                            required={q.is_required}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-3 text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.tipe_pertanyaan === 'CHECKBOX' && (
                    <div className="space-y-3 mt-4">
                      {opts.map((opt, i) => (
                        <label key={i} className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            value={opt}
                            checked={(answers[q.id] || []).includes(opt)}
                            onChange={(e) => handleChange(q.id, e.target.value, 'CHECKBOX')}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-3 text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.tipe_pertanyaan === 'DROPDOWN' && (
                    <select
                      className="w-full md:w-1/2 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                      value={answers[q.id] || ''}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                      required={q.is_required}
                    >
                      <option value="" disabled>Pilih salah satu...</option>
                      {opts.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                </div>
              );
            })}

            <div className="pt-6 border-t border-gray-200 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? 'Mengirim...' : (
                  <>
                    <FiCheckCircle className="mr-2" size={20} />
                    Kirim Jawaban
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IsiFormKesanggupan;
