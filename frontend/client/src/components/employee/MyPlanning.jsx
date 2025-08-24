// src/components/employee/MyPlanning.jsx
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import API from "../../services/api";

const MyPlanning = () => {
  const { user } = useContext(AuthContext);
  const [planning, setPlanning] = useState([]);

  useEffect(() => {
    if (user?.token) {
      fetchPlanning();
    }
  }, [user]);

  const fetchPlanning = async () => {
    try {
      // ⚠️ route backend à adapter : /planning/me renvoie le planning de l'employé connecté
      const res = await API.get("/planning/me", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setPlanning(res.data);
    } catch (err) {
      toast.error("Erreur lors du chargement du planning");
    }
  };

  return (
    <div>
      <h2>📅 Mon Planning</h2>
      <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "15px", borderCollapse: "collapse" }}>
        <thead style={{ background: "#f0f0f0" }}>
          <tr>
            <th>Date</th>
            <th>Heure de début</th>
            <th>Heure de fin</th>
            <th>Tâche / Poste</th>
          </tr>
        </thead>
        <tbody>
          {planning.length > 0 ? (
            planning.map((item) => (
              <tr key={item._id}>
                <td>{new Date(item.date).toLocaleDateString()}</td>
                <td>{item.startTime}</td>
                <td>{item.endTime}</td>
                <td>{item.task || "Non défini"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                Aucun planning disponible
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MyPlanning;
