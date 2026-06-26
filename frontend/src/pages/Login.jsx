import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, ChevronRight, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await login(username, password);
      // The redirect is handled by App.jsx automatically when user state changes
    } catch (err) {
      setError(err.response?.data?.message || 'Username atau password salah!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 flex flex-col items-center justify-center p-4 font-sans">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Login Here</h1>
          <p className="text-slate-500 text-lg">Welcome back! Please enter your details.</p>
        </div>
        
        <div className="bg-white/30 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-8 sm:p-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Email*</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError('');
                  }}
                  className="block w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Password*</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="block w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                  placeholder="Enter your password here"
                  required
                />
                <div 
                  className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm mt-6 mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-slate-600">Remember Me</span>
              </label>
              <Link to="/forgot-password" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">Forgot Password?</Link>
            </div>

            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full bg-[#004aad] text-white rounded-full py-4 font-bold hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center justify-center shadow-md disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          {/* Popups */}
          {error && (
            <div className="mt-6">
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-100 flex items-center space-x-3 transition-all">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                <p className="font-semibold text-sm">{error}</p>
              </div>
            </div>
          )}
          
          <div className="mt-8 text-center text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#004aad] font-bold hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
