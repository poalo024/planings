import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage({ setUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Email ou mot de passe incorrect.');
                return;
            }

            // Sauvegarde token et infos utilisateur
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);

            navigate('/dashboard');
        } catch (err) {
            setError('Erreur serveur, réessayez.');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.loginBox}>
                <h2>Connexion</h2>
                <form onSubmit={handleLogin}>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={styles.input} />
                    <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required style={styles.input} />
                    {error && <p style={styles.error}>{error}</p>}
                    <button type="submit" style={styles.button}>Se connecter</button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#e0f7fa' },
    loginBox: { padding: '2rem', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', width: '350px' },
    input: { display: 'block', width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #ccc' },
    button: { width: '100%', padding: '0.8rem', borderRadius: '8px', border: 'none', background: '#00796b', color: '#fff', cursor: 'pointer' },
    error: { color: 'red', marginBottom: '1rem' }
};
