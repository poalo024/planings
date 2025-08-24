    export default function Sidebar({ activeSection, onSectionChange, isManager }) {
    // Définir les menus selon le rôle
    const userMenuItems = [
    { id: 'overview', label: 'Tableau de bord' },
    { id: 'planning', label: 'Mon Planning' },
    { id: 'conges', label: 'Mes Congés' },
    { id: 'pointage', label: 'Mon Pointage' },
    { id: 'notifications', label: 'Notifications' },
    ];

    const managerMenuItems = [
    { id: 'overview', label: 'Tableau de bord' },
    { id: 'employees', label: 'Gestion Employés' },
    { id: 'planning', label: 'Planning Équipe' },
    { id: 'conges', label: 'Validation Congés' },
    { id: 'reports', label: 'Rapports' },
    { id: 'settings', label: 'Paramètres' },
    ];

    const menuItems = isManager ? managerMenuItems : userMenuItems;

    return (
    <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
        <h4 style={styles.sidebarTitle}>
            {isManager ? 'Admin Panel' : 'Mon Espace'}
        </h4>
        </div>
        
        <div style={styles.menuContainer}>
        {menuItems.map((item) => (
            <MenuButton 
            key={item.id}
            label={item.label} 
            active={activeSection === item.id} 
            onClick={() => onSectionChange(item.id)} 
            />
        ))}
        </div>
        
        <div style={styles.sidebarFooter}>
        <p style={styles.footerText}>
            {isManager ? 'Mode Gestionnaire' : 'Mode Employé'}
        </p>
        </div>
    </div>
    );
    }

    function MenuButton({ label, active, onClick }) {
    return (
    <button
        onClick={onClick}
        style={{
        ...styles.menuButton,
        background: active ? '#1565c0' : 'transparent',
        fontWeight: active ? 'bold' : 'normal',
        }}
        onMouseOver={(e) => {
        if (!active) {
            e.target.style.background = 'rgba(255,255,255,0.1)';
        }
        }}
        onMouseOut={(e) => {
        if (!active) {
            e.target.style.background = 'transparent';
        }
        }}
    >
        {label}
    </button>
    );
    }

    const styles = {
    sidebar: {
    width: '250px',
    background: '#1976d2',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    },
    sidebarHeader: {
    padding: '1.5rem 1rem 1rem 1rem',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    },
    sidebarTitle: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: '600',
    },
    menuContainer: {
    flex: 1,
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    },
    menuButton: {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    fontSize: '0.9rem',
    width: '100%',
    },
    sidebarFooter: {
    padding: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.2)',
    textAlign: 'center',
    },
    footerText: {
    margin: 0,
    fontSize: '0.8rem',
    opacity: 0.8,
    }
    };