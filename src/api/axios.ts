// src/api/axios.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // Ajustez selon votre backend
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔧 FIX: Intercepteur de requête - Ajoute le token automatiquement
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log("📤 Requête:", config.method?.toUpperCase(), config.url, {
      hasToken: !!token,
      headers: config.headers.Authorization
    });
    
    return config;
  },
  (error) => {
    console.error("❌ Erreur requête:", error);
    return Promise.reject(error);
  }
);

// 🔧 FIX: Intercepteur de réponse - Gère les erreurs 401
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

    // Si 401 (non autorisé), on déconnecte l'utilisateur
    if (error.response?.status === 401) {
      console.warn("🚫 Token invalide - Déconnexion");
      localStorage.removeItem("token");
      
      // Redirection vers login uniquement si pas déjà sur /login
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);