import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Auth from './components/Auth';
import Friends from './pages/Friends';
import PrivateVibes from './pages/PrivateVibes';
import Landing from './pages/Landing';

const AppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();

  // We can show a loading state while auth status is being determined
  if (loading) {
    return <div>Loading app...</div>; // Or a more sophisticated loading spinner
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-800">
      <Navbar />
      <Routes>
        <Route path="/auth" element={currentUser ? <Navigate to="/home" replace /> : <Auth />} />
        <Route path="/" element={currentUser ? <Navigate to="/home" replace /> : <Landing />} />
        
        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <PrivateRoute>
              <Friends />
            </PrivateRoute>
          }
        />
        <Route
          path="/private-vibes"
          element={
            <PrivateRoute>
              <PrivateVibes />
            </PrivateRoute>
          }
        />
        
        {/* Fallback for any unmatched route - redirect to home if logged in, or landing if not */}
        <Route path="*" element={currentUser ? <Navigate to="/home" replace /> : <Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // Note: This loading state is already handled in AppContent, but kept here for clarity or if used elsewhere
  if (loading) {
    return <div>Loading route...</div>; 
  }

  return currentUser ? <>{children}</> : <Navigate to="/auth" replace />;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppContent /> {/* AppContent is now a child of AuthProvider */}
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App; 