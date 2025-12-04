import { api } from "../../api/axios";
import type { LeaveRequest, LeaveRequestPaginatedResponse, LeaveStatistics, CreateLeaveRequest, UpdateLeaveRequest } from "./model";

export class ApiError extends Error {
    status: number;
    errors?: Record<string, string[]>;
    responseBody?: unknown;
    
    constructor(message: string, status: number, errors?: Record<string, string[]>, responseBody?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.errors = errors;
        this.responseBody = responseBody;
    }
}

// Fonction utilitaire pour gérer les erreurs axios
function handleAxiosError(error: any): never {
    console.error('❌ Erreur Axios:', error);
    
    if (error.response) {
        // Le serveur a répondu avec un code d'erreur
        const status = error.response.status;
        const data = error.response.data;
        
        console.error('📡 Response status:', status);
        console.error('📡 Response data:', data);
        
        const message = data.message || `Erreur HTTP ${status}`;
        const errors = data.errors;
        
        throw new ApiError(message, status, errors, data);
    } else if (error.request) {
        // La requête a été faite mais pas de réponse
        console.error('❌ Aucune réponse du serveur:', error.request);
        throw new ApiError('Aucune réponse du serveur', 0);
    } else {
        // Erreur lors de la configuration de la requête
        console.error('❌ Erreur de configuration:', error.message);
        throw new ApiError(error.message, 0);
    }
}

export async function fetchLeaveRequests(search = "", page = 1, filters?: {
    status?: string;
    employee_id?: number;
}): Promise<LeaveRequestPaginatedResponse> {
    try {
        console.log('🔍 GET /leave_requests', { search, page, filters });
        
        const params: any = { page };
        if (search) params.search = search;
        if (filters?.status) params.status = filters.status;
        if (filters?.employee_id) params.employee_id = filters.employee_id;
        
        const response = await api.get('/leave_requests', { params });
        
        console.log('✅ Réponse:', response.data);
        return response.data;
    } catch (error) {
        handleAxiosError(error);
    }
}

export async function getLeaveRequest(id: number): Promise<LeaveRequest> {
    try {
        console.log('🔍 GET /leave_requests/' + id);
        
        const response = await api.get(`/leave_requests/${id}`);
        
        console.log('✅ Réponse:', response.data);
        return response.data;
    } catch (error) {
        handleAxiosError(error);
    }
}

export async function createLeaveRequest(data: CreateLeaveRequest): Promise<LeaveRequest> {
    try {
        console.log('📤 === DÉBUT CRÉATION DEMANDE DE CONGÉ ===');
        console.log('📤 Données brutes:', data);
        
        // Validation côté client
        if (!data.employee_id || isNaN(Number(data.employee_id))) {
            throw new Error('employee_id doit être un nombre valide');
        }
        
        if (!data.type || !['vacances', 'maladie', 'impayé', 'autres'].includes(data.type)) {
            throw new Error('type doit être valide');
        }
        
        if (!data.start_date || !data.end_date) {
            throw new Error('Les dates sont requises');
        }
        
        // Construction du payload
        const payload = {
            employee_id: Number(data.employee_id),
            type: data.type,
            start_date: data.start_date,
            end_date: data.end_date,
            message: data.message || null
        };
        
        console.log('📤 Payload final:', payload);
        console.log('📤 Token utilisé:', localStorage.getItem('token') ? 'OUI ✅' : 'NON ❌');
        
        const response = await api.post('/leave_requests', payload);
        
        console.log('✅ === FIN CRÉATION - SUCCÈS ===');
        console.log('✅ Réponse:', response.data);
        
        return response.data.data || response.data;
    } catch (error) {
        console.error('❌ === FIN CRÉATION - ÉCHEC ===');
        handleAxiosError(error);
    }
}

export async function updateLeaveRequest(id: number, data: Partial<UpdateLeaveRequest>): Promise<LeaveRequest> {
    try {
        console.log('📤 PUT /leave_requests/' + id, data);
        
        if (data.employee_id !== undefined) {
            data.employee_id = Number(data.employee_id);
        }
        
        const response = await api.put(`/leave_requests/${id}`, data);
        
        console.log('✅ Réponse:', response.data);
        return response.data.data || response.data;
    } catch (error) {
        handleAxiosError(error);
    }
}

export async function deleteLeaveRequest(id: number): Promise<void> {
    try {
        console.log('🗑️ DELETE /leave_requests/' + id);
        
        await api.delete(`/leave_requests/${id}`);
        
        console.log('✅ Suppression réussie');
    } catch (error) {
        handleAxiosError(error);
    }
}

export async function fetchLeaveStatistics(employeeId?: number): Promise<LeaveStatistics> {
    try {
        console.log('📊 GET /leave_requests/statistics', { employeeId });
        
        const params: any = {};
        if (employeeId) params.employee_id = employeeId;
        
        const response = await api.get('/leave_requests/statistics', { params });
        
        console.log('✅ Réponse:', response.data);
        return response.data;
    } catch (error) {
        handleAxiosError(error);
    }
}