import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Bell, User, BookOpen } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onNavigate: (view: string) => void;
  currentView: string;
}

export function Header({ onNavigate, currentView }: HeaderProps) {
  const { profile, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isAdmin = profile?.role === 'admin';

  return (
    <header className="bg-[#002F6C] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <BookOpen className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">SmartLib UEW</h1>
              <p className="text-xs text-gray-300">Digital Library System</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-2 rounded-lg transition ${
                currentView === 'dashboard'
                  ? 'bg-white/20'
                  : 'hover:bg-white/10'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('library')}
              className={`px-3 py-2 rounded-lg transition ${
                currentView === 'library'
                  ? 'bg-white/20'
                  : 'hover:bg-white/10'
              }`}
            >
              E-Library
            </button>
            <button
              onClick={() => onNavigate('books')}
              className={`px-3 py-2 rounded-lg transition ${
                currentView === 'books'
                  ? 'bg-white/20'
                  : 'hover:bg-white/10'
              }`}
            >
              Physical Books
            </button>
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3 py-2 rounded-lg transition ${
                  currentView === 'admin'
                    ? 'bg-white/20'
                    : 'hover:bg-white/10'
                }`}
              >
                Admin Panel
              </button>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/10 rounded-lg transition relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#C8102E] rounded-full"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition"
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <span className="hidden sm:block text-sm">{profile?.full_name}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                    <p className="text-xs text-gray-500">{profile?.email}</p>
                  </div>
                  <button
                    onClick={async () => {
                      await signOut();
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
