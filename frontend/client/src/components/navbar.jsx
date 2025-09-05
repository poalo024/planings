    import { jwtDecode } from "jwt-decode";
import { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../services/api";

    export default function Navbar() {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const handleLogout = () => {
        auth.logout();
        setUser(null);
        navigate("/login");
    };

    useEffect(() => {
        if (!user) return;
        const token = user.token;
        if (!token) return handleLogout();

        let decoded;
        try { decoded = jwtDecode(token); } catch { handleLogout(); return; }

        const remainingTime = decoded.exp ? decoded.exp - Date.now() / 1000 : 3600;
        if (remainingTime <= 0) { handleLogout(); return; }

        const timer = setTimeout(() => handleLogout(), remainingTime * 1000);
        return () => clearTimeout(timer);
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const dashboardLink = () => {
        if (!user) return "/login";
        if (["admin", "manager"].includes(user.role)) return "/admin-dashboard";
        return "/user-dashboard";
    };

    return (
        <nav style={styles.nav}>
        <div style={styles.logo}>
            <Link to={dashboardLink()} style={styles.logoText}>PlaningsPro</Link>
        </div>
        <div style={styles.rightMenu}>
            {user ? (
            <div style={styles.profileMenu} ref={menuRef}>
                <button onClick={() => setMenuOpen(!menuOpen)} style={styles.profileButton}>
                {user.username} <FiChevronDown />
                </button>
                {menuOpen && (
                <div style={styles.dropdown}>
                    <Link to={dashboardLink()} style={styles.dropdownItem}>Tableau de bord</Link>
                    <Link to="/profile" style={styles.dropdownItem}>Profil</Link>
                    <button style={styles.dropdownItem} onClick={handleLogout}>Déconnexion</button>
                </div>
                )}
            </div>
            ) : (
            <div style={styles.authLinks}>
                <Link to="/login" style={styles.authLink}>Connexion</Link>
                <Link to="/register" style={styles.authLink}>Inscription</Link>
            </div>
            )}
        </div>
        </nav>
    );
    }

    const styles = {
    nav: {
        height: "60px",
        background: "#1976d2",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 1.5rem",
        color: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000
    },
    logo: { fontWeight: "bold", fontSize: "1.3rem" },
    logoText: { color: "#fff", textDecoration: "none" },
    rightMenu: { display: "flex", alignItems: "center", gap: "1rem" },
    profileMenu: { position: "relative" },
    profileButton: {
        display: "flex",
        alignItems: "center",
        gap: "0.3rem",
        background: "#fff",
        color: "#1976d2",
        border: "none",
        borderRadius: "6px",
        padding: "0.4rem 0.8rem",
        cursor: "pointer",
        fontWeight: 500
    },
    dropdown: {
        position: "absolute",
        top: "calc(100% + 5px)",
        right: 0,
        background: "#fff",
        color: "#1976d2",
        borderRadius: "6px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        minWidth: "180px",
        overflow: "hidden",
        zIndex: 1000
    },
    dropdownItem: {
        padding: "0.6rem 1rem",
        background: "none",
        border: "none",
        cursor: "pointer",
        textDecoration: "none",
        color: "#1976d2",
        fontWeight: 500,
        textAlign: "left",
        transition: "background 0.2s",
        width: "100%"
    },
    authLinks: { display: "flex", gap: "1rem" },
    authLink: { color: "#fff", textDecoration: "none", fontWeight: 500 }
    };
