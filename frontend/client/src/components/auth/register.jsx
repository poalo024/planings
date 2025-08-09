// src/components/auth/register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../services/api';

export default function Register() {
const [formData, setFormData] = useState({
username: '',
email: '',
password: ''
});
const [error, setError] = useState('');
const navigate = useNavigate();

const handleChange = (e) => {
setFormData({
    ...formData,
    [e.target.name]: e.target.value
});
};

const handleSubmit = async (e) => {
e.preventDefault();
try {
    await auth.register(formData);
    navigate('/login');
} catch (err) {
    setError(err.message);
}
};

return (
<div>
    <h2>Inscription</h2>
    {error && <p style={{color: 'red'}}>{error}</p>}
    <form onSubmit={handleSubmit}>
    <div>
        <label>Nom d'utilisateur:</label>
        <input
        type="text"
        name="username"
        value={formData.username}
        onChange={handleChange}
        required
        />
    </div>
    <div>
        <label>Email:</label>
        <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
        />
    </div>
    <div>
        <label>Mot de passe:</label>
        <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
        />
    </div>
    <button type="submit">S'inscrire</button>
    </form>
</div>
);
}