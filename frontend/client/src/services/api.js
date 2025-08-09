// src/services/api.js
const API_URL = 'http://localhost:5000/api/users';

export const auth = {
register: async (userData) => {
const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
});

if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erreur lors de l'inscription");
}

return await response.json();
},

login: async (credentials) => {
const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
});

if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erreur lors de la connexion");
}

const data = await response.json();
if (data.token) {
    localStorage.setItem('user', JSON.stringify(data));
}

return data;
},

logout: () => {
localStorage.removeItem('user');
},

getCurrentUser: () => {
return JSON.parse(localStorage.getItem('user'));
}
};