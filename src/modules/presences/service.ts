// src/modules/employee/presences/service.ts

import { api } from "../../api/axios";

export interface EmployeePresence {
  id: number;
  employee_id: number;
  date: string;
  check_in: string | null;
  check_out: string | null;
  total_hours: number | null;
  status: string;
  // ✅ Ajoutez cette partie :
  employee?: {
    id: number;
    first_name: string;
    last_name: string;
    profile_picture?: string;
  };
}
/**
 * Récupérer la liste globale pour l'admin
 */
export async function getAllPresences(filters?: { date?: string; month?: string }): Promise<any> {
  try {
    const response = await api.get("/presences", { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Récupérer toutes les présences de l'employé connecté
 */
export async function getMyPresences(): Promise<EmployeePresence[]> {
  try {
    const response = await api.get("/me/presences");
    
    // IMPORTANT: Laravel Paginate renvoie les données dans response.data.data
    // Si ce n'est pas paginé, c'est response.data.
    const rawData = response.data.data || response.data;
    const data = Array.isArray(rawData) ? rawData : [];
    
    return data;
  } catch (error: any) {
    console.error("❌ Erreur getMyPresences:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Vérifier s'il y a un check-in actif aujourd'hui
 */
export async function hasActiveCheckIn(): Promise<{ active: boolean; presence?: EmployeePresence }> {
  try {
    const presences = await getMyPresences();
    const today = new Date().toISOString().split('T')[0];
    
    const activePresence = presences.find(p => {
      // On compare la date (YYYY-MM-DD) et on vérifie que le check_out est vide
      return p.date === today && (!p.check_out || p.check_out === null);
    });
    
    return {
      active: !!activePresence,
      presence: activePresence
    };
  } catch (error) {
    return { active: false };
  }
}

/**
 * Pointer l'arrivée (Check-in)
 * Note: L'employeeId est géré côté backend via le token, 
 * mais on le garde en paramètre si votre controller en a besoin.
 */
export async function checkIn(): Promise<EmployeePresence> {
  try {
    // Utilisation de la nouvelle route définie dans api.php
    const response = await api.post("/presences/check-in");
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      throw new Error("Un pointage est déjà actif pour aujourd'hui.");
    }
    throw error;
  }
}

/**
 * Pointer la sortie (Check-out)
 */
export async function checkOut(presenceId: number): Promise<EmployeePresence> {
  try {
    const data = {
      check_out: new Date().toISOString()
    };
    
    // Utilisation de la route spécifique update pour le check-out
    const response = await api.put(`/presences/${presenceId}/check-out`, data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur checkOut:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Obtenir les statistiques de présence (Frontend)
 */
export function getPresenceStats(presences: EmployeePresence[]) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyPresences = presences.filter(p => {
    const presenceDate = new Date(p.date);
    return presenceDate.getMonth() === currentMonth && 
           presenceDate.getFullYear() === currentYear;
  });
  
  const totalHours = monthlyPresences.reduce((sum, p) => sum + (Number(p.total_hours) || 0), 0);
  const daysPresent = monthlyPresences.length;
  const averageHours = daysPresent > 0 ? totalHours / daysPresent : 0;
  
  return {
    totalHours: totalHours.toFixed(2),
    daysPresent,
    averageHours: averageHours.toFixed(2)
  };
}