// src/components/navbar.jsx
import { Link } from 'react-router-dom';
import { auth } from '../services/api';

export default function Navbar() {
const user = auth.getCurrentUser();

const handleLogout = () => {
auth.logout();
window.location.reload();
};

return (
<nav style={{display: 'flex', gap: '1rem', padding: '1rem'}}>
    <Link to="/">Accueil</Link>
    {user ? (
    <>
        <Link to="/dashboard">Dashboard</Link>
        <button onClick={handleLogout}>Déconnexion</button>
    </>
    ) : (
    <>
        <Link to="/login">Connexion</Link>
        <Link to="/register">Inscription</Link>
    </>
    )}
</nav>
);
}