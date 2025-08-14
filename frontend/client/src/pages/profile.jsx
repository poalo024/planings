import { useEffect, useState } from 'react';
import { auth } from '../services/api'; // pour récupérer l'utilisateur connecté

export default function Profile() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const currentUser = auth.getCurrentUser();
        setUser(currentUser);
    }, []);

    if (!user) {
        return <p>Veuillez vous connecter pour voir votre profil.</p>;
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Mon profil</h1>
            <p><strong>Nom d’utilisateur :</strong> {user.username}</p>
            <p><strong>Email :</strong> {user.email}</p>
            {/* Ajoute d’autres infos si besoin */}
        </div>
    );
}
