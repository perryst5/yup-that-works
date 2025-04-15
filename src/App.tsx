import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Calendar, Clock, LogIn, LogOut } from 'lucide-react';
import CreateEvent from './components/CreateEvent';
import EventResponse from './components/EventResponse';
import EventResults from './components/EventResults';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import { supabase } from './lib/supabase';
import { signOut } from './lib/auth';
import ManualMigration from './components/ManualMigration';

function App() {
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
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

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<CreateEvent user={user} />} />
            <Route path="/event/:id" element={<EventResponse />} />
            <Route path="/results/:id" element={<EventResults />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/migrate" element={<ManualMigration />} />
          </Routes>
        </main>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => setIsAuthModalOpen(false)}
        />
      </div>
    </Router>
  );
}

export default App;