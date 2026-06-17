import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Settings, User, UserPlus, Briefcase, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen }) => {
  const { user } = useAuth();

  const getNavItems = () => {
    const baseItems = [
      { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    ];

    const userRole = user?.role?.toUpperCase() || '';

    if (userRole === 'SUPER_ADMIN' || userRole === 'HR_ADMIN') {
      return [
        ...baseItems,
        { name: 'Lowongan Magang', path: '/hr/lowongan', icon: <BookOpen size={20} /> },
        { name: 'Kandidat Pelamar', path: '/hr/kandidat', icon: <Users size={20} /> },
        { name: 'Onboarding Kandidat', path: '/hr/onboarding', icon: <UserPlus size={20} /> },
        { name: 'Data Peserta Aktif', path: '/hr/peserta', icon: <Briefcase size={20} /> },
        { name: 'Pengaturan Sistem', path: '/admin/users', icon: <Settings size={20} /> },
      ];
    }

    if (userRole === 'MENTOR') {
      return [
        ...baseItems,
        { name: 'Monitor Magang', path: '/mentor/monitor', icon: <Users size={20} /> },
      ];
    }

    if (userRole === 'MAGANG') {
      return [
        { name: 'Dashboard', path: '/magang/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Absensi', path: '/magang/absensi', icon: <Settings size={20} /> }, // using Settings as placeholder or replace with Clock
        { name: 'Logbook Aktivitas', path: '/magang/logbook', icon: <BookOpen size={20} /> },
        { name: 'Tugas (Kanban)', path: '/magang/tugas', icon: <Briefcase size={20} /> },
        { name: 'Penyelesaian', path: '/magang/penyelesaian', icon: <CheckCircle size={20} /> },
        { name: 'Profil', path: '/magang/profil', icon: <User size={20} /> },
      ];
    }
    
    if (userRole === 'KANDIDAT') {
      return [
        ...baseItems,
        { name: 'Status Lamaran', path: '/kandidat/dashboard', icon: <User size={20} /> },
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <aside className={`bg-indigo-900 text-white w-64 min-h-screen flex-shrink-0 transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full absolute'} md:relative md:translate-x-0`}>
      <div className="h-16 flex items-center justify-center border-b border-indigo-800">
        <h1 className="text-xl font-bold tracking-wider">SI MAGANG</h1>
      </div>
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
