import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const LeaveRequest = () => {
const [formData, setFormData] = useState({
startDate: '',
endDate: '',
leaveType: 'vacation',
reason: '',
comments: ''
});

const [myRequests, setMyRequests] = useState([]);
const [loading, setLoading] = useState(false);
const [showForm, setShowForm] = useState(false);

useEffect(() => {
fetchMyRequests();
}, []);

const fetchMyRequests = async () => {
try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/leaves/my-requests', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
    });
    
    if (response.ok) {
    const data = await response.json();
    setMyRequests(data);
    }
} catch (error) {
    console.error('Erreur lors du chargement des demandes:', error);
}
};

const handleInputChange = (e) => {
const { name, value } = e.target;
setFormData(prev => ({
    ...prev,
    [name]: value
}));
};

const calculateDays = () => {
if (formData.startDate && formData.endDate) {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
}
return 0;
};

const handleSubmit = async (e) => {
e.preventDefault();

if (new Date(formData.endDate) < new Date(formData.startDate)) {
    toast.error('La date de fin ne peut pas être antérieure à la date de début');
    return;
}

setLoading(true);

try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/leaves', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        ...formData,
        duration: calculateDays()
    })
    });

    if (response.ok) {
    toast.success('Demande de congé soumise avec succès !');
    setFormData({
        startDate: '',
        endDate: '',
        leaveType: 'vacation',
        reason: '',
        comments: ''
    });
    setShowForm(false);
    fetchMyRequests();
    } else {
    const errorData = await response.json();
    toast.error(errorData.message || 'Erreur lors de la soumission');
    }
} catch (error) {
    toast.error('Erreur de connexion');
    console.error('Erreur:', error);
} finally {
    setLoading(false);
}
};

const getStatusColor = (status) => {
switch (status) {
    case 'approved': return '#4CAF50';
    case 'rejected': return '#f44336';
    case 'pending': return '#FF9800';
    default: return '#757575';
}
};

const getStatusText = (status) => {
switch (status) {
    case 'approved': return 'Approuvé';
    case 'rejected': return 'Rejeté';
    case 'pending': return 'En attente';
    default: return 'Inconnu';
}
};

const formatDate = (dateString) => {
return new Date(dateString).toLocaleDateString('fr-FR');
};

return (
<div style={styles.container}>
    <div style={styles.header}>
    <h2>Gestion des Congés</h2>
    <button 
        onClick={() => setShowForm(!showForm)}
        style={styles.addButton}
    >
        {showForm ? 'Annuler' : '+ Nouvelle Demande'}
    </button>
    </div>

    {showForm && (
    <div style={styles.formContainer}>
        <h3>Nouvelle Demande de Congé</h3>
        <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.row}>
            <div style={styles.inputGroup}>
            <label style={styles.label}>Date de début *</label>
            <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                style={styles.input}
                min={new Date().toISOString().split('T')[0]}
            />
            </div>
            
            <div style={styles.inputGroup}>
            <label style={styles.label}>Date de fin *</label>
            <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                style={styles.input}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
            />
            </div>
        </div>

        <div style={styles.inputGroup}>
            <label style={styles.label}>Type de congé *</label>
            <select
            name="leaveType"
            value={formData.leaveType}
            onChange={handleInputChange}
            required
            style={styles.select}
            >
            <option value="vacation">Congés payés</option>
            <option value="sick">Congé maladie</option>
            <option value="personal">Congé personnel</option>
            <option value="maternity">Congé maternité</option>
            <option value="paternity">Congé paternité</option>
            <option value="other">Autre</option>
            </select>
        </div>

        <div style={styles.inputGroup}>
            <label style={styles.label}>Motif *</label>
            <input
            type="text"
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            placeholder="Motif de la demande"
            required
            style={styles.input}
            />
        </div>

        <div style={styles.inputGroup}>
            <label style={styles.label}>Commentaires</label>
            <textarea
            name="comments"
            value={formData.comments}
            onChange={handleInputChange}
            placeholder="Informations complémentaires..."
            rows="3"
            style={styles.textarea}
            />
        </div>

        {formData.startDate && formData.endDate && (
            <div style={styles.durationInfo}>
            <strong>Durée: {calculateDays()} jour(s)</strong>
            </div>
        )}

        <div style={styles.buttonGroup}>
            <button 
            type="button" 
            onClick={() => setShowForm(false)}
            style={styles.cancelButton}
            >
            Annuler
            </button>
            <button 
            type="submit" 
            disabled={loading}
            style={loading ? styles.submitButtonDisabled : styles.submitButton}
            >
            {loading ? 'Envoi...' : 'Soumettre la demande'}
            </button>
        </div>
        </form>
    </div>
    )}

    <div style={styles.requestsList}>
    <h3>Mes Demandes</h3>
    {myRequests.length === 0 ? (
        <p style={styles.noRequests}>Aucune demande de congé</p>
    ) : (
        <div style={styles.requestsGrid}>
        {myRequests.map(request => (
            <div key={request._id} style={styles.requestCard}>
            <div style={styles.requestHeader}>
                <span style={{
                ...styles.statusBadge,
                backgroundColor: getStatusColor(request.status),
                }}>
                {getStatusText(request.status)}
                </span>
                <span style={styles.requestDate}>
                Demandé le {formatDate(request.createdAt)}
                </span>
            </div>
            
            <div style={styles.requestBody}>
                <div style={styles.requestInfo}>
                <strong>{request.leaveType === 'vacation' ? 'Congés payés' : request.leaveType}</strong>
                <p>{formatDate(request.startDate)} - {formatDate(request.endDate)}</p>
                <p>Durée: {request.duration} jour(s)</p>
                <p>Motif: {request.reason}</p>
                {request.comments && (
                    <p style={styles.comments}>Commentaires: {request.comments}</p>
                )}
                </div>
                
                {request.managerComments && (
                <div style={styles.managerComments}>
                    <strong>Commentaire du manager:</strong>
                    <p>{request.managerComments}</p>
                </div>
                )}
            </div>
            </div>
        ))}
        </div>
    )}
    </div>
