import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Connexion() {
const [formData, setFormData] = useState({ email: '', password: '' });
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
const navigate = useNavigate();

const handleChange = (e) => {
setFormData({
    ...formData,
    [e.target.name]: e.target.value
});
};

const handleSubmit = async (e) => {
e.preventDefault();
setError('');
setLoading(true);

try {
    const response = await fetch('http://localhost:5000/api/users/login', {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok) {
    throw new Error(data.message || 'Login failed');
    }

    // Store token and user data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    navigate('/dashboard');

} catch (err) {
    setError(err.message || 'Login failed. Please try again.');
} finally {
    setLoading(false);
}
};

return (
<div style={styles.container}>
    <div style={styles.formContainer}>
    <h2 style={styles.title}>Connexion</h2>
    {error && <p style={styles.error}>{error}</p>}
    <form onSubmit={handleSubmit}>
        <div style={styles.inputGroup}>
        <label htmlFor="email">Email :</label>
        <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
        />
        </div>
        <div style={styles.inputGroup}>
        <label htmlFor="password">Mot de passe :</label>
        <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
        />
        </div>
        <button
        type="submit"
        disabled={loading}
        style={loading ? styles.buttonLoading : styles.button}
        >
        {loading ? 'Connexion...' : 'Se connecter'}
        </button>
    </form>
    </div>
</div>
);
}

const styles = {
container: {
minHeight: '100vh',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
background: '#f5f6fa'
},
formContainer: {
background: '#fff',
padding: '2rem 2.5rem',
borderRadius: '8px',
boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
minWidth: '320px',
width: '100%',
maxWidth: '400px'
},
title: {
textAlign: 'center',
marginBottom: '1.5rem',
color: '#333'
},
error: {
color: 'red',
textAlign: 'center',
marginBottom: '1rem'
},
inputGroup: {
marginBottom: '1rem'
},
input: {
width: '100%',
padding: '0.75rem',
borderRadius: '4px',
border: '1px solid #ddd',
marginTop: '0.25rem',
fontSize: '1rem'
},
button: {
width: '100%',
padding: '0.75rem',
borderRadius: '4px',
border: 'none',
background: '#1976d2',
color: '#fff',
fontWeight: 'bold',
fontSize: '1rem',
cursor: 'pointer',
transition: 'background 0.3s'
},
buttonLoading: {
width: '100%',
padding: '0.75rem',
borderRadius: '4px',
border: 'none',
background: '#90caf9',
color: '#fff',
fontWeight: 'bold',
fontSize: '1rem',
cursor: 'not-allowed'
}
};