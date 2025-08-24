import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const PlanningManagement = ({ currentUser = null }) => {
const [employees, setEmployees] = useState([]);
const [selectedEmployee, setSelectedEmployee] = useState('');
const [plannings, setPlannings] = useState([]);
const [loading, setLoading] = useState(false);
const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());
const [viewMode, setViewMode] = useState('manager'); // 'manager' ou 'employee'

const [weeklyForm, setWeeklyForm] = useState({
employeeId: '',
weekStart: '',
schedule: {
    lundi: { start: '', end: '', isWorking: false },
    mardi: { start: '', end: '', isWorking: false },
    mercredi: { start: '', end: '', isWorking: false },
    jeudi: { start: '', end: '', isWorking: false },
    vendredi: { start: '', end: '', isWorking: false },
    samedi: { start: '', end: '', isWorking: false },
    dimanche: { start: '', end: '', isWorking: false }
}
});

const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const daysInFrench = {
lundi: 'Lundi',
mardi: 'Mardi',
mercredi: 'Mercredi',
jeudi: 'Jeudi',
vendredi: 'Vendredi',
samedi: 'Samedi',
dimanche: 'Dimanche'
};

// Déterminer le mode d'affichage selon le rôle
useEffect(() => {
if (currentUser) {
    if (currentUser.role?.toLowerCase() === 'admin' || currentUser.role?.toLowerCase() === 'manager') {
    setViewMode('manager');
    } else {
    setViewMode('employee');
    setSelectedEmployee(currentUser._id || currentUser.id);
    }
}
}, [currentUser]);

useEffect(() => {
if (viewMode === 'manager') {
    fetchEmployees();
}
fetchPlannings();
}, [viewMode, selectedEmployee, currentWeek]);

// Récupérer la semaine courante
function getCurrentWeek() {
const now = new Date();
const startOfWeek = new Date(now);
const day = startOfWeek.getDay();
const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
startOfWeek.setDate(diff);
return formatDate(startOfWeek);
}

function formatDate(date) {
return date.toISOString().split('T')[0];
}

function getWeekDates(weekStart) {
const startDate = new Date(weekStart);
const dates = [];
for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
}
return dates;
}

const fetchEmployees = async () => {
try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/users', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
    });

    if (response.ok) {
    const data = await response.json();
    const activeEmployees = data.filter(emp =>
        emp.statut !== 'inactif' && emp.role?.toLowerCase() !== 'admin'
    );
    setEmployees(activeEmployees);
    } else {
    toast.error('Erreur lors du chargement des employés');
    }
} catch (error) {
    toast.error('Erreur de connexion');
    console.error('Erreur:', error);
}
};

const fetchPlannings = async () => {
if (!selectedEmployee && viewMode === 'manager') return;

setLoading(true);
try {
    const token = localStorage.getItem('token');
    const employeeId = viewMode === 'employee' ? (currentUser._id || currentUser.id) : selectedEmployee;

    const response = await fetch(`/api/plannings?employeeId=${employeeId}&week=${currentWeek}`, {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
    });

    if (response.ok) {
    const data = await response.json();
    setPlannings(data);
    } else if (response.status === 404) {
    setPlannings([]);
    } else {
    toast.error('Erreur lors du chargement des plannings');
    }
} catch (error) {
    toast.error('Erreur de connexion');
    console.error('Erreur:', error);
} finally {
    setLoading(false);
}
};

const handleScheduleChange = (day, field, value) => {
setWeeklyForm(prev => ({
    ...prev,
    schedule: {
    ...prev.schedule,
    [day]: {
        ...prev.schedule[day],
        [field]: value
    }
    }
}));
};

const toggleWorkingDay = (day) => {
setWeeklyForm(prev => ({
    ...prev,
    schedule: {
    ...prev.schedule,
    [day]: {
        ...prev.schedule[day],
        isWorking: !prev.schedule[day].isWorking,
        start: !prev.schedule[day].isWorking ? '09:00' : '',
        end: !prev.schedule[day].isWorking ? '17:00' : ''
    }
    }
}));
};

const calculateDayHours = (start, end) => {
if (!start || !end) return 0;
const startTime = new Date(`2000-01-01T${start}:00`);
const endTime = new Date(`2000-01-01T${end}:00`);
const diffMs = endTime - startTime;
return diffMs > 0 ? diffMs / (1000 * 60 * 60) : 0;
};

