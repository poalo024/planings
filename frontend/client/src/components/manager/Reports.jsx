import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import API, { setAuthToken } from '../../services/api';

const Reports = () => {
const { user } = useContext(AuthContext);
const [reports, setReports] = useState([]);

useEffect(() => {
if (user?.token) setAuthToken(user.token);
fetchReports();
}, [user]);

const fetchReports = async () => {
try {
    const res = await API.get('/reports');
    setReports(res.data);
} catch (err) {
    console.error('Erreur lors du chargement des rapports', err);
}
};

return (
<div>
    <h3>Rapports</h3>
    <ul>
    {reports.map(r => (
        <li key={r._id}>{r.title} - {r.date}</li>
    ))}
    </ul>
</div>
);
};

export default Reports;
