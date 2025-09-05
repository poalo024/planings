import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import PlanningManagement from '../manager/PlanningManagement';
import Navbar from '../navbar';
import Sidebar from '../sidebar';

export default function UserDashboard({ user, setUser }) {
const [activeSection, setActiveSection] = useState('overview');
const [userStats, setUserStats] = useState({
plannedHours: 0,
workedHours: 0,
remainingLeaves: 0,
pendingRequests: 0
});

if (!user || user.role.toLowerCase() !== 'user') {
return <Navigate to="/login" />;
}

useEffect(() => {
loadUserStats();
}, []);

const loadUserStats = async () => {
setUserStats({ plannedHours: 40, workedHours: 35, remainingLeaves: 25, pendingRequests: 2 });
};

const handleSectionChange = (section) => setActiveSection(section);

const handleLogout = () => {
localStorage.removeItem('token');
localStorage.removeItem('user');
setUser(null);
window.location.href = '/login';
};

return (
<div style={styles.dashboard}>
    <Navbar user={user} onLogout={handleLogout} />
    <div style={styles.mainContent}>
    <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} isManager={false} />
    <div style={styles.content}>
        {activeSection === 'overview' && (
        <div>
            <h2>Tableau de bord - Employé</h2>
            <div style={styles.welcomeCard}>
            <h3>Bienvenue, {user.prenom || user.nom || user.email}!</h3>
            <p>Votre espace personnel pour gérer votre travail.</p>
            </div>
        </div>
        )}
        {activeSection === 'planning' && (
        <PlanningManagement currentUser={user} />
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
};
