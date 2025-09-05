import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const EmployeeManagement = ({ user }) => {
const [employees, setEmployees] = useState([]);
const [loading, setLoading] = useState(false);
const [showForm, setShowForm] = useState(false);
const [editingEmployee, setEditingEmployee] = useState(null);
const [searchTerm, setSearchTerm] = useState('');
const [filterRole, setFilterRole] = useState('all');

const [formData, setFormData] = useState({
nom: '',
prenom: '',
username: '',
email: '',
password: '',
role: 'user',
poste: '',
telephone: '',
dateEmbauche: '',
salaire: '',
departement: '',
adresse: '',
statut: 'actif'
});

useEffect(() => {
fetchEmployees();
}, [user]);

const fetchEmployees = async () => {
setLoading(true);
try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/users', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
    });

    if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Erreur ${response.status}`);
    }

    let data = await response.json();

    // Filtrage selon rôle
    if (user.role.toLowerCase() === 'manager') {
    data = data.filter(emp => emp.entreprise === user.entreprise && emp.role === 'user');
    } else if (user.role.toLowerCase() === 'admin' && user.entreprise === 'system') {
    data = data.filter(emp => emp.role === 'manager');
    }

    setEmployees(data);
} catch (error) {
    console.error('Erreur détaillée:', error);
    toast.error(error.message || 'Erreur lors du chargement des employés');
} finally {
    setLoading(false);
}
};

const handleInputChange = (e) => {
const { name, value } = e.target;
setFormData(prev => ({ ...prev, [name]: value }));
};

const resetForm = () => {
setFormData({
    nom: '',
    prenom: '',
    username: '',
    email: '',
    password: '',
    role: 'user',
    poste: '',
    telephone: '',
    dateEmbauche: '',
    salaire: '',
    departement: '',
    adresse: '',
    statut: 'actif'
});
setEditingEmployee(null);
setShowForm(false);
};

const handleEdit = (employee) => {
setEditingEmployee(employee);
setFormData({
    nom: employee.nom || '',
    prenom: employee.prenom || '',
    username: employee.username || '',
    email: employee.email || '',
    password: '',
    role: employee.role || 'user',
    poste: employee.poste || '',
    telephone: employee.telephone || '',
    dateEmbauche: employee.dateEmbauche ? employee.dateEmbauche.split('T')[0] : '',
    salaire: employee.salaire || '',
    departement: employee.departement || '',
    adresse: employee.adresse || '',
    statut: employee.statut || 'actif'
});
setShowForm(true);
};

const handleSubmit = async (e) => {
e.preventDefault();
setLoading(true);

if (!formData.nom || !formData.prenom || !formData.username || !formData.email) {
    toast.error('Les champs nom, prénom, username et email sont obligatoires');
    setLoading(false);
    return;
}

if (!editingEmployee && !formData.password) {
    toast.error('Le mot de passe est obligatoire pour un nouvel employé');
    setLoading(false);
    return;
}

if (formData.password && formData.password.length < 6) {
    toast.error('Le mot de passe doit contenir au moins 6 caractères');
    setLoading(false);
    return;
}

const token = localStorage.getItem('token');
if (!token) {
    toast.error('Session expirée, veuillez vous reconnecter');
    setLoading(false);
    return;
}

try {
    const url = editingEmployee 
    ? `http://localhost:5000/api/users/${editingEmployee._id}`
    : 'http://localhost:5000/api/users/invite';
    const method = editingEmployee ? 'PUT' : 'POST';
    const dataToSend = { ...formData };
    if (editingEmployee && !formData.password) delete dataToSend.password;

    const response = await fetch(url, {
    method,
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(dataToSend)
    });

    const responseData = await response.json();
    if (!response.ok) throw new Error(responseData.message || `Erreur ${response.status}`);

    toast.success(editingEmployee ? 'Employé modifié avec succès!' : 'Employé créé avec succès!');
    resetForm();
    fetchEmployees();

} catch (error) {
    console.error('Erreur détaillée:', error);
    toast.error(error.message || 'Erreur lors de la sauvegarde');
} finally {
    setLoading(false);
}
};

const handleDelete = async (employeeId, employeeName) => {
if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${employeeName} ?`)) return;

try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/users/${employeeId}`, {
    method: 'DELETE',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
    });

    const responseData = await response.json();
    if (!response.ok) throw new Error(responseData.message || `Erreur ${response.status}`);

    toast.success('Employé supprimé avec succès');
    fetchEmployees();
} catch (error) {
    console.error('Erreur détaillée:', error);
    toast.error(error.message || 'Erreur lors de la suppression');
}
};

