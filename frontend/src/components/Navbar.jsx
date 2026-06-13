import React from 'react';
import { Menu, Bell, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 lg:px-8 z-10 relative">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 mr-4 text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <Menu size={24} />
        </button>

      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-400 hover:text-gray-600 relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center space-x-2 border-l pl-4 border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-700">{user?.username?.replace(/\.(magang|pembimbing|admin)$/i, '') || 'User'}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <UserCircle size={32} className="text-indigo-600" />
        </div>

        <button 
          onClick={handleLogout}
          className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-1"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline text-sm font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
