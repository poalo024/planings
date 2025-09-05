import axios from 'axios';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import EmployeeManagement from '../manager/EmployeeManagement';
import TeamPlanning from '../manager/Teamplanning';
import Navbar from '../navbar';
import Sidebar from '../sidebar';

export default function AdminDashboard({ user, setUser }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState({
    totalManagers: 0,
    totalEnterprises: 0,
  });

  const token = localStorage.getItem('token');

  if (!user || !['admin', 'manager'].includes(user.role?.toLowerCase())) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (user.role.toLowerCase() === 'admin') {
          const managers = res.data.filter(u => u.role === 'manager');
          const entreprises = [...new Set(managers.map(m => m.entreprise))];
          setStats({ totalManagers: managers.length, totalEnterprises: entreprises.length });
        } else if (user.role.toLowerCase() === 'manager') {
          const employees = res.data.filter(u => u.entreprise === user.entreprise && u.role === 'user');
          setStats({ totalEmployees: employees.length });
        }

      } catch (err) {
        console.error('Erreur stats:', err);
      }
    };
    fetchStats();
  }, [token, user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  const handleSectionChange = (section) => setActiveSection(section);

  return (
    <div style={styles.dashboard}>
      <Navbar user={user} onLogout={handleLogout} />
      <div style={styles.mainContent}>
        <Sidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          isManager={user.role?.toLowerCase() === 'manager'}
        />
        <div style={styles.content}>
          {activeSection === 'overview' && (
            <div>
              <h2>Tableau de bord - {user.role.toUpperCase()}</h2>
              <div style={styles.welcomeCard}>
                <h3>Bienvenue, {user.prenom || user.nom || user.email}!</h3>
                <p>Tableau de bord pour {user.role === 'admin' ? 'admin système' : 'manager'}.</p>
              </div>
              <div style={styles.statsContainer}>
                {user.role.toLowerCase() === 'admin' && (
                  <>
                    <div style={styles.statCard}>
                      <h3>Total Managers</h3>
                      <p>{stats.totalManagers}</p>
                    </div>
                    <div style={styles.statCard}>
                      <h3>Total Entreprises</h3>
                      <p>{stats.totalEnterprises}</p>
                    </div>
                  </>
                )}
                {user.role.toLowerCase() === 'manager' && (
                  <div style={styles.statCard}>
                    <h3>Total Employés</h3>
                    <p>{stats.totalEmployees}</p>
                  </div>
                )}
              </div>
              <div style={styles.cardsContainer}>
                <button onClick={() => setActiveSection('employees')} style={styles.card}>
                  Gestion des employés
                </button>
                {user.role.toLowerCase() === 'manager' && (
                  <button onClick={() => setActiveSection('planning')} style={styles.card}>
                    Planning équipe
                  </button>
                )}
              </div>
            </div>
          )}

          {activeSection === 'employees' && (
            <EmployeeManagement user={user} />
          )}

          {activeSection === 'planning' && user.role.toLowerCase() === 'manager' && (
            <TeamPlanning currentUser={user} />
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  dashboard: { display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Arial, sans-serif', background: '#f4f6f8' },
  mainContent: { display: 'flex', flex: 1 },
  content: { flex: 1, padding: '2rem', overflowY: 'auto' },
  welcomeCard: { background: '#fff', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' },
  statsContainer: { display: 'flex', gap: '1rem', marginBottom: '2rem' },
  statCard: { flex: 1, background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' },
  cardsContainer: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  card: { padding: '1rem', background: '#1976d2', color: 'white', borderRadius: '8px', cursor: 'pointer', flex: 1, textAlign: 'center' },
};
