// services/api.js
import axios from "axios";

const api = axios.create({
baseURL: "http://localhost:5000/api", // adapte selon ton backend
});

// Permet de définir le token sur toutes les requêtes
export const setAuthToken = (token) => {
if (token) {
api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
} else {
delete api.defaults.headers.common["Authorization"];
}
};

// 🔹 Fonction logout
export const auth = {
logout: () => {
localStorage.removeItem("user");
setAuthToken(null);
},
};

export default api;
