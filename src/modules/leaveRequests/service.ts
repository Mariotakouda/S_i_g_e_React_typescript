import { api } from "../../api/axios";
import { ApiError, handleAxiosError } from "../../api/ApiError"; 
import type { CreateLeaveRequest, LeaveRequest } from "./model";

export const LeaveRequestService = {
    async fetchAllAdmin(): Promise<LeaveRequest[]> {
        try {
            const response = await api.get('/leave-requests'); 
            return response.data; 
        } catch (error) {
            handleAxiosError(error);
        }
    },

    async fetchMyLeaves(): Promise<LeaveRequest[]> {
        try {
            const response = await api.get('/me/leave_requests'); 
            return response.data; 
        } catch (error) {
            handleAxiosError(error);
        }
    },

    async create(data: CreateLeaveRequest): Promise<LeaveRequest> {
        try {
            const response = await api.post('/me/leave_requests', data); 
            return response.data.request;
        } catch (error) {
            handleAxiosError(error);
        }
    },
    
    // ✅ MODIFIÉ : Accepte désormais un admin_comment
    async approve(id: number, admin_comment?: string): Promise<LeaveRequest> {
        try {
            const response = await api.put(`/leave-requests/${id}/approve`, { admin_comment }); 
            return response.data.request;
        } catch (error) {
            handleAxiosError(error);
        }
    },

    // ✅ MODIFIÉ : Accepte désormais un admin_comment
    async reject(id: number, admin_comment?: string): Promise<LeaveRequest> {
        try {
            const response = await api.put(`/leave-requests/${id}/reject`, { admin_comment }); 
            return response.data.request;
        } catch (error) {
            handleAxiosError(error);
        }
    },

    async delete(id: number): Promise<void> {
        try {
            await api.delete(`/leave-requests/${id}`); 
        } catch (error) {
            handleAxiosError(error);
        }
    }
};

export { ApiError };