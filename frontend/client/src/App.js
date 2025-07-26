import axios from 'axios';
import { useEffect, useState } from 'react';

function App() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', position: '' });

  useEffect(() => {
    axios.get('http://localhost:5000/api/employees')
      .then(res => setEmployees(res.data))
      .catch(console.error);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/employees', form)
      .then(res => setEmployees([...employees, res.data]))
      .catch(console.error);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Gestion des Employés</h1>
      
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Prénom"
          value={form.firstName}
          onChange={(e) => setForm({...form, firstName: e.target.value})}
          required
        />
        <input
          placeholder="Nom"
          value={form.lastName}
          onChange={(e) => setForm({...form, lastName: e.target.value})}
          required
        />
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({...form, email: e.target.value})}
          required
        />
        <input
          placeholder="Position"
          value={form.position}
          onChange={(e) => setForm({...form, position: e.target.value})}
        />
        <button type="submit">Ajouter</button>
      </form>

      <ul>
        {employees.map(emp => (
          <li key={emp._id}>{emp.firstName} {emp.lastName} {emp.position ? `(${emp.position})` : ''}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
