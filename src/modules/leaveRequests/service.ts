// src/modules/leave_requests/service.ts

import type { LeaveRequest } from "./model";

const API_URL = "http://127.0.0.1:8000/api/leave_requests";

// Fonction utilitaire pour obtenir les headers avec le token
function getAuthHeaders() {
    // 💡 Récupère le jeton stocké lors de la connexion
    const authToken = localStorage.getItem('auth_token'); 
    
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    // Ajoute l'entête Authorization si le jeton est présent
    if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
    }

    return headers;
}

// ... (fetchLeaveRequests et getLeaveRequest restent inchangés)

export async function fetchLeaveRequests(search = "", page = 1) {
    const res = await fetch(`${API_URL}?search=${search}&page=${page}`, {
        headers: getAuthHeaders(), // Ajout de l'authentification
    });
    if (!res.ok) throw new Error("Erreur lors du chargement des demandes de congé");
    return res.json();
}

export async function getLeaveRequest(id: number): Promise<LeaveRequest> {
    const res = await fetch(`${API_URL}/${id}`, {
        headers: getAuthHeaders(), // Ajout de l'authentification
    });
    if (!res.ok) throw new Error("Demande introuvable");
    return res.json();
}


export async function createLeaveRequest(data: Partial<LeaveRequest>) {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeaders(), // 🎯 Utilisation des headers avec le token
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        let errorMessage = `Erreur lors de la création (Statut HTTP: ${res.status})`;

        // Tenter de lire le corps de l'erreur pour un meilleur diagnostic
        try {
            const errorBody = await res.json();
            
            if (errorBody.message) {
                 errorMessage = errorBody.message;
            } else if (errorBody.errors) {
                 // Gère les erreurs de validation (statut 422)
                 const validationErrors = Object.values(errorBody.errors).flat().join('; ');
                 errorMessage = `Validation échouée: ${validationErrors}`;
            }
        } catch (e) {
            // Le corps de la réponse n'était pas JSON, on garde le message générique
        }

        throw new Error(errorMessage);
    }
    return res.json();
}

export async function updateLeaveRequest(id: number, data: Partial<LeaveRequest>) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(), // 🎯 Utilisation des headers avec le token
        body: JSON.stringify(data),
    });
    
    if (!res.ok) {
         let errorMessage = `Erreur lors de la modification (Statut HTTP: ${res.status})`;
         try {
             const errorBody = await res.json();
             errorMessage = errorBody.message || errorMessage;
         } catch (e) { /* ignore */ }
         throw new Error(errorMessage);
    }
    return res.json();
}

export async function deleteLeaveRequest(id: number) {
    const res = await fetch(`${API_URL}/${id}`, { 
        method: "DELETE",
        headers: getAuthHeaders(), // 🎯 Utilisation des headers avec le token
    });
    
    if (!res.ok) throw new Error("Erreur lors de la suppression");
    return true;
}