import { jwtDecode } from 'jwt-decode';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../services/api';

export default function Navbar() {
    const [user, setUser] = useState(() => {
        // Récupération directe au premier rendu
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const handleLogout = () => {
        auth.logout();
        setUser(null);
        window.location.reload();
    };

    // Déconnexion automatique après 1h ou quand le token expire
    useEffect(() => {
        if (!user) return;

        const token = user.token;
        if (!token) return;

        let decoded;
        try {
            decoded = jwtDecode(token);
        } catch (err) {
            console.error('Token invalide', err);
            handleLogout();
            return;
        }

        const currentTime = Date.now() / 1000;
        let remainingTime;

        // Si le token a un "exp", on l'utilise, sinon on force 1h
        if (decoded.exp) {
            remainingTime = decoded.exp - currentTime;
        } else {
            remainingTime = 3600; // 1 heure en secondes
        }

        if (remainingTime <= 0) {
            handleLogout();
            return;
        }

        const timer = setTimeout(() => {
            handleLogout();
        }, remainingTime * 1000);

        return () => clearTimeout(timer);
    }, [user]);

    // Fermer le menu si clic à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav style={styles.nav}>
            <div style={styles.brand}>
                <Link to="/" style={styles.brandLink}>Planings</Link>
            </div>
            <div style={styles.links}>
                {user ? (
                    // Connecté → Menu utilisateur
                    <div style={styles.userMenu} ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            style={styles.userButton}
                        >
                            {user.username} ⬇
                        </button>
                        {menuOpen && (
                            <div style={styles.dropdown}>
                                <Link to="/profile" style={styles.dropdownItem}>Profil</Link>
                                <Link to="/settings" style={styles.dropdownItem}>Paramètres</Link>
                                <button style={styles.dropdownItem} onClick={handleLogout}>
                                    Déconnexion
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    // Pas connecté → Connexion / Inscription
                    <>
                        <Link to="/login" style={navLinkStyle}>Connexion</Link>
                        <Link to="/register" style={navLinkStyle}>Inscription</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

const styles = {
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        background: '#2fa352ff',
        color: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    },
    brand: { fontWeight: 'bold', fontSize: '1.3rem' },
    brandLink: { color: '#fff', textDecoration: 'none' },
    links: { display: 'flex', gap: '1.5rem', alignItems: 'center' },
    userMenu: { position: 'relative' },
    userButton: {
        background: '#fff',
        color: '#1976d2',
        border: 'none',
        borderRadius: '4px',
        padding: '0.5rem 1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background 0.2s'
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        right: 0,
        background: '#fff',
        color: '#1976d2',
        borderRadius: '4px',
        marginTop: '0.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        minWidth: '150px',
        zIndex: 1000
    },
    dropdownItem: {
        padding: '0.5rem 1rem',
        background: 'none',
        border: 'none',
        textAlign: 'left',
        color: '#1976d2',
        cursor: 'pointer',
        textDecoration: 'none'
    }
};

const navLinkStyle = {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '1rem',
    transition: 'color 0.2s',
};
