import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const EmployeeManagement = () => {
const [employees, setEmployees] = useState([]);
const [loading, setLoading] = useState(false);
const [showForm, setShowForm] = useState(false);
const [editingEmployee, setEditingEmployee] = useState(null);
const [searchTerm, setSearchTerm] = useState('');
const [filterRole, setFilterRole] = useState('all');

const [formData, setFormData] = useState({
nom: '',
prenom: '',
username: '', // CHAMP AJOUTÉ
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
}, []);

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

    const data = await response.json();
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
setFormData(prev => ({
    ...prev,
    [name]: value
}));
};

const resetForm = () => {
setFormData({
    nom: '',
    prenom: '',
    username: '', // CHAMP AJOUTÉ
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
    username: employee.username || '', // CHAMP AJOUTÉ
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

// Validation
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
    : 'http://localhost:5000/api/users/register';
    
    const method = editingEmployee ? 'PUT' : 'POST';
    
    const dataToSend = { ...formData };
    if (editingEmployee && !formData.password) {
    delete dataToSend.password;
    }

    console.log('Envoi à:', url, 'Méthode:', method, 'Données:', dataToSend);

    const response = await fetch(url, {
    method,
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(dataToSend)
    });

    const responseData = await response.json();
    
    if (!response.ok) {
    throw new Error(responseData.message || `Erreur ${response.status}`);
    }

    toast.success(editingEmployee ? 'Employé modifié avec succès!' : 'Employé créé avec succès!');
    resetForm();
    fetchEmployees();
    
} catch (error) {
    console.error('Erreur détaillée:', error);
    toast.error(error.message || 'Erreur de connexion');
} finally {
    setLoading(false);
}
};

const handleDelete = async (employeeId, employeeName) => {
if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${employeeName} ?`)) {
    return;
}

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

    if (!response.ok) {
    throw new Error(responseData.message || `Erreur ${response.status}`);
    }

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

    if (!response.ok) {
    throw new Error(responseData.message || `Erreur ${response.status}`);
    }

    toast.success(`Statut changé vers ${newStatus}`);
    fetchEmployees();
} catch (error) {
    console.error('Erreur détaillée:', error);
    toast.error(error.message || 'Erreur lors du changement de statut');
}
};

// Filtrage des employés
const filteredEmployees = employees.filter(emp => {
const matchesSearch = (emp.nom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                        (emp.prenom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                        (emp.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                        (emp.username?.toLowerCase() || '').includes(searchTerm.toLowerCase());
const matchesRole = filterRole === 'all' || emp.role === filterRole;
return matchesSearch && matchesRole;
});

const getRoleText = (role) => {
const roles = {
    admin: 'Administrateur',
    manager: 'Manager',
    user: 'Employé'
};
return roles[role] || role;
};

const getStatusColor = (status) => {
return status === 'actif' ? '#4CAF50' : '#f44336';
};

return (
<div style={styles.container}>
    <div style={styles.header}>
    <h2>Gestion des Employés</h2>
    <button 
        onClick={() => setShowForm(true)}
        style={styles.addButton}
        disabled={showForm}
    >
        + Nouvel Employé
    </button>
    </div>

    {/* Filtres et recherche */}
    <div style={styles.filtersContainer}>
    <input
        type="text"
        placeholder="Rechercher un employé..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.searchInput}
    />
    <select
        value={filterRole}
        onChange={(e) => setFilterRole(e.target.value)}
        style={styles.roleFilter}
    >
        <option value="all">Tous les rôles</option>
        <option value="admin">Administrateurs</option>
        <option value="manager">Managers</option>
        <option value="user">Employés</option>
    </select>
    </div>

    {/* Formulaire d'ajout/modification */}
    {showForm && (
    <div style={styles.formContainer}>
        <div style={styles.formHeader}>
        <h3>{editingEmployee ? 'Modifier l\'employé' : 'Nouvel employé'}</h3>
        <button onClick={resetForm} style={styles.closeButton}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGrid}>
            {/* CHAMP USERNAME AJOUTÉ */}
            <div style={styles.inputGroup}>
            <label style={styles.label}>Nom d'utilisateur *</label>
            <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                style={styles.input}
                placeholder="ex: john.doe"
            />
            </div>

            <div style={styles.inputGroup}>
            <label style={styles.label}>Nom *</label>
            <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                required
                style={styles.input}
            />
            </div>

            <div style={styles.inputGroup}>
            <label style={styles.label}>Prénom *</label>
            <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleInputChange}
                required
                style={styles.input}
            />
            </div>

            <div style={styles.inputGroup}>
            <label style={styles.label}>Email *</label>
            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={styles.input}
            />
            </div>

            <div style={styles.inputGroup}>
            <label style={styles.label}>
                {editingEmployee ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe *'}
            </label>
            <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required={!editingEmployee}
                style={styles.input}
                placeholder={editingEmployee ? 'Laisser vide pour conserver' : ''}
            />
            </div>

            <div style={styles.inputGroup}>
            <label style={styles.label}>Rôle *</label>
            <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                style={styles.select}
            >
                <option value="user">Employé</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrateur</option>
            </select>
            </div>

            <div style={styles.inputGroup}>
            <label style={styles.label}>Poste</label>
            <input
                type="text"
                name="poste"
                value={formData.poste}
                onChange={handleInputChange}
                style={styles.input}
            />
            </div>

            <div style={styles.inputGroup}>
            <label style={styles.label}>Téléphone</label>
            <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                style={styles.input}
            />
            </div>

            <div style={styles.inputGroup}>
            <label style={styles.label}>Date d'embauche</label>
            <input
                type="date"
                name="dateEmbauche"
                value={formData.dateEmbauche}
                onChange={handleInputChange}
                style={styles.input}
            />
            </div>

            <div style={styles.inputGroup}>
            <label style={styles.label}>Salaire</label>
            <input
                type="number"
                name="salaire"
                value={formData.salaire}
                onChange={handleInputChange}
                style={styles.input}
                min="0"
                step="0.01"
            />
            </div>

            <div style={styles.inputGroup}>
            <label style={styles.label}>Département</label>
            <input
                type="text"
                name="departement"
                value={formData.departement}
                onChange={handleInputChange}
                style={styles.input}
            />
            </div>

            <div style={styles.inputGroup}>
            <label style={styles.label}>Statut</label>
            <select
                name="statut"
                value={formData.statut}
                onChange={handleInputChange}
                style={styles.select}
            >
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
            </select>
            </div>

            <div style={styles.inputGroupFull}>
            <label style={styles.label}>Adresse</label>
            <textarea
                name="adresse"
                value={formData.adresse}
                onChange={handleInputChange}
                rows="2"
                style={styles.textarea}
            />
            </div>
        </div>

        <div style={styles.formActions}>
            <button type="button" onClick={resetForm} style={styles.cancelButton}>
            Annuler
            </button>
            <button 
            type="submit" 
            disabled={loading}
            style={loading ? styles.submitButtonDisabled : styles.submitButton}
            >
            {loading ? 'Sauvegarde...' : (editingEmployee ? 'Modifier' : 'Créer')}
            </button>
        </div>
        </form>
    </div>
    )}

    {/* Liste des employés */}
    <div style={styles.employeesContainer}>
    {loading && !showForm ? (
        <div style={styles.loading}>Chargement...</div>
    ) : (
        <>
        <div style={styles.employeesHeader}>
            <h3>Liste des employés ({filteredEmployees.length})</h3>
        </div>
        
        {filteredEmployees.length === 0 ? (
            <div style={styles.noEmployees}>
            <p>Aucun employé trouvé</p>
            </div>
        ) : (
            <div style={styles.employeesGrid}>
            {filteredEmployees.map(employee => (
                <div key={employee._id} style={styles.employeeCard}>
                <div style={styles.employeeHeader}>
                    <div style={styles.employeeInfo}>
                    <h4>{employee.prenom} {employee.nom}</h4>
                    <p style={styles.employeeEmail}>{employee.email}</p>
                    <p style={styles.employeeUsername}>@{employee.username}</p>
                    </div>
                    <div style={styles.statusContainer}>
                    <span style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(employee.statut)
                    }}>
                        {employee.statut || 'actif'}
                    </span>
                    <span style={styles.roleBadge}>
                        {getRoleText(employee.role)}
                    </span>
                    </div>
                </div>

                <div style={styles.employeeDetails}>
                    {employee.poste && (
                    <p><strong>Poste:</strong> {employee.poste}</p>
                    )}
                    {employee.departement && (
                    <p><strong>Département:</strong> {employee.departement}</p>
                    )}
                    {employee.telephone && (
                    <p><strong>Téléphone:</strong> {employee.telephone}</p>
                    )}
                    {employee.dateEmbauche && (
                    <p><strong>Embauché le:</strong> {new Date(employee.dateEmbauche).toLocaleDateString('fr-FR')}</p>
                    )}
                </div>

                <div style={styles.employeeActions}>
                    <button 
                    onClick={() => handleEdit(employee)}
                    style={styles.editButton}
                    disabled={showForm}
                    >
                    Modifier
                    </button>
                    <button 
                    onClick={() => toggleStatus(employee._id, employee.statut)}
                    style={employee.statut === 'actif' ? styles.deactivateButton : styles.activateButton}
                    >
                    {employee.statut === 'actif' ? 'Désactiver' : 'Activer'}
                    </button>
                    <button 
                    onClick={() => handleDelete(employee._id, `${employee.prenom} ${employee.nom}`)}
                    style={styles.deleteButton}
                    >
                    Supprimer
                    </button>
                </div>
                </div>
            ))}
            </div>
        )}
        </>
    )}
    </div>
</div>
);
};

const styles = {
container: {
padding: '2rem',
maxWidth: '1400px',
margin: '0 auto',
},
header: {
display: 'flex',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: '2rem',
},
addButton: {
backgroundColor: '#4CAF50',
color: 'white',
border: 'none',
padding: '0.75rem 1.5rem',
borderRadius: '6px',
cursor: 'pointer',
fontSize: '1rem',
fontWeight: '500',
},
filtersContainer: {
display: 'flex',
gap: '1rem',
marginBottom: '2rem',
flexWrap: 'wrap',
},
searchInput: {
flex: 1,
minWidth: '250px',
padding: '0.75rem',
border: '1px solid #ddd',
borderRadius: '6px',
fontSize: '1rem',
},
roleFilter: {
padding: '0.75rem',
border: '1px solid #ddd',
borderRadius: '6px',
fontSize: '1rem',
backgroundColor: 'white',
minWidth: '150px',
},
formContainer: {
backgroundColor: '#fff',
border: '1px solid #ddd',
borderRadius: '8px',
padding: '0',
marginBottom: '2rem',
boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
},
formHeader: {
display: 'flex',
justifyContent: 'space-between',
alignItems: 'center',
padding: '1.5rem',
borderBottom: '1px solid #eee',
backgroundColor: '#f8f9fa',
borderRadius: '8px 8px 0 0',
},
closeButton: {
background: 'none',
border: 'none',
fontSize: '1.5rem',
cursor: 'pointer',
padding: '0.25rem',
},
form: {
padding: '1.5rem',
},
formGrid: {
display: 'grid',
gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
gap: '1rem',
marginBottom: '1.5rem',
},
inputGroup: {
display: 'flex',
flexDirection: 'column',
},
inputGroupFull: {
display: 'flex',
flexDirection: 'column',
gridColumn: '1 / -1',
},
label: {
marginBottom: '0.5rem',
fontWeight: '500',
color: '#333',
},
input: {
padding: '0.75rem',
border: '1px solid #ddd',
borderRadius: '4px',
fontSize: '1rem',
},
select: {
padding: '0.75rem',
border: '1px solid #ddd',
borderRadius: '4px',
fontSize: '1rem',
backgroundColor: 'white',
},
textarea: {
padding: '0.75rem',
border: '1px solid #ddd',
borderRadius: '4px',
fontSize: '1rem',
resize: 'vertical',
},
formActions: {
display: 'flex',
gap: '1rem',
justifyContent: 'flex-end',
},
cancelButton: {
padding: '0.75rem 1.5rem',
border: '1px solid #ddd',
backgroundColor: 'white',
borderRadius: '4px',
cursor: 'pointer',
fontSize: '1rem',
},
submitButton: {
padding: '0.75rem 1.5rem',
backgroundColor: '#1976d2',
color: 'white',
border: 'none',
borderRadius: '4px',
cursor: 'pointer',
fontSize: '1rem',
fontWeight: '500',
},
submitButtonDisabled: {
padding: '0.75rem 1.5rem',
backgroundColor: '#ccc',
color: 'white',
border: 'none',
borderRadius: '4px',
cursor: 'not-allowed',
fontSize: '1rem',
},
employeesContainer: {
backgroundColor: '#fff',
borderRadius: '8px',
boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
},
employeesHeader: {
padding: '1.5rem',
borderBottom: '1px solid #eee',
backgroundColor: '#f8f9fa',
borderRadius: '8px 8px 0 0',
},
loading: {
textAlign: 'center',
padding: '3rem',
fontSize: '1.1rem',
color: '#666',
},
noEmployees: {
textAlign: 'center',
padding: '3rem',
},
employeesGrid: {
padding: '1.5rem',
display: 'grid',
gap: '1.5rem',
gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
},
employeeCard: {
border: '1px solid #eee',
borderRadius: '8px',
padding: '1.5rem',
backgroundColor: '#fafafa',
},
employeeHeader: {
display: 'flex',
justifyContent: 'space-between',
alignItems: 'flex-start',
marginBottom: '1rem',
},
employeeInfo: {
flex: 1,
},
employeeEmail: {
color: '#666',
fontSize: '0.9rem',
margin: '0.25rem 0',
},
employeeUsername: {
color: '#888',
fontSize: '0.8rem',
margin: '0.25rem 0',
fontStyle: 'italic',
},
statusContainer: {
display: 'flex',
flexDirection: 'column',
gap: '0.5rem',
alignItems: 'flex-end',
},
statusBadge: {
padding: '0.25rem 0.75rem',
borderRadius: '12px',
color: 'white',
fontSize: '0.75rem',
fontWeight: '500',
},
roleBadge: {
padding: '0.25rem 0.75rem',
borderRadius: '12px',
backgroundColor: '#1976d2',
color: 'white',
fontSize: '0.75rem',
fontWeight: '500',
},
employeeDetails: {
marginBottom: '1rem',
lineHeight: 1.4,
},
employeeActions: {
display: 'flex',
gap: '0.5rem',
flexWrap: 'wrap',
},
editButton: {
padding: '0.5rem 1rem',
backgroundColor: '#1976d2',
color: 'white',
border: 'none',
borderRadius: '4px',
cursor: 'pointer',
fontSize: '0.9rem',
},
activateButton: {
padding: '0.5rem 1rem',
backgroundColor: '#4CAF50',
color: 'white',
border: 'none',
borderRadius: '4px',
cursor: 'pointer',
fontSize: '0.9rem',
},
deactivateButton: {
padding: '0.5rem 1rem',
backgroundColor: '#FF9800',
color: 'white',
border: 'none',
borderRadius: '4px',
cursor: 'pointer',
fontSize: '0.9rem',
},
deleteButton: {
padding: '0.5rem 1rem',
backgroundColor: '#f44336',
color: 'white',
border: 'none',
borderRadius: '4px',
cursor: 'pointer',
fontSize: '0.9rem',
},
};

export default EmployeeManagement;