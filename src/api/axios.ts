import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json", // ✅ Ajoutez ceci
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log("📤 Requête:", config.method?.toUpperCase(), config.url, {
      hasToken: !!token,
    });
    
    return config;
  },
  (error) => {
    console.error("❌ Erreur requête:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log("✅ Réponse:", response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error("❌ Erreur réponse:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message
    });

    if (error.response?.status === 401) {
      console.warn("⚠️ Token invalide - Déconnexion");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("employee");
      
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);