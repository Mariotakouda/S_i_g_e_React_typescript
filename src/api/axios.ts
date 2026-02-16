
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour ajouter automatiquement le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Requête:', config.method?.toUpperCase(), config.url, {
      hasToken: !!token
    });
    return config;
  },
  (error) => {
    console.error('Erreur intercepteur requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses
api.interceptors.response.use(
  (response) => {
    console.log('Réponse:', response.status, response.config.url);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error('Non authentifié - Nettoyage du token');
      // Suggestion: Nettoyer le localStorage immédiatement en cas de 401
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('employee');
      // Le AuthContext peut alors réagir à l'absence de token/user
    }
    console.error('Erreur intercepteur réponse:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);