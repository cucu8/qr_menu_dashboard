import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RestaurantPage from './pages/RestaurantPage';
import LoginPage from './pages/LoginPage';
import { getToken } from './api';
import './App.css';

function PrivateRoute({ children }: { children: React.ReactElement }) {
  const token = getToken();
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><RestaurantPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