const toggleStatus = async (employeeId, currentStatus) => {
const newStatus = currentStatus === 'actif' ? 'inactif' : 'actif';

try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/users/${employeeId}/status`, {
    method: 'PATCH',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ statut: newStatus })
    });

    const responseData = await response.json();
    if (!response.ok) throw new Error(responseData.message || `Erreur ${response.status}`);

    toast.success(`Statut changé vers ${newStatus}`);
    fetchEmployees();
} catch (error) {
    console.error('Erreur détaillée:', error);
    toast.error(error.message || 'Erreur lors du changement de statut');
}
};

// Filtrage
const filteredEmployees = employees.filter(emp => {
const matchesSearch = (emp.nom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                        (emp.prenom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                        (emp.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                        (emp.username?.toLowerCase() || '').includes(searchTerm.toLowerCase());
const matchesRole = filterRole === 'all' || emp.role === filterRole;
return matchesSearch && matchesRole;
});

const getRoleText = (role) => ({
admin: 'Administrateur',
manager: 'Manager',
user: 'Employé'
}[role] || role);

const getStatusColor = (status) => status === 'actif' ? '#4CAF50' : '#f44336';

return (
<div style={styles.container}>
    <div style={styles.header}>
    <h2>Gestion des Employés</h2>
    <button onClick={() => setShowForm(true)} style={styles.addButton} disabled={showForm}>
        + Nouvel Employé
    </button>
    </div>

    <div style={styles.filtersContainer}>
    <input
        type="text"
        placeholder="Rechercher un employé..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.searchInput}
    />
    <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} style={styles.roleFilter}>
        <option value="all">Tous les rôles</option>
        <option value="admin">Administrateurs</option>
        <option value="manager">Managers</option>
        <option value="user">Employés</option>
    </select>
    </div>

    {/* Formulaire (identique au code précédent) */}

    <div style={styles.employeesContainer}>
    {loading && !showForm ? (
        <div style={styles.loading}>Chargement...</div>
    ) : (
        <div style={styles.employeesGrid}>
        {filteredEmployees.map(emp => (
            <div key={emp._id} style={styles.employeeCard}>
            <div style={styles.employeeHeader}>
                <div>
                <h4>{emp.prenom} {emp.nom}</h4>
                <p>@{emp.username}</p>
                <p>{emp.email}</p>
                </div>
                <div style={styles.statusContainer}>
                <span style={{ ...styles.statusBadge, backgroundColor: getStatusColor(emp.statut) }}>
                    {emp.statut}
                </span>
                <span style={styles.roleBadge}>{getRoleText(emp.role)}</span>
                </div>
            </div>
            <div style={styles.employeeActions}>
                <button onClick={() => handleEdit(emp)} style={styles.editButton} disabled={showForm}>Modifier</button>
                <button onClick={() => toggleStatus(emp._id, emp.statut)} style={emp.statut === 'actif' ? styles.deactivateButton : styles.activateButton}>
                {emp.statut === 'actif' ? 'Désactiver' : 'Activer'}
                </button>
                <button onClick={() => handleDelete(emp._id, `${emp.prenom} ${emp.nom}`)} style={styles.deleteButton}>Supprimer</button>
            </div>
            </div>
        ))}
        </div>
    )}
    </div>
</div>
);
};

const styles = {
container: { padding: '2rem', maxWidth: '1400px', margin: '0 auto' },
header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
addButton: { backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500' },
filtersContainer: { display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' },
searchInput: { flex: 1, minWidth: '250px', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' },
roleFilter: { padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem', backgroundColor: 'white', minWidth: '150px' },
employeesContainer: { backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
loading: { textAlign: 'center', padding: '3rem', fontSize: '1.1rem', color: '#666' },
employeesGrid: { padding: '1.5rem', display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' },
employeeCard: { border: '1px solid #eee', borderRadius: '8px', padding: '1.5rem', backgroundColor: '#fafafa' },
employeeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
statusContainer: { display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' },
statusBadge: { padding: '0.25rem 0.75rem', borderRadius: '12px', color: 'white', fontSize: '0.75rem', fontWeight: '500' },
roleBadge: { padding: '0.25rem 0.75rem', borderRadius: '12px', backgroundColor: '#1976d2', color: 'white', fontSize: '0.75rem', fontWeight: '500' },
employeeActions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
editButton: { padding: '0.5rem 1rem', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' },
activateButton: { padding: '0.5rem 1rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' },
deactivateButton: { padding: '0.5rem 1rem', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' },
deleteButton: { padding: '0.5rem 1rem', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' },
};

// Compare this snippet from frontend/client/src/components/employee/EmployeeDashboardContent.jsx:
const fetchEmployees = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setEmployees(data.users || []);
    } catch (err) {
        console.error(err);
    }
};
export default EmployeeManagement;