// client/src/App.jsx
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import UploadList from './pages/UploadList';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setToken('');
  };

  return (
    <Routes>
      {/* Login Route */}
      <Route
        path="/login"
        element={<LoginPage setIsLoggedIn={setIsLoggedIn} setToken={handleLogin} />}
      />

      {/* Dashboard Route */}
      <Route
        path="/dashboard"
        element={
          isLoggedIn ? (
            <Dashboard token={token} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        {/* Nested routes inside Dashboard */}
        <Route path="upload" element={<UploadPage token={token} />} />
        <Route path="list" element={<UploadList token={token} />} />
      </Route>

      {/* Catch-all for 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
