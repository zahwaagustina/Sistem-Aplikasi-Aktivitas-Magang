import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Users, Briefcase, GraduationCap, Award, TrendingUp } from 'lucide-react';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
      {trend && (
        <p className="text-xs text-emerald-600 font-medium flex items-center mt-2">
          <TrendingUp className="w-3 h-3 mr-1" /> {trend}
        </p>
      )}
    </div>
    <div className={`p-4 rounded-xl ${color}`}>
      <Icon className="w-8 h-8 text-white" />
    </div>
  </div>
);

const DashboardAnalitik = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-gray-500">Gagal memuat data analitik.</div>;

  const { overview, funnelData, divisiData } = data;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Analitik</h1>
        <p className="text-gray-500 mt-1">Ringkasan performa rekrutmen dan operasional magang.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Kandidat" 
          value={overview.kandidat} 
          icon={Users} 
          color="bg-indigo-500" 
          trend="Pendaftar Baru" 
        />
        <StatCard 
          title="Peserta Aktif" 
          value={overview.pesertaAktif} 
          icon={GraduationCap} 
          color="bg-emerald-500" 
          trend="Sedang Magang"
        />
        <StatCard 
          title="Total Mentor" 
          value={overview.mentor} 
          icon={Award} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="Lowongan Aktif" 
          value={overview.lowonganAktif} 
          icon={Briefcase} 
          color="bg-rose-500" 
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Funnel Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-3"></span>
            Funnel Rekrutmen
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <RechartsTooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="value" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={50}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Divisi Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <span className="w-1.5 h-6 bg-emerald-500 rounded-full mr-3"></span>
            Distribusi Divisi Magang
          </h3>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={divisiData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {divisiData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardAnalitik;
