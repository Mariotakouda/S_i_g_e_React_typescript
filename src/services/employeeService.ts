// src/services/employeeService.ts
import { api } from '../api/axios';
import type { Employee } from '../context/AuthContext';

// Définitions des types de données reçues
export interface Task {
    id: number;
    title: string;
    description: string;
    due_date: string; // ISO format
    status: 'pending' | 'in_progress' | 'completed';
    // ... autres champs
}

export interface Presence {
    id: number;
    check_in_time: string; // ISO format
    check_out_time: string | null;
    status: string;
    // ...
}

export interface LeaveRequest {
    id: number;
    type: string;
    start_date: string;
    end_date: string;
    status: 'pending' | 'approved' | 'rejected';
    // ...
}

export interface Announcement {
    id: number;
    title: string;
    content: string;
    created_at: string;
    // ...
}

// FONCTIONS DE SERVICE

/**
 * Récupère le profil complet de l'employé connecté (API /employee/me).
 */
export const fetchEmployeeProfile = async (): Promise<Employee> => {
    const response = await api.get('/employee/me');
    // Laravel retourne { employee: EmployeeData } dans la méthode me()
    return response.data.employee; 
};

/**
 * Récupère toutes les tâches assignées à l'employé connecté.
 */
export const fetchMyTasks = async (): Promise<Task[]> => {
    const response = await api.get('/employee/tasks');
    return response.data; // Le contrôleur retourne directement un tableau Json
};

/**
 * Récupère les enregistrements de présence de l'employé.
 */
export const fetchMyPresences = async (): Promise<Presence[]> => {
    const response = await api.get('/employee/presences');
    return response.data;
};

/**
 * Récupère les annonces visibles par l'employé.
 */
export const fetchMyAnnouncements = async (): Promise<Announcement[]> => {
    const response = await api.get('/employee/announcements');
    return response.data;
};

