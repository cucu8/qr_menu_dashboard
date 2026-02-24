import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RestaurantPage from './pages/RestaurantPage';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import { getToken } from './api';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function PrivateRoute({ children }: { children: React.ReactElement }) {
  const token = getToken();
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute><RestaurantPage /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
    </>
  );
}

export default App;
