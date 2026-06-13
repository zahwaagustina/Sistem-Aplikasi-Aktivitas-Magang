import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Settings, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen }) => {
  const { user } = useAuth();

  const getNavItems = () => {
    const baseItems = [
      { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    ];

    const userRole = user?.role?.toUpperCase() || '';

    if (userRole === 'ADMIN') {
      return [
        ...baseItems,
        { name: 'Manage Users', path: '/admin/users', icon: <Users size={20} /> },
        { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
      ];
    }

    if (userRole === 'PEMBIMBING') {
      return [
        ...baseItems,
        { name: 'Monitor Magang', path: '/pembimbing/monitor', icon: <Users size={20} /> },
      ];
    }

    if (userRole === 'MAGANG') {
      return [
        ...baseItems,
        { name: 'Logbook Aktivitas', path: '/magang/logbook', icon: <BookOpen size={20} /> },
        { name: 'Profil', path: '/magang/profil', icon: <User size={20} /> },
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
