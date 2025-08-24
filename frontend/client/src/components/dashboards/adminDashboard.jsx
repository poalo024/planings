import axios from 'axios';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '../navbar';
import Sidebar from '../sidebar';

// Import composants si tu as des composants séparés
import EmployeeManagement from '../manager/EmployeeManagement';
import TeamPlanning from '../manager/Teamplanning';

function StatCard({ title, value, color }) {
  return (
    <div style={{ ...styles.statCard, borderLeftColor: color }}>
      <h3 style={styles.statTitle}>{title}</h3>
      <p style={{ ...styles.statValue, color }}>{value}</p>
    </div>
  );
}

function Card({ title, description, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      style={{
        ...styles.card,
        transform: hover ? 'translateY(-3px)' : 'none',
        boxShadow: hover
          ? '0px 6px 12px rgba(0,0,0,0.15)'
          : '0px 3px 6px rgba(0,0,0,0.1)',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default function AdminDashboard({ user, setUser }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    todayAttendance: 0,
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
        setStats({
          totalEmployees: res.data.length,
          pendingLeaves: 0, // Tu peux ajouter une API congés
          todayAttendance: 0, // API pointage
        });
      } catch (err) {
        console.error('Erreur stats:', err);
      }
    };
    fetchStats();
  }, [token]);

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
              <h2>Tableau de bord - {user.role?.toUpperCase()}</h2>
              <div style={styles.welcomeCard}>
                <h3>Bienvenue, {user.prenom || user.nom || user.email}!</h3>
                <p>Tableau de bord de gestion pour administrateur/manager.</p>
              </div>

              <div style={styles.statsContainer}>
                <StatCard title="Total Employés" value={stats.totalEmployees} color="#4CAF50" />
                <StatCard title="Demandes en attente" value={stats.pendingLeaves} color="#FF9800" />
                <StatCard title="Présents aujourd'hui" value={stats.todayAttendance} color="#2196F3" />
              </div>

              <div style={styles.cardsContainer}>
                <Card
                  title="Gestion des Employés"
                  description="Voir et gérer tous les employés."
                  onClick={() => setActiveSection('employees')}
                />
                <Card
                  title="Planning Équipe"
                  description="Gérer le planning de toute l'équipe."
                  onClick={() => setActiveSection('planning')}
                />
              </div>
            </div>
          )}

          {activeSection === 'employees' && (
            <div style={styles.sectionContent}>
              <h2>Gestion des Employés</h2>
              <EmployeeManagement token={token} user={user} />
            </div>
          )}

          {activeSection === 'planning' && (
            <div style={styles.sectionContent}>
              <TeamPlanning currentUser={user} />
            </div>
          )}

          {activeSection === 'settings' && user.role?.toLowerCase() === 'admin' && (
            <div style={styles.sectionContent}>
              <h2>Paramètres Système</h2>
              <p>Configuration et gestion des administrateurs système.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  dashboard: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
    background: '#f4f6f8',
  },
  mainContent: {
    display: 'flex',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: '2rem',
    overflowY: 'auto',
  },
  welcomeCard: {
    background: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    marginBottom: '2rem',
    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
    borderLeft: '4px solid',
  },
  statTitle: { margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' },
  statValue: { margin: 0, fontSize: '2rem', fontWeight: 'bold' },
  cardsContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' },
  card: { background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0px 3px 6px rgba(0,0,0,0.1)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' },
  sectionContent: { background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0px 2px 4px rgba(0,0,0,0.1)', minHeight: 'calc(100vh - 200px)' },
};