</div>
);
};

const styles = {
container: {
padding: '2rem',
maxWidth: '1200px',
margin: '0 auto',
},
header: {
display: 'flex',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: '2rem',
},
addButton: {
backgroundColor: '#1976d2',
color: 'white',
border: 'none',
padding: '0.75rem 1.5rem',
borderRadius: '6px',
cursor: 'pointer',
fontSize: '1rem',
fontWeight: '500',
},
formContainer: {
backgroundColor: '#fff',
padding: '2rem',
borderRadius: '8px',
boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
marginBottom: '2rem',
},
form: {
display: 'flex',
flexDirection: 'column',
gap: '1rem',
},
row: {
display: 'grid',
gridTemplateColumns: '1fr 1fr',
gap: '1rem',
},
inputGroup: {
display: 'flex',
flexDirection: 'column',
},
label: {
marginBottom: '0.5rem',
fontWeight: '500',
color: '#333',
},
input: {
padding: '0.75rem',
border: '1px solid #ddd',
borderRadius: '4px',
fontSize: '1rem',
},
select: {
padding: '0.75rem',
border: '1px solid #ddd',
borderRadius: '4px',
fontSize: '1rem',
backgroundColor: 'white',
},
textarea: {
padding: '0.75rem',
border: '1px solid #ddd',
borderRadius: '4px',
fontSize: '1rem',
resize: 'vertical',
},
durationInfo: {
padding: '1rem',
backgroundColor: '#e3f2fd',
borderRadius: '4px',
textAlign: 'center',
color: '#1976d2',
},
buttonGroup: {
display: 'flex',
gap: '1rem',
justifyContent: 'flex-end',
},
cancelButton: {
padding: '0.75rem 1.5rem',
border: '1px solid #ddd',
backgroundColor: 'white',
borderRadius: '4px',
cursor: 'pointer',
},
submitButton: {
padding: '0.75rem 1.5rem',
backgroundColor: '#4CAF50',
color: 'white',
border: 'none',
borderRadius: '4px',
cursor: 'pointer',
fontWeight: '500',
},
submitButtonDisabled: {
padding: '0.75rem 1.5rem',
backgroundColor: '#ccc',
color: 'white',
border: 'none',
borderRadius: '4px',
cursor: 'not-allowed',
},
requestsList: {
backgroundColor: '#fff',
padding: '2rem',
borderRadius: '8px',
boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
},
noRequests: {
textAlign: 'center',
color: '#666',
fontStyle: 'italic',
},
requestsGrid: {
display: 'grid',
gap: '1rem',
},
requestCard: {
border: '1px solid #eee',
borderRadius: '8px',
padding: '1.5rem',
backgroundColor: '#fafafa',
},
requestHeader: {
display: 'flex',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: '1rem',
},
statusBadge: {
padding: '0.25rem 0.75rem',
borderRadius: '12px',
color: 'white',
fontSize: '0.875rem',
fontWeight: '500',
},
requestDate: {
fontSize: '0.875rem',
color: '#666',
},
requestBody: {
display: 'grid',
gridTemplateColumns: '2fr 1fr',
gap: '1rem',
},
requestInfo: {
lineHeight: 1.6,
},
comments: {
fontStyle: 'italic',
color: '#666',
},
managerComments: {
backgroundColor: '#fff3cd',
padding: '1rem',
borderRadius: '4px',
border: '1px solid #ffeaa7',
},
};

export default LeaveRequest;