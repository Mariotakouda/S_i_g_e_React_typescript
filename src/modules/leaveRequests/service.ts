// Fichier : leave_requests/service.ts (Corrigé pour utiliser les bonnes URLs)

import { api } from "../../api/axios";
import { ApiError, handleAxiosError } from "../../api/ApiError"; 
import type { CreateLeaveRequest, LeaveRequest } from "./model";

// ---------------------------------------------------------------------

export const LeaveRequestService = {
    // 1. Récupérer TOUTES les demandes (🎯 Pour le dashboard Admin)
    async fetchAllAdmin(): Promise<LeaveRequest[]> {
        try {
            // ✅ URL correcte SANS préfixe /admin/
            const response = await api.get('/leave-requests'); 
            return response.data; 
        } catch (error) {
            handleAxiosError(error);
        }
    },

    // 1b. Récupérer MES demandes (🎯 Pour le tableau de bord Employé)
    async fetchMyLeaves(): Promise<LeaveRequest[]> {
        try {
            // ✅ URL correcte pour l'employé connecté
            const response = await api.get('/me/leave_requests'); 
            return response.data; 
        } catch (error) {
            handleAxiosError(error);
        }
    },

    // 2. Créer une demande (Utilisé par l'employé)
    async create(data: CreateLeaveRequest): Promise<LeaveRequest> {
        try {
            // ✅ URL correcte pour l'employé connecté
            const response = await api.post('/me/leave_requests', data); 
            return response.data.request;
        } catch (error) {
            handleAxiosError(error);
        }
    },
    
    // 3. Action : Approuver une demande (🎯 Pour l'Admin)
    async approve(id: number): Promise<LeaveRequest> {
        try {
            // ✅ URL correcte SANS préfixe /admin/
            const response = await api.put(`/leave-requests/${id}/approve`); 
            return response.data.request;
        } catch (error) {
            handleAxiosError(error);
        }
    },

    // 4. Action : Rejeter une demande (🎯 Pour l'Admin)
    async reject(id: number): Promise<LeaveRequest> {
        try {
            // ✅ URL correcte SANS préfixe /admin/
            const response = await api.put(`/leave-requests/${id}/reject`); 
            return response.data.request;
        } catch (error) {
            handleAxiosError(error);
        }
    },

    // 5. Action : Supprimer une demande (🎯 Pour l'Admin)
    async delete(id: number): Promise<void> {
        try {
            // ✅ URL correcte SANS préfixe /admin/
            await api.delete(`/leave-requests/${id}`); 
        } catch (error) {
            handleAxiosError(error);
        }
    }
};

// Exporter ApiError du service pour l'utiliser dans les composants React
export { ApiError };