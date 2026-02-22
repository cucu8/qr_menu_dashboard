import { Routes, Route, Navigate } from 'react-router-dom';
import RestaurantPage from './pages/RestaurantPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<RestaurantPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
