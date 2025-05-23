import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, LogIn, LogOut } from 'lucide-react';
import CreateEvent from './components/CreateEvent';
import EventResponse from './components/EventResponse';
import EventResults from './components/EventResults';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import { supabase } from './lib/supabase';
import { signOut } from './lib/auth';
import ManualMigration from './components/ManualMigration';
import ResetPassword from './components/ResetPassword';
import Home from './components/Home';
import PrivacyPolicy from './components/PrivacyPolicy';

function App() {
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    navigate('/'); // Redirect to the homepage after signing out
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center">
              <Calendar className="h-8 w-8 text-indigo-600" />
              <Clock className="h-8 w-8 text-indigo-600 ml-2" />
              <span className="ml-2 text-xl font-semibold text-gray-900">Yup, That Works</span>
            </Link>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-gray-900"
                  >
                    My Events
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 hover:text-gray-900"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 hover:text-indigo-700"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl min-w-full mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Home onOpenAuthModal={() => setIsAuthModalOpen(true)} />} />
          <Route path="/event/:id" element={<EventResponse />} />
          <Route path="/results/:id" element={<EventResults />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/migrate" element={<ManualMigration />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/create-event" element={<CreateEvent user={user} />} />
        </Routes>
      </main>

      <footer className="bg-gray-100 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
          <Link to="/privacy-policy" className="text-sm text-blue-500 hover:underline">
            Privacy Policy
          </Link>
        </div>
      </footer>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          navigate('/dashboard');
        }}
      />
    </div>
  );
}

export default App;