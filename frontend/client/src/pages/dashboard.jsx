import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import Sidebar from '../components/sidebar';

export default function Dashboard() {
const storedUser = JSON.parse(localStorage.getItem('user'));
const [user, setUser] = useState(storedUser);
const [activeSection, setActiveSection] = useState('overview');
const [notifications, setNotifications] = useState([]);

if (!user) return <Navigate to="/login" />;

useEffect(() => {
// Exemple fetch notifications
setNotifications([
    { id: 1, message: "Votre planning a été mis à jour." },
    { id: 2, message: "Congé validé par le manager." },
]);
}, []);

const handleSectionChange = (section) => {
setActiveSection(section);
};

return (
<div style={styles.dashboard}>
    <Navbar user={user} setUser={setUser} />

    <div style={styles.mainContent}>
    <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        isManager={user.role === 'manager'}
    />

    <div style={styles.content}>
        {activeSection === 'overview' && (
        <div style={styles.cardsContainer}>
            <Card title="Planning" description="Voir et gérer le planning de l'équipe." />
            <Card title="Congés" description="Suivi des congés et absences." />
            <Card title="Pointage" description="Suivi des heures de travail des employés." />
            <Card title="Notifications" description={`Vous avez ${notifications.length} notifications.`} />
        </div>
        )}

        {activeSection === 'planning' && <Section title="Planning de l'équipe" />}
        {activeSection === 'conges' && <Section title="Congés et absences" />}
        {activeSection === 'pointage' && <Section title="Pointage des employés" />}
        {activeSection === 'notifications' && (
        <div>
            <h2>Notifications</h2>
            <ul>
            {notifications.map((note) => (
                <li key={note.id}>{note.message}</li>
            ))}
            </ul>
        </div>
        )}
        {activeSection === 'admin' && user.role === 'manager' && (
        <Section title="Gestion avancée (Manager)" />
        )}
    </div>
    </div>
</div>
);
}

// Composant Carte
function Card({ title, description }) {
return (
<div style={styles.card}>
    <h3>{title}</h3>
    <p>{description}</p>
</div>
);
}

// Composant Section
function Section({ title }) {
return (
<div style={{ padding: '1rem', background: '#fff', borderRadius: '8px' }}>
    <h2>{title}</h2>
    <p>Contenu de la section ici...</p>
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
cardsContainer: {
display: 'grid',
gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
gap: '1rem',
},
card: {
background: '#fff',
padding: '1rem',
borderRadius: '8px',
boxShadow: '0px 3px 6px rgba(0,0,0,0.1)',
transition: 'transform 0.2s',
cursor: 'pointer',
},
};