const calculateWeeklyHours = (schedule) => {
return days.reduce((total, day) => {
    if (schedule[day]?.isWorking) {
    return total + calculateDayHours(schedule[day].start, schedule[day].end);
    }
    return total;
}, 0);
};

const handleSubmitWeeklyPlanning = async (e) => {
e.preventDefault();
if (!selectedEmployee) {
    toast.error('Veuillez sélectionner un employé');
    return;
}

setLoading(true);
try {
    const token = localStorage.getItem('token');
    const planningData = {
    employeeId: selectedEmployee,
    weekStart: currentWeek,
    schedule: weeklyForm.schedule,
    totalHours: calculateWeeklyHours(weeklyForm.schedule),
    createdBy: currentUser._id || currentUser.id
    };

    const response = await fetch('/api/plannings', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(planningData)
    });

    if (response.ok) {
    toast.success('Planning créé avec succès! Notification envoyée par email.');
    resetForm();
    fetchPlannings();
    } else {
    const errorData = await response.json();
    toast.error(errorData.message || 'Erreur lors de la création du planning');
    }
} catch (error) {
    toast.error('Erreur de connexion');
    console.error('Erreur:', error);
} finally {
    setLoading(false);
}
};

const resetForm = () => {
setWeeklyForm({
    employeeId: '',
    weekStart: '',
    schedule: {
    lundi: { start: '', end: '', isWorking: false },
    mardi: { start: '', end: '', isWorking: false },
    mercredi: { start: '', end: '', isWorking: false },
    jeudi: { start: '', end: '', isWorking: false },
    vendredi: { start: '', end: '', isWorking: false },
    samedi: { start: '', end: '', isWorking: false },
    dimanche: { start: '', end: '', isWorking: false }
    }
});
};

const changeWeek = (direction) => {
const currentDate = new Date(currentWeek);
const newDate = new Date(currentDate);
newDate.setDate(currentDate.getDate() + (direction * 7));
setCurrentWeek(formatDate(newDate));
};

const getCurrentPlanning = () => {
return plannings.find(p => p.weekStart === currentWeek) || null;
};

if (loading && plannings.length === 0) {
return <div style={styles.loading}>Chargement...</div>;
}

return (
<div style={styles.container}>
    <div style={styles.header}>
    <h2>{viewMode === 'manager' ? 'Gestion des Plannings' : 'Mon Planning'}</h2>
    <div style={styles.weekNavigation}>
        <button onClick={() => changeWeek(-1)} style={styles.weekButton}>← Semaine précédente</button>
        <span style={styles.weekDisplay}>Semaine du {new Date(currentWeek).toLocaleDateString('fr-FR')}</span>
        <button onClick={() => changeWeek(1)} style={styles.weekButton}>Semaine suivante →</button>
    </div>
    </div>

    {/* Sélection employé */}
    {viewMode === 'manager' && (
    <div style={styles.employeeSelector}>
        <label style={styles.label}>Sélectionner un employé:</label>
        <select
        value={selectedEmployee}
        onChange={(e) => setSelectedEmployee(e.target.value)}
        style={styles.select}
        >
        <option value="">Choisir un employé</option>
        {employees.map(emp => (
            <option key={emp._id} value={emp._id}>
            {emp.prenom} {emp.nom} - {emp.poste || 'Employé'}
            </option>
        ))}
        </select>
    </div>
    )}

    {/* Formulaire manager */}
    {viewMode === 'manager' && selectedEmployee && (
    <div style={styles.planningForm}>
        <h3>Créer le planning pour la semaine</h3>
        <form onSubmit={handleSubmitWeeklyPlanning}>
        <table style={styles.table}>
            <thead>
            <tr>
                <th>Jour</th>
                <th>Date</th>
                <th>Travaille ?</th>
                <th>Début</th>
                <th>Fin</th>
                <th>Heures</th>
            </tr>
            </thead>
            <tbody>
            {days.map((day, index) => {
                const weekDates = getWeekDates(currentWeek);
                const dayDate = weekDates[index];

                return (
                <tr key={day}>
                    <td>{daysInFrench[day]}</td>
                    <td>{dayDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</td>
                    <td>
                    <input
                        type="checkbox"
                        checked={weeklyForm.schedule[day].isWorking}
                        onChange={() => toggleWorkingDay(day)}
                    />
                    </td>
                    <td>
                    {weeklyForm.schedule[day].isWorking && (
                        <input
                        type="time"
                        value={weeklyForm.schedule[day].start}
                        onChange={(e) => handleScheduleChange(day, 'start', e.target.value)}
                        required
                        />
                    )}
                    </td>
                    <td>
                    {weeklyForm.schedule[day].isWorking && (
                        <input
                        type="time"
                        value={weeklyForm.schedule[day].end}
                        onChange={(e) => handleScheduleChange(day, 'end', e.target.value)}
                        required
                        />
                    )}
                    </td>
                    <td>
                    {weeklyForm.schedule[day].isWorking
                        ? calculateDayHours(
                            weeklyForm.schedule[day].start,
                            weeklyForm.schedule[day].end
                        ).toFixed(1) + "h"
                        : "Repos"}
                    </td>
                </tr>
                );
            })}
            </tbody>
        </table>

        <div style={styles.weekSummary}>
            <strong>Total hebdomadaire: {calculateWeeklyHours(weeklyForm.schedule).toFixed(1)} heures</strong>
        </div>

        <div style={styles.formActions}>
            <button type="button" onClick={resetForm} style={styles.cancelButton}>Annuler</button>
            <button type="submit" disabled={loading} style={loading ? styles.submitButtonDisabled : styles.submitButton}>
            {loading ? 'Création...' : 'Créer le planning'}
            </button>
        </div>
        </form>
    </div>
    )}

    {/* Affichage du planning existant */}
    {selectedEmployee && (
    <div style={styles.existingPlanning}>
        <h3>Planning de la semaine</h3>
        {(() => {
        const currentPlanning = getCurrentPlanning();
        if (!currentPlanning) {
            return <p style={styles.noPlanning}>Aucun planning défini pour cette semaine</p>;
        }

        return (
            <table style={styles.table}>
            <thead>
                <tr>
                <th>Jour</th>
                <th>Date</th>
                <th>Heures</th>
                <th>Total</th>
                </tr>
            </thead>
            <tbody>
                {days.map((day, index) => {
                const schedule = currentPlanning.schedule[day];
                const weekDates = getWeekDates(currentWeek);
                const dayDate = weekDates[index];

                return (
                    <tr key={day}>
                    <td>{daysInFrench[day]}</td>
                    <td>{dayDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</td>
                    <td>
                        {schedule?.isWorking ? `${schedule.start} - ${schedule.end}` : 'Repos'}
                    </td>
                    <td>
                        {schedule?.isWorking
                        ? calculateDayHours(schedule.start, schedule.end).toFixed(1) + "h"
                        : "-"}
                    </td>
                    </tr>
                );
                })}
                <tr>
                <td colSpan="3" style={{ fontWeight: 'bold' }}>Total semaine</td>
                <td style={{ fontWeight: 'bold', color: '#1976d2' }}>
                    {currentPlanning.totalHours?.toFixed(1) || 0}h
                </td>
                </tr>
            </tbody>
            </table>
        );
        })()}
    </div>
    )}
</div>
);
};

const styles = {
container: { padding: '2rem', maxWidth: '1400px', margin: '0 auto' },
header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
weekNavigation: { display: 'flex', alignItems: 'center', gap: '1rem' },
weekButton: { padding: '0.5rem 1rem', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
weekDisplay: { fontSize: '1.1rem', fontWeight: '500', minWidth: '200px', textAlign: 'center' },
employeeSelector: { marginBottom: '2rem' },
label: { display: 'block', marginBottom: '0.5rem', fontWeight: '500' },
select: { width: '100%', maxWidth: '400px', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' },
planningForm: { backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '2rem' },
existingPlanning: { backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
table: { width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' },
th: { border: '1px solid #ddd', padding: '0.75rem', backgroundColor: '#1976d2', color: 'white', textAlign: 'center' },
td: { border: '1px solid #ddd', padding: '0.75rem', textAlign: 'center' },
weekSummary: { textAlign: 'center', fontSize: '1.2rem', color: '#1976d2', marginBottom: '2rem' },
formActions: { display: 'flex', gap: '1rem', justifyContent: 'center' },
cancelButton: { padding: '0.75rem 1.5rem', border: '1px solid #ddd', backgroundColor: 'white', borderRadius: '4px', cursor: 'pointer' },
submitButton: { padding: '0.75rem 1.5rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
submitButtonDisabled: { padding: '0.75rem 1.5rem', backgroundColor: '#ccc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'not-allowed' },
loading: { textAlign: 'center', padding: '3rem', fontSize: '1.1rem', color: '#666' },
noPlanning: { textAlign: 'center', padding: '1rem', color: '#666' }
};

export default PlanningManagement;
