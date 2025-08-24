import { useEffect, useState } from 'react';

export default function EmployeeManagement() {
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        prenom: '',
        nom: '',
        email: '',
        password: '',
        role: 'user'
    });
    const [message, setMessage] = useState('');

    // Charger la liste des employés
    useEffect(() => {
        fetchEmployees();
    }, []);

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok) {
                setMessage(data.message || 'Erreur lors de la création');
                return;
            }
            setEmployees([...employees, data.user]);
            setFormData({ prenom: '', nom: '', email: '', password: '', role: 'user' });
            setMessage('Employé créé avec succès !');
        } catch (err) {
            setMessage('Erreur serveur');
        }
    };

    return (
        <div>
            <h3>Créer un Employé</h3>
            <form onSubmit={handleCreate} style={{ marginBottom: '1rem' }}>
                <input name="prenom" placeholder="Prénom" value={formData.prenom} onChange={handleChange} required />
                <input name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} required />
                <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                <input name="password" type="password" placeholder="Mot de passe" value={formData.password} onChange={handleChange} required />
                <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="user">Utilisateur</option>
                    <option value="manager">Manager</option>
                </select>
                <button type="submit">Créer</button>
            </form>
            {message && <p>{message}</p>}

            <h3>Liste des Employés</h3>
            <ul>
                {employees.map(emp => (
                    <li key={emp._id}>{emp.prenom} {emp.nom} - {emp.role}</li>
                ))}
            </ul>
        </div>
    );
}
