import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 font-sans overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>
      </div>

      <div className="flex w-full h-full z-10 relative">
        <Sidebar isOpen={sidebarOpen} />
        
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <Navbar toggleSidebar={toggleSidebar} />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-all"
                onClick={() => setSidebarOpen(false)}
              ></div>
            )}
            
            <div className="max-w-7xl mx-auto z-10 relative">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
