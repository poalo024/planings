import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function FirstLogin() {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();
    
    const token = searchParams.get('token');
    const entrepriseName = searchParams.get('entreprise');

    console.log('Token reçu:', token);
    console.log('Entreprise reçue:', entrepriseName);
    console.log('URL complète:', window.location.href);

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setError('Token manquant dans l\'URL. Veuillez vérifier le lien d\'invitation.');
                setLoading(false);
                return;
            }

            if (!entrepriseName) {
                setError('Nom d\'entreprise manquant dans l\'URL. Veuillez vérifier le lien d\'invitation.');
                setLoading(false);
                return;
            }

            try {
                console.log('Vérification du token:', token);
                
                // ✅ URL corrigée avec params
                const res = await axios.get(`http://localhost:5000/api/users/verify-token`, {
                    params: { token }
                });
                
                console.log('Réponse du serveur:', res.data);
                
                if (res.data.success) {
                    setUserInfo(res.data.user);
                    console.log('Token valide, utilisateur:', res.data.user);
                } else {
                    setError(res.data.message || 'Token invalide.');
                }
            } catch (err) {
                console.error('Erreur lors de la vérification:', err);
                console.error('Détails de l\'erreur:', err.response?.data);
                
                if (err.code === 'ECONNREFUSED') {
                    setError('Impossible de se connecter au serveur. Vérifiez que le serveur backend est démarré sur le port 5000.');
                } else if (err.response?.status === 400) {
                    setError('Token invalide ou expiré. Veuillez demander un nouveau lien d\'invitation.');
                } else if (err.response?.status === 404) {
                    setError('Endpoint API non trouvé. Vérifiez la configuration du serveur.');
                } else if (err.response?.status === 500) {
                    setError('Erreur interne du serveur. Veuillez contacter l\'administrateur.');
                } else {
                    setError('Erreur de connexion au serveur. Veuillez réessayer plus tard.');
                }
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [token, entrepriseName]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas.');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }

        try {
            console.log('Activation du compte avec token:', token);
            
            const res = await axios.post('http://localhost:5000/api/users/first-login', {
                token,
                password: formData.password,
            });

            console.log('Réponse activation:', res.data);

            if (res.data.success) {
                toast.success(res.data.message);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            console.error('Erreur activation:', err);
            if (err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error('Erreur de connexion au serveur lors de l\'activation.');
            }
        }
    };

    if (loading) return <div style={styles.loading}>Vérification du token...</div>;
    if (error) return (
        <div style={styles.error}>
            <h2>❌ Erreur</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/login')} style={styles.button}>
                Retour à la connexion
            </button>
        </div>
    );

    return (
        <div style={styles.container}>
            <h2>🔐 Finaliser votre inscription</h2>
            <p>
                Bonjour, vous avez été invité à rejoindre <strong>{decodeURIComponent(entrepriseName)}</strong> en tant que
                <strong> {userInfo?.role === 'manager' ? ' Manager' : ' Employé'}</strong>.
            </p>
            <p>Veuillez définir votre mot de passe pour activer votre compte.</p>

            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    type="password"
                    name="password"
                    placeholder="Nouveau mot de passe (min. 6 caractères)"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength="6"
                    style={styles.input}
                />
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirmer le mot de passe"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    minLength="6"
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>
                    Activer mon compte
                </button>
            </form>

            <div style={styles.debug}>
                <small>
                    Debug - Token: {token?.substring(0, 10)}... | 
                    Entreprise: {entrepriseName}
                </small>
            </div>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '500px',
        margin: '2rem auto',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginTop: '1rem',
    },
    input: {
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
    },
    button: {
        padding: '0.75rem',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    loading: {
        textAlign: 'center',
        padding: '2rem',
        fontSize: '1.2rem',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        padding: '2rem',
        maxWidth: '500px',
        margin: '2rem auto',
        backgroundColor: '#ffe6e6',
        borderRadius: '8px',
        border: '1px solid #ffcccb',
    },
    debug: {
        marginTop: '1rem',
        padding: '0.5rem',
        backgroundColor: '#f0f0f0',
        borderRadius: '4px',
        fontSize: '0.8rem',
        color: '#666',
    }
};