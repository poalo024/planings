import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register({ currentUser }) {
const [formData, setFormData] = useState({ 
nom:'', 
prenom:'', 
username:'', 
email:'', 
password:'', 
confirmPassword:'', 
role:'user' 
});
const [error, setError] = useState('');
const [success, setSuccess] = useState('');
const [loading, setLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const navigate = useNavigate();

const handleChange = (e) => {
setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
setError(''); 
setSuccess('');
};

const handleSubmit = async (e) => {
e.preventDefault();
setError(''); 
setSuccess('');
setLoading(true);

if (formData.password !== formData.confirmPassword) {
    setError('Les mots de passe ne correspondent pas'); 
    setLoading(false); 
    return;
}

const { nom, prenom, username, email, password, role } = formData;
if (!nom || !prenom || !username || !email || !password) { 
    setError('Tous les champs sont obligatoires'); 
    setLoading(false); 
    return; 
}

try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/users/register', {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({ nom, prenom, username, email, password, role }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
    throw new Error(data.message || `Erreur ${response.status} lors de l'inscription`);
    }
    
    setSuccess('Inscription réussie !'); 
    setTimeout(() => navigate('/login'), 2000);
} catch (err) { 
    setError(err.message); 
}
finally { 
    setLoading(false); 
}
};

return (
<div style={{ minHeight:'100vh', display:'flex', justifyContent:'center', alignItems:'center', background:'#f5f6fa' }}>
    <form onSubmit={handleSubmit} style={{ background:'#fff', padding:'2rem', borderRadius:'8px', width:'350px' }}>
    <h2>Inscription</h2>
    {error && <p style={{ color:'red' }}>{error}</p>}
    {success && <p style={{ color:'green' }}>{success}</p>}

    {['nom','prenom','username','email'].map(f => (
        <div key={f} style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            {f==='username'?'Nom utilisateur':f} :
        </label>
        <input 
            type={f==='email'?'email':'text'} 
            name={f} 
            value={formData[f]} 
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        </div>
    ))}

    {['password','confirmPassword'].map(f => (
        <div key={f} style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            {f==='confirmPassword'?'Confirmer le mot de passe':'Mot de passe'} :
        </label>
        <input 
            type={showPassword?'text':'password'} 
            name={f} 
            value={formData[f]} 
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        </div>
    ))}

    {currentUser?.role?.toLowerCase() === 'manager' && (
        <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Rôle :</label>
        <select 
            name="role" 
            value={formData.role} 
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
        >
            <option value="user">Utilisateur</option>
            <option value="manager">Manager</option>
        </select>
        </div>
    )}

    <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input 
            type="checkbox" 
            checked={showPassword} 
            onChange={() => setShowPassword(!showPassword)} 
        /> 
        Afficher le mot de passe
        </label>
    </div>

    <button 
        type="submit" 
        disabled={loading}
        style={{ 
        width: '100%', 
        padding: '0.75rem', 
        background: loading ? '#ccc' : '#007bff', 
        color: 'white', 
        border: 'none', 
        borderRadius: '4px', 
        cursor: loading ? 'not-allowed' : 'pointer' 
        }}
    >
        {loading ? 'Inscription...' : 'S\'inscrire'}
    </button>
    </form>
</div>
);
}