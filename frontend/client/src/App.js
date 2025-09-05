import { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import FirstLogin from './components/auth/Firstlogin.jsx';
import Login from './components/auth/login.jsx';
import Register from './components/auth/register.jsx';
import AdminDashboard from './components/dashboards/adminDashboard.jsx';
import SystemDashboard from './components/dashboards/systemDashboard.jsx';
import UserDashboard from './components/dashboards/userDashboard.jsx';
import NotFound from './pages/NotFound.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chargement des infos utilisateur depuis localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Erreur parsing user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={styles.loading}>
        <p>Chargement...</p>
      </div>
    );
  }

  // Fonction pour rediriger selon le rôle
  const RoleBasedRedirect = () => {
    if (!user) return <Navigate to="/login" />;
    const userRole = user.role?.toLowerCase();
    switch (userRole) {
      case 'admin':
      case 'system-admin':
        return <Navigate to="/system-dashboard" />;
      case 'manager':
        return <Navigate to="/admin-dashboard" />;
      case 'user':
      case 'employee':
        return <Navigate to="/user-dashboard" />;
      default:
        return <Navigate to="/login" />;
    }
  };

  return (
    <Router future={{ v7_relativeSplatPath: true }}>
      <Routes>
        {/* Redirection par défaut */}
        <Route path="/" element={<RoleBasedRedirect />} />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={user ? <RoleBasedRedirect /> : <Login setUser={setUser} />}
        />
        <Route
          path="/register"
          element={user ? <RoleBasedRedirect /> : <Register />}
        />

        {/* ✅ Correction : route pour activation de compte */}
        <Route path="/first-login" element={<FirstLogin />} />

        {/* Dashboards */}
        <Route
          path="/user-dashboard"
          element={
            user && ['user', 'employee'].includes(user.role?.toLowerCase()) ? (
              <UserDashboard user={user} setUser={setUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            user && user.role?.toLowerCase() === 'manager' ? (
              <AdminDashboard user={user} setUser={setUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/system-dashboard"
          element={
            user && ['admin', 'system-admin'].includes(user.role?.toLowerCase()) ? (
              <SystemDashboard user={user} setUser={setUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Compatibilité */}
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
  },
};

export default App;
