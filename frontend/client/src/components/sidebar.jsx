
    export default function Sidebar({ activeSection, onSectionChange, user }) {
    if (!user) return null;

    // Définition des menus selon le rôle
    const menus = {
        adminSystem: [
        { id: 'overview', label: 'Tableau de bord' },
        { id: 'new-enterprise', label: 'Nouvelle Entreprise' },
        { id: 'all-enterprises', label: 'Toutes les Entreprises' }
        ],
        manager: [
        { id: 'overview', label: 'Tableau de bord' },
        { id: 'employees', label: 'Gestion Employés' },
        { id: 'planning', label: 'Planning Équipe' },
        { id: 'conges', label: 'Validation Congés' },
        { id: 'reports', label: 'Rapports' },
        { id: 'settings', label: 'Paramètres' }
        ],
        user: [
        { id: 'overview', label: 'Tableau de bord' },
        { id: 'planning', label: 'Mon Planning' },
        { id: 'conges', label: 'Mes Congés' },
        { id: 'pointage', label: 'Mon Pointage' },
        { id: 'notifications', label: 'Notifications' }
        ]
    };

    let menuItems = [];
    if (user.role.toLowerCase() === 'admin' && user.entreprise === 'system') {
        menuItems = menus.adminSystem;
    } else if (user.role.toLowerCase() === 'manager') {
        menuItems = menus.manager;
    } else {
        menuItems = menus.user;
    }

    return (
        <div style={styles.sidebar}>
        <div style={styles.header}>
            <h4 style={styles.title}>
            {user.role.toLowerCase() === 'admin' && user.entreprise === 'system'
                ? 'Admin Système'
                : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </h4>
        </div>

        <div style={styles.menu}>
            {menuItems.map(item => (
            <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                style={{
                ...styles.menuButton,
                background: activeSection === item.id ? '#1565c0' : 'transparent',
                fontWeight: activeSection === item.id ? 'bold' : 'normal'
                }}
            >
                {item.label}
            </button>
            ))}
        </div>
        </div>
    );
    }

    const styles = {
    sidebar: {
        width: '220px',
        background: '#1976d2',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
    },
    header: {
        padding: '1.5rem 1rem 1rem 1rem',
        borderBottom: '1px solid rgba(255,255,255,0.2)'
    },
    title: {
        margin: 0,
        fontSize: '1.1rem',
        fontWeight: '600'
    },
    menu: {
        flex: 1,
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem'
    },
    menuButton: {
        padding: '0.75rem 1rem',
        textAlign: 'left',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        borderRadius: '6px',
        transition: 'all 0.2s ease',
        fontSize: '0.95rem',
        width: '100%'
    }
    };
