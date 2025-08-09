// src/App.js
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Login from './components/auth/login.jsx';
import Register from './components/auth/register.jsx';
import Navbar from './components/navbar.jsx'; // Ajoutez l'extension .jsx
import Dashboard from './pages/dashboard.jsx';
import Home from './pages/home.jsx';

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}