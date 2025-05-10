import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUserState } from '../lib/auth';

interface HomeProps {
  onOpenAuthModal: (type: 'login' | 'signup') => void;
}

const Home: React.FC<HomeProps> = ({ onOpenAuthModal }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const checkUserState = async () => {
      const { user } = await getUserState();
      if (user) {
        navigate('/dashboard');
      }
    };

    checkUserState();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center bg-gray-50 text-center p-6">
      <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-sm text-gray-500 mb-6">
        Logo Placeholder
      </div>
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Yup, That Works!</h1>
      <p className="text-lg text-gray-600 mb-4">Here at YTW, we make it easy to organize events, keep track of responses, and so much more.</p>
      <p className="text-base text-blue-600 font-medium">
        Ready to dive in?{' '}
        <button
          onClick={() => onOpenAuthModal('login')}
          className="underline text-blue-500 hover:text-blue-700"
        >
          Log in
        </button>{' '}
        or{' '}
        <button
          onClick={() => onOpenAuthModal('signup')}
          className="underline text-blue-500 hover:text-blue-700"
        >
          Sign up
        </button>
        .
      </p>
      <p className="text-lg text-blue-600 font-medium mt-6 mb-4">
        Want to get started right away?
      </p>
      <Link
        to="/create-event"
        className="inline-block px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-600"
      >
        Create an Event
      </Link>
    </div>
  );
};

export default Home;