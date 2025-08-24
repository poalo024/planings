const axios = require('axios');

async function testAuth() {
try {
// 1. Login
const loginRes = await axios.post('http://localhost:5000/api/users/login', {
    email: 'garethtchoula@gmail.com',
    password: 'je 12345'
});

const token = loginRes.data.token;
console.log('Token:', token);

// 2. Requête protégée
const profileRes = await axios.get('http://localhost:5000/api/users/me', {
    headers: {
    'Authorization': `Bearer ${token}`
    }
});

console.log('Profil:', profileRes.data);
} catch (error) {
console.error('Erreur:', error.response?.data || error.message);
}
}

testAuth();