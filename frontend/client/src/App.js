import { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import Login from './components/auth/login.jsx';
import Register from './components/auth/register.jsx';
import AdminDashboard from './components/dashboards/adminDashboard.jsx';
import UserDashboard from './components/dashboards/userDashboard.jsx';
import NotFound from './pages/NotFound.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('Utilisateur chargé:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Erreur lors du parsing de user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // Composant de redirection automatique basée sur le rôle
  const RoleBasedRedirect = () => {
    if (!user) return <Navigate to="/login" />;

    console.log('Redirection basée sur le rôle:', user.role);

    switch (user.role?.toLowerCase()) {
      case 'admin':
      case 'manager':
        return <Navigate to="/admin-dashboard" />;
      case 'user':
      case 'employee':
        return <Navigate to="/user-dashboard" />;
      default:
        console.warn('Rôle non reconnu:', user.role);
        return <Navigate to="/user-dashboard" />;
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Page par défaut → redirection automatique selon le rôle */}
        <Route path="/" element={<RoleBasedRedirect />} />

        {/* Routes Auth */}
        <Route 
          path="/login" 
          element={user ? <RoleBasedRedirect /> : <Login setUser={setUser} />} 
        />
        <Route 
          path="/register" 
          element={user ? <RoleBasedRedirect /> : <Register />} 
        />

        {/* Dashboard Utilisateur */}
        <Route 
          path="/user-dashboard" 
          element={
            user && (user.role?.toLowerCase() === 'user' || user.role?.toLowerCase() === 'employee') 
              ? <UserDashboard user={user} setUser={setUser} />
              : <Navigate to="/login" />
          } 
        />

        {/* Dashboard Admin/Manager */}
        <Route 
          path="/admin-dashboard" 
          element={
            user && (user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'manager')
              ? <AdminDashboard user={user} setUser={setUser} />
              : <Navigate to="/login" />
          } 
        />

        {/* Ancienne route dashboard pour compatibilité */}
        <Route path="/dashboard" element={<RoleBasedRedirect />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

const styles = {
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem',
  }
};

export default App;
