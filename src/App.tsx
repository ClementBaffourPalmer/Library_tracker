import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { SignUpForm } from './components/auth/SignUpForm';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { PhysicalBooks } from './components/books/PhysicalBooks';
import { ELibrary } from './components/library/ELibrary';
import { AdminDashboard } from './components/admin/AdminDashboard';

function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002F6C] via-[#004a9c] to-[#002F6C] flex items-center justify-center p-4">
      {isLogin ? (
        <LoginForm onToggleMode={() => setIsLogin(false)} />
      ) : (
        <SignUpForm onToggleMode={() => setIsLogin(true)} />
      )}
    </div>
  );
}

function MainApp() {
  const { user, profile, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#002F6C]"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onNavigate={setCurrentView} currentView={currentView} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'books' && <PhysicalBooks />}
        {currentView === 'library' && <ELibrary />}
        {currentView === 'admin' && profile.role === 'admin' && <AdminDashboard />}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
