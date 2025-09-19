import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HomeIcon, UserGroupIcon, BookOpenIcon, UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { currentUser, logout, echoId } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav className="bg-surface dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary dark:text-white">
              Echo
            </Link>
            <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500">by Claude</span>
          </div>
          
          {/* Mobile menu button */}
          {currentUser && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6 dark:text-white" />
              ) : (
                <Bars3Icon className="h-6 w-6 dark:text-white" />
              )}
            </button>
          )}

          {/* Desktop menu */}
          {currentUser && (
            <div className="hidden md:flex space-x-4">
              <Link to="/" className="flex items-center px-3 py-2 text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-white">
                <HomeIcon className="h-6 w-6 mr-1" />
                <span>Home</span>
              </Link>
              <Link to="/profile" className="flex items-center px-3 py-2 text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-white">
                <UserIcon className="h-6 w-6 mr-1" />
                <span>Profile</span>
              </Link>
              <Link to="/friends" className="flex items-center px-3 py-2 text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-white">
                <UserGroupIcon className="h-6 w-6 mr-1" />
                <span>Friends</span>
              </Link>
              <Link to="/private-vibes" className="flex items-center px-3 py-2 text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-white">
                <BookOpenIcon className="h-6 w-6 mr-1" />
                <span>Private Vibes</span>
              </Link>
            </div>
          )}

          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {echoId}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
              >
                Login
              </Link>
            )}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isDarkMode ? '🌞' : '🌙'}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && currentUser && (
          <div className="md:hidden py-4 space-y-2 bg-surface dark:bg-gray-800">
            <Link
              to="/"
              className="flex items-center px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              <HomeIcon className="h-6 w-6 mr-2" />
              <span>Home</span>
            </Link>
            <Link
              to="/profile"
              className="flex items-center px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              <UserIcon className="h-6 w-6 mr-2" />
              <span>Profile</span>
            </Link>
            <Link
              to="/friends"
              className="flex items-center px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              <UserGroupIcon className="h-6 w-6 mr-2" />
              <span>Friends</span>
            </Link>
            <Link
              to="/private-vibes"
              className="flex items-center px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              <BookOpenIcon className="h-6 w-6 mr-2" />
              <span>Private Vibes</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 