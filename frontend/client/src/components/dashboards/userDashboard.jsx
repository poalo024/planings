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

if (!user || (user.role?.toLowerCase() !== 'user' && user.role?.toLowerCase() !== 'employee')) {
return <Navigate to="/login" />;
}

useEffect(() => {
loadUserStats();
}, []);

const loadUserStats = async () => {
try {
    // Ici vous appelleriez votre API pour récupérer les stats de l'utilisateur
    setUserStats({
    plannedHours: 40,
    workedHours: 35,
    remainingLeaves: 25,
    pendingRequests: 2
    });
} catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error);
}
};

const handleSectionChange = (section) => {
setActiveSection(section);
};

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
    <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        isManager={false}
    />
    
    <div style={styles.content}>
        {activeSection === 'overview' && (
        <div>
            <h2>Tableau de bord - Employé</h2>
            <div style={styles.welcomeCard}>
            <h3>Bienvenue, {user.prenom || user.nom || user.email}!</h3>
            <p>Votre espace personnel pour gérer votre travail.</p>
            </div>
            
            <div style={styles.statsContainer}>
            <StatCard 
                title="Heures cette semaine" 
                value={`${userStats.workedHours}/${userStats.plannedHours}h`}
                color="#4CAF50"
            />
            <StatCard 
                title="Congés restants" 
                value={userStats.remainingLeaves}
                color="#2196F3"
            />
            <StatCard 
                title="Demandes en cours" 
                value={userStats.pendingRequests}
                color="#FF9800"
            />
            </div>
            
            <div style={styles.cardsContainer}>
            <Card 
                title="Mon Planning" 
                description="Consulter votre planning de travail et vos heures." 
                onClick={() => setActiveSection('planning')}
            />
            <Card 
                title="Demandes de Congé" 
                description="Faire une demande de congé ou consulter l'historique." 
                onClick={() => setActiveSection('conges')}
            />
            <Card 
                title="Mes Heures" 
                description="Suivre vos heures de travail et pointages." 
                onClick={() => setActiveSection('heures')}
            />
            <Card 
                title="Mon Profil" 
                description="Modifier vos informations personnelles." 
                onClick={() => setActiveSection('profil')}
            />
            </div>
        </div>
        )}
        
        {activeSection === 'planning' && (
        <div style={styles.sectionContent}>
            <PlanningManagement currentUser={user} />
        </div>
        )}
        
        {activeSection === 'conges' && (
        <div style={styles.sectionContent}>
            <h2>Mes Demandes de Congé</h2>
            <p>Interface pour gérer vos demandes de congé.</p>
            {/* Ici vous intégreriez votre composant de demandes de congé */}
        </div>
        )}
        
        {activeSection === 'heures' && (
        <div style={styles.sectionContent}>
            <h2>Suivi de mes Heures</h2>
            <p>Consultez le détail de vos heures travaillées et pointages.</p>
            {/* Ici vous intégreriez votre composant de suivi des heures */}
        </div>
        )}
        
        {activeSection === 'profil' && (
        <div style={styles.sectionContent}>
            <h2>Mon Profil</h2>
            <p>Modifier vos informations personnelles.</p>
            {/* Ici vous intégreriez votre composant de gestion de profil */}
        </div>
        )}
    </div>
    </div>
</div>
);
}

// Composant StatCard
function StatCard({ title, value, color }) {
return (
<div style={{...styles.statCard, borderLeftColor: color}}>
    <h3 style={styles.statTitle}>{title}</h3>
    <p style={{...styles.statValue, color}}>{value}</p>
</div>
);
}

// Composant Card
function Card({ title, description, onClick }) {
return (
<div style={styles.card} onClick={onClick}>
    <h3>{title}</h3>
    <p>{description}</p>
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
statTitle: {
margin: '0 0 0.5rem 0',
fontSize: '0.9rem',
color: '#666',
textTransform: 'uppercase',
letterSpacing: '0.5px',
},
statValue: {
margin: 0,
fontSize: '2rem',
fontWeight: 'bold',
},
cardsContainer: {
display: 'grid',
gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
gap: '1rem',
},
card: {
background: '#fff',
padding: '1.5rem',
borderRadius: '8px',
boxShadow: '0px 3px 6px rgba(0,0,0,0.1)',
transition: 'transform 0.2s, box-shadow 0.2s',
cursor: 'pointer',
':hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0px 5px 12px rgba(0,0,0,0.15)',
}
},
sectionContent: {
background: '#fff',
padding: '2rem',
borderRadius: '8px',
boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
minHeight: 'calc(100vh - 200px)',
}
};