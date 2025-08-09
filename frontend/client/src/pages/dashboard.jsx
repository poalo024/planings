// src/pages/dashboard.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';

export default function Dashboard() {
const navigate = useNavigate();
const user = auth.getCurrentUser();

useEffect(() => {
if (!user) {
    navigate('/login');
}
}, [user, navigate]);

if (!user) return null;

return (
<div>
    <h1>Bienvenue {user.username}</h1>
    <p>Email: {user.email}</p>
    <p>Rôle: {user.role}</p>
</div>
);
}