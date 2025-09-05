const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api/users';
const TEST_EMAIL = 'paoloalbert8@gmail.com';
const TEST_PASSWORD = 'je12345';

// Fonction de test avec délai
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testManagerLogin() {
    console.log('🧪 === TEST CONNEXION MANAGER SPÉCIFIQUE ===\n');
    console.log('📧 Email:', TEST_EMAIL);
    console.log('🔑 Mot de passe:', TEST_PASSWORD);
    console.log('🌐 URL API:', API_BASE_URL);
    console.log('═'.repeat(50));

    try {
        // 1. Test de santé de l'API
        console.log('\n1. 🏥 Test health check...');
        try {
            const healthResponse = await axios.get(`${API_BASE_URL}/health`);
            console.log('✅ Health check réussi:', healthResponse.data.status);
        } catch (error) {
            console.log('❌ Health check échoué:', error.message);
            if (error.code === 'ECONNREFUSED') {
                console.log('⚠️  Le serveur ne semble pas démarré ou l\'URL est incorrecte');
            }
            return;
        }

        await delay(1000);

        // 2. Test de connexion directe
        console.log('\n2. 🔐 Test de connexion directe...');
        try {
            const loginResponse = await axios.post(`${API_BASE_URL}/login`, {
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            });

            console.log('✅ CONNEXION RÉUSSIE !');
            console.log('🔑 Token JWT reçu:', loginResponse.data.token.substring(0, 30) + '...');
            console.log('👤 Données utilisateur:');
            console.log('   - ID:', loginResponse.data.user.id);
            console.log('   - Nom:', loginResponse.data.user.nom);
            console.log('   - Prénom:', loginResponse.data.user.prenom);
            console.log('   - Email:', loginResponse.data.user.email);
            console.log('   - Role:', loginResponse.data.user.role);
            console.log('   - Statut:', loginResponse.data.user.statut);
            console.log('   - Entreprise:', loginResponse.data.entreprise);

            const authToken = loginResponse.data.token;

            // 3. Test des routes protégées avec le token
            await delay(1000);
            console.log('\n3. 🛡️ Test des routes protégées...');
            
            try {
                const profileResponse = await axios.get(`${API_BASE_URL}/${loginResponse.data.user.id}`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                console.log('✅ Profil utilisateur récupéré:');
                console.log('   - Username:', profileResponse.data.username);
                console.log('   - Poste:', profileResponse.data.poste || 'Non défini');
                console.log('   - Téléphone:', profileResponse.data.telephone || 'Non défini');
            } catch (error) {
                console.log('⚠️  Erreur récupération profil:', error.response?.data?.message || error.message);
            }

        } catch (error) {
            console.log('❌ Échec de la connexion');
            
            if (error.response) {
                // Réponse du serveur avec code d'erreur
                console.log('📊 Status:', error.response.status);
                console.log('📋 Message:', error.response.data.message);
                
                if (error.response.status === 400) {
                    console.log('🔍 Détails supplémentaires:');
                    
                    if (error.response.data.debug) {
                        console.log('   - Password provided:', error.response.data.debug.passwordProvided);
                        console.log('   - Password length:', error.response.data.debug.passwordLength);
                        console.log('   - Comparison result:', error.response.data.debug.comparisonResult);
                    }
                    
                    if (error.response.data.accountNotActivated) {
                        console.log('⚠️  COMPTE NON ACTIVÉ - Utilisez le lien d\'invitation');
                    }
                }
            } else if (error.request) {
                // Pas de réponse du serveur
                console.log('❌ Pas de réponse du serveur');
                console.log('Vérifiez que le serveur est démarré sur le bon port');
            } else {
                // Erreur de configuration
                console.log('❌ Erreur de configuration:', error.message);
            }
        }

        await delay(1000);

        // 4. Debug de l'utilisateur
        console.log('\n4. 🔍 Debug de l\'utilisateur...');
        try {
            const debugResponse = await axios.get(`${API_BASE_URL}/debug/${TEST_EMAIL}`);
            console.log('✅ Debug info:');
            console.log('   - Trouvé:', debugResponse.data.found);
            
            if (debugResponse.data.found) {
                console.log('   - Has password:', debugResponse.data.user.hasPassword);
                console.log('   - Password length:', debugResponse.data.user.passwordLength);
                console.log('   - Is active:', debugResponse.data.user.isActive);
                console.log('   - Statut:', debugResponse.data.user.statut);
                console.log('   - Has reset token:', debugResponse.data.user.hasResetToken);
                console.log('   - Created at:', debugResponse.data.user.createdAt);
            }
        } catch (error) {
            console.log('⚠️  Route debug non disponible');
        }

    } catch (error) {
        console.log('💥 ERREUR CRITIQUE:', error.message);
    }

    console.log('\n═'.repeat(50));
    console.log('🏁 === FIN DU TEST ===');
}

// Exécution du test
testManagerLogin().catch(console.error);