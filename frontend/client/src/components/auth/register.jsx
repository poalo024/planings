import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
const [formData, setFormData] = useState({
nom: '',
prenom: '',
username: '',
email: '',
password: '',
confirmPassword: '',
});
const [error, setError] = useState('');
const [success, setSuccess] = useState('');
const [loading, setLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);

const navigate = useNavigate();

const handleChange = (e) => {
setFormData(prev => ({
    ...prev,
    [e.target.name]: e.target.value,
}));
setError('');
setSuccess('');
};

const togglePasswordVisibility = () => {
setShowPassword(!showPassword);
};

const handleSubmit = async (e) => {
e.preventDefault();
setError('');
setSuccess('');
setLoading(true);

// Log des données avant envoi
console.log('Données à envoyer:', formData);

// Validation simple côté frontend
if (formData.password !== formData.confirmPassword) {
    setError('Les mots de passe ne correspondent pas.');
    setLoading(false);
    return;
}

const { nom, prenom, username, email, password } = formData;
if (!nom.trim() || !prenom.trim() || !username.trim() || !email.trim() || !password.trim()) {
    setError('Tous les champs sont obligatoires.');
    setLoading(false);
    return;
}

try {
    const response = await fetch('http://localhost:5000/api/users/register', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    body: JSON.stringify({
        nom: nom.trim(),
        prenom: prenom.trim(),
        username: username.trim(),
        email: email.trim(),
        password: password.trim(),
    }),
    });

    const data = await response.json();

    if (!response.ok) {
    throw new Error(data.message || 'Erreur lors de l\'inscription');
    }

    setSuccess('Inscription réussie ! Redirection vers la connexion...');
    setTimeout(() => {
    navigate('/login');
    }, 2000);
} catch (err) {
    console.error('Erreur lors de l\'inscription:', err);
    setError(err.message);
} finally {
    setLoading(false);
}
};

return (
<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6fa', padding: '1rem' }}>
    <div style={{ background: '#fff', padding: '2rem 2.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', minWidth: '350px' }}>
    <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Inscription</h2>
    {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
    {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}
    <form onSubmit={handleSubmit}>
        {['nom', 'prenom', 'username', 'email'].map(field => (
        <div key={field} style={{ marginBottom: '1rem' }}>
            <label htmlFor={field} style={{ textTransform: 'capitalize' }}>
            {field === 'username' ? 'Nom d\'utilisateur' : field} :
            </label>
            <input
            id={field}
            name={field}
            type={field === 'email' ? 'email' : 'text'}
            value={formData[field]}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', marginTop: '0.25rem' }}
            />
        </div>
        ))}
        {['password', 'confirmPassword'].map(field => (
        <div key={field} style={{ marginBottom: '1rem', position: 'relative' }}>
            <label htmlFor={field} style={{ textTransform: 'capitalize' }}>
            {field === 'confirmPassword' ? 'Confirmer le mot de passe' : field} :
            </label>
            <input
            id={field}
            name={field}
            type={showPassword ? 'text' : 'password'}
            value={formData[field]}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', marginTop: '0.25rem' }}
            />
            <span
            onClick={togglePasswordVisibility}
            style={{ position: 'absolute', right: '10px', top: '35px', cursor: 'pointer' }}
            >
            {showPassword ? '👁️' : '👁️‍🗨️'}
            </span>
        </div>
        ))}
        <button
        type="submit"
        disabled={loading}
        style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '4px',
            border: 'none',
            background: loading ? '#999' : '#1976d2',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
        }}
        >
        {loading ? "Inscription..." : "S'inscrire"}
        </button>
    </form>
    </div>
</div>
);
}