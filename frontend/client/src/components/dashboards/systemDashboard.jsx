import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../navbar';

const StatCard = ({ icon, value, title, subtitle }) => (
  <div style={styles.statCard}>
    <div style={styles.statIcon}>{icon}</div>
    <div>
      <h3>{value}</h3>
      <p>{title}</p>
      <small>{subtitle}</small>
    </div>
  </div>
);

const EnterpriseCard = ({ ent, onEdit, onDelete }) => (
  <div key={ent._id} style={styles.enterpriseCard}>
    <div style={styles.enterpriseHeader}>
      <div style={styles.enterpriseInfo}>
        <h4>🏢 {ent.nom}</h4>
        <p>{ent.description}</p>
        {ent.managers?.length > 0 ? (
          <>
            <p>
              <strong>👔 Managers ({ent.managers.length}) :</strong>
            </p>
            <ul style={styles.managerList}>
              {ent.managers.map((manager, index) => (
                <li key={index} style={styles.managerItem}>
                  {manager.prenom} {manager.nom} ({manager.email}) {manager.isActive ? "✅ Actif" : "❌ Inactif"}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p><strong>👔 Managers :</strong> Aucun manager assigné</p>
        )}
        <p style={styles.enterpriseDate}>
          <strong>📅 Créée le :</strong> {new Date(ent.createdAt || Date.now()).toLocaleDateString('fr-FR')}
        </p>
      </div>
      <div style={styles.enterpriseActions}>
        <button onClick={() => onEdit(ent)} style={styles.editButton} title="Modifier l'entreprise">
          ✏️ Modifier
        </button>
        <button onClick={() => onDelete(ent._id, ent.nom)} style={styles.deleteButton} title="Supprimer l'entreprise">
          🗑️ Supprimer
        </button>
      </div>
    </div>
  </div>
);

const RecentEnterpriseCard = ({ ent }) => (
  <div key={ent._id} style={styles.recentCard}>
    <div>
      <h4>🏢 {ent.nom}</h4>
      <p>{ent.description}</p>
    </div>
    <small>{new Date(ent.createdAt || Date.now()).toLocaleDateString('fr-FR')}</small>
  </div>
);

export default function SystemDashboard({ user, setUser }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [enterprises, setEnterprises] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [stats, setStats] = useState({
    totalEnterprises: 0,
    totalManagers: 0,
    totalEmployees: 0,
    totalSystemAdmins: 0,
  });
  const [showForm, setShowForm] = useState(false);
  const [editingEnterprise, setEditingEnterprise] = useState(null);
  const [formData, setFormData] = useState({
    enterpriseName: '',
    enterpriseDescription: '',
    managerFirstName: '',
    managerLastName: '',
    managerEmail: '',
  });
  const token = localStorage.getItem('token');

  if (!user) return <Navigate to="/login" />;

  useEffect(() => {
    if (activeSection === 'enterprises' || activeSection === 'overview') {
      fetchEnterprises();
      if (activeSection === 'overview') fetchAllUsers();
    }
  }, [activeSection]);

  useEffect(() => {
    const managers = allUsers.filter(u => u.role?.toLowerCase() === 'manager');
    const employees = allUsers.filter(u => ['user', 'employee'].includes(u.role?.toLowerCase()));
    const systemAdmins = allUsers.filter(u => ['system-admin', 'admin'].includes(u.role?.toLowerCase()));
    setStats({
      totalEnterprises: enterprises.length,
      totalManagers: managers.length,
      totalEmployees: employees.length,
      totalSystemAdmins: systemAdmins.length,
    });
  }, [enterprises, allUsers]);

  const fetchEnterprises = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/entreprises', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setEnterprises(data.data || []);
        console.log("Données des entreprises :", data.data); // Vérifie la structure ici
      } else {
        toast.error(data.message || 'Erreur chargement entreprises');
      }
    } catch (err) {
      toast.error('Erreur lors du chargement des entreprises');
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setAllUsers(data || []);
      else toast.error('Erreur chargement utilisateurs');
    } catch (err) {
      toast.error('Erreur lors du chargement des utilisateurs');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingEnterprise
        ? `http://localhost:5000/api/entreprises/${editingEnterprise._id}`
        : 'http://localhost:5000/api/entreprises';
      const method = editingEnterprise ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom: formData.enterpriseName,
          description: formData.enterpriseDescription,
          managerEmail: formData.managerEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Erreur ${editingEnterprise ? 'modification' : 'création'} entreprise`);
      toast.success(`Entreprise ${editingEnterprise ? 'modifiée' : 'créée'} avec succès !`);
      resetForm();
      fetchEnterprises();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteEnterprise = async (enterpriseId, enterpriseName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'entreprise "${enterpriseName}" ?\n\nCette action est irréversible et supprimera aussi tous les utilisateurs associés.`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/entreprises/${enterpriseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Erreur suppression entreprise');
      toast.success(`Entreprise "${enterpriseName}" supprimée avec succès`);
      fetchEnterprises();
      fetchAllUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const editEnterprise = (enterprise) => {
    setEditingEnterprise(enterprise);
    setFormData({
      enterpriseName: enterprise.nom,
      enterpriseDescription: enterprise.description,
      managerFirstName: '',
      managerLastName: '',
      managerEmail: enterprise.managers?.[0]?.email || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      enterpriseName: '',
      enterpriseDescription: '',
      managerFirstName: '',
      managerLastName: '',
      managerEmail: '',
    });
    setShowForm(false);
    setEditingEnterprise(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <div style={styles.dashboard}>
      <Navbar user={user} onLogout={handleLogout} />

      <div style={styles.mainNav}>
        {['overview', 'enterprises', 'test'].map(section => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            style={activeSection === section ? styles.navButtonActive : styles.navButton}
          >
            {section === 'overview' ? '📊 Vue d\'ensemble' :
             section === 'enterprises' ? '🏢 Entreprises' : '🔧 Test'}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {activeSection === 'overview' && (
          <>
            <div style={styles.header}>
              <h1>📊 Administration Système</h1>
              <p>Panneau de contrôle principal - Bienvenue {user.prenom || user.nom || user.email} !</p>
            </div>
            <div style={styles.statsGrid}>
              <StatCard icon="🏢" value={stats.totalEnterprises} title="Entreprises" subtitle="Total des entreprises enregistrées" />
              <StatCard icon="👔" value={stats.totalManagers} title="Managers" subtitle="Gestionnaires d'entreprises" />
              <StatCard icon="👥" value={stats.totalEmployees} title="Employés" subtitle="Utilisateurs et employés" />
              <StatCard icon="⚙️" value={stats.totalSystemAdmins} title="Admins" subtitle="Administrateurs système" />
            </div>
            <div style={styles.quickActions}>
              <h3>🚀 Actions rapides</h3>
              <div style={styles.actionButtons}>
                <button onClick={() => setActiveSection('enterprises')} style={styles.actionButton}>
                  🏢 Gérer les Entreprises
                </button>
                <button onClick={() => { setActiveSection('enterprises'); setShowForm(true); }} style={styles.actionButtonSecondary}>
                  ➕ Créer une Entreprise
                </button>
              </div>
            </div>
            {enterprises.length > 0 && (
              <div style={styles.recentSection}>
                <h3>🕒 Dernières entreprises créées</h3>
                <div style={styles.recentList}>
                  {enterprises.slice(-3).reverse().map(ent => <RecentEnterpriseCard key={ent._id} ent={ent} />)}
                </div>
              </div>
            )}
          </>
        )}

        {activeSection === 'enterprises' && (
          <>
            <div style={styles.sectionHeader}>
              <h1>🏢 Gestion des Entreprises</h1>
              <button onClick={showForm ? resetForm : () => setShowForm(true)} style={styles.addButton}>
                {showForm ? '❌ Annuler' : '➕ Nouvelle Entreprise'}
              </button>
            </div>
            {showForm && (
              <form onSubmit={handleSubmit} style={styles.form}>
                <h4>{editingEnterprise ? '✏️ Modifier l\'entreprise' : '📋 Nouvelle entreprise'}</h4>
                {editingEnterprise && (
                  <div style={styles.editNotice}>
                    <p>🔄 Vous modifiez : <strong>{editingEnterprise.nom}</strong></p>
                  </div>
                )}
                <input
                  type="text"
                  name="enterpriseName"
                  placeholder="Nom de l'entreprise *"
                  value={formData.enterpriseName}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                />
                <textarea
                  name="enterpriseDescription"
                  placeholder="Description de l'entreprise *"
                  value={formData.enterpriseDescription}
                  onChange={handleInputChange}
                  required
                  style={styles.textarea}
                  rows="3"
                />
                {!editingEnterprise && (
                  <>
                    <h4>👤 Manager à inviter</h4>
                    <div style={styles.row}>
                      <input
                        type="text"
                        name="managerFirstName"
                        placeholder="Prénom"
                        value={formData.managerFirstName}
                        onChange={handleInputChange}
                        style={styles.input}
                      />
                      <input
                        type="text"
                        name="managerLastName"
                        placeholder="Nom"
                        value={formData.managerLastName}
                        onChange={handleInputChange}
                        style={styles.input}
                      />
                    </div>
                    <input
                      type="email"
                      name="managerEmail"
                      placeholder="Email du manager *"
                      value={formData.managerEmail}
                      onChange={handleInputChange}
                      required
                      style={styles.input}
                    />
                  </>
                )}
                <div style={styles.formButtons}>
                  <button type="submit" style={styles.submitButton}>
                    {editingEnterprise ? '💾 Sauvegarder les modifications' : '✅ Créer Entreprise et Inviter Manager'}
                  </button>
                  {editingEnterprise && (
                    <button type="button" onClick={resetForm} style={styles.cancelButton}>
                      ❌ Annuler
                    </button>
                  )}
                </div>
              </form>
            )}
            <div style={styles.list}>
              <h3>Entreprises existantes ({enterprises.length})</h3>
              {enterprises.length === 0 ? (
                <div style={styles.emptyState}>
                  <p>🏢 Aucune entreprise enregistrée</p>
                  <p>Créez votre première entreprise avec le bouton ci-dessus</p>
                </div>
              ) : (
                enterprises.map(ent => (
                  <EnterpriseCard
                    key={ent._id}
                    ent={ent}
                    onEdit={editEnterprise}
                    onDelete={deleteEnterprise}
                  />
                ))
              )}
            </div>
          </>
        )}

        {activeSection === 'test' && (
          <div>
            <h1>🔧 Section de Test</h1>
            <div style={styles.userInfo}>
              <h2>Informations utilisateur :</h2>
              <p><strong>Nom:</strong> {user.prenom} {user.nom}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Rôle:</strong> {user.role}</p>
            </div>
            <button onClick={() => alert('Test bouton OK!')} style={styles.testButton}>
              Test Bouton
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  dashboard: { display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f8f9fa' },
  mainNav: { display: 'flex', backgroundColor: 'white', borderBottom: '1px solid #e9ecef', padding: '0 2rem' },
  navButton: { padding: '1rem 2rem', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderBottom: '3px solid transparent', fontSize: '1rem' },
  navButtonActive: { padding: '1rem 2rem', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderBottom: '3px solid #007bff', fontSize: '1rem', color: '#007bff' },
  content: { flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', overflowY: 'auto' },
  header: { textAlign: 'center', marginBottom: '3rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' },
  statCard: { backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'default' },
  statIcon: { fontSize: '3rem' },
  quickActions: { backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)', marginBottom: '2rem' },
  actionButtons: { display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' },
  actionButton: { padding: '1rem 2rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500' },
  actionButtonSecondary: { padding: '1rem 2rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500' },
  recentSection: { backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' },
  recentList: { display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' },
  recentCard: { padding: '1rem', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'start' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  addButton: { padding: '1rem 2rem', borderRadius: '8px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: '500' },
  form: { backgroundColor: 'white', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' },
  editNotice: { backgroundColor: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', color: '#856404' },
  formButtons: { display: 'flex', gap: '1rem', marginTop: '1rem' },
  input: { padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', marginBottom: '1rem', width: '100%', boxSizing: 'border-box' },
  textarea: { padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', marginBottom: '1rem', width: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: '100px' },
  row: { display: 'flex', gap: '1rem', marginBottom: '1rem' },
  submitButton: { padding: '1rem 2rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500', flex: 1 },
  cancelButton: { padding: '1rem 2rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500' },
  list: { marginTop: '2rem' },
  emptyState: { textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '12px', color: '#666', boxShadow: '0 2px 4px rgba(0,0,0,0.07)' },
  enterpriseCard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' },
  enterpriseHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '2rem' },
  enterpriseInfo: { flex: 1 },
  enterpriseDate: { color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' },
  enterpriseActions: { display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '120px' },
  editButton: { padding: '0.5rem 1rem', backgroundColor: '#ffc107', color: '#212529', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' },
  deleteButton: { padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' },
  userInfo: { backgroundColor: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  testButton: { padding: '1rem 2rem', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '1rem', marginBottom: '1rem' },
  managerList: {
    margin: '0.5rem 0',
    paddingLeft: '1.5rem',
  },
  managerItem: {
    margin: '0.25rem 0',
    fontSize: '0.9rem',
  },
};
