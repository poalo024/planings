// src/components/auth/login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../services/api';

export default function Login() {
const [formData, setFormData] = useState({
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
    await auth.login(formData);
    navigate('/dashboard');
} catch (err) {
    setError(err.message);
}
};

return (
<div>
    <h2>Connexion</h2>
    {error && <p style={{color: 'red'}}>{error}</p>}
    <form onSubmit={handleSubmit}>
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
    <button type="submit">Se connecter</button>
    </form>
</div>
);
}