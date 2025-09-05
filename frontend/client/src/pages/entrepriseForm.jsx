import axios from 'axios';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function NewEnterpriseForm() {
const [formData, setFormData] = useState({
nom: '',
description: '',
managerEmail: ''
});

const [loading, setLoading] = useState(false);

const handleChange = (e) => {
setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
};

const handleSubmit = async (e) => {
e.preventDefault();
setLoading(true);
try {
    const token = localStorage.getItem('token');
    const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/entreprises`,
    formData,
    { headers: { Authorization: `Bearer ${token}` } }
    );
    toast.success(res.data.message);
    setFormData({ nom: '', description: '', managerEmail: '' });
} catch (err) {
    toast.error(err.response?.data?.message || 'Erreur serveur');
} finally {
    setLoading(false);
}
};

return (
<form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '2rem auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <input
    type="text"
    name="nom"
    placeholder="Nom de l'entreprise"
    value={formData.nom}
    onChange={handleChange}
    required
    />
    <textarea
    name="description"
    placeholder="Description de l'entreprise"
    value={formData.description}
    onChange={handleChange}
    required
    />
    <input
    type="email"
    name="managerEmail"
    placeholder="Email du manager"
    value={formData.managerEmail}
    onChange={handleChange}
    required
    />
    <button type="submit" disabled={loading}>
    {loading ? 'Création...' : 'Créer l’entreprise'}
    </button>
</form>
);
}
