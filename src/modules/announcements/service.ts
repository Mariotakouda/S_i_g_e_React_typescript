// src/modules/announcements/service.ts
import { api } from "../../api/axios";
import type { Announcement } from "./model";

export interface ManagerStatus {
  is_manager: boolean;
  is_admin: boolean;
  department_id: number | null;
  department_name?: string;
}

// Vérifier si l'utilisateur est un manager
export const checkManagerStatus = async (): Promise<ManagerStatus> => {
  const response = await api.get("/check-manager-status");
  return response.data;
};

// Récupérer toutes les annonces (filtrées selon le rôle de l'utilisateur)
export const fetchAnnouncements = async (search: string = "", page: number = 1) => {
  const response = await api.get("/announcements", {
    params: { search, page }
  });
  return response.data;
};

// Pour les employés - annonces qui les concernent
export const fetchMyAnnouncements = async (): Promise<Announcement[]> => {
  const response = await api.get("/me/announcements");
  return response.data;
};
// Optionnel: On s'assure que l'interface correspond bien à votre backend
export interface CreateAnnouncementData {
  title: string;
  message: string; // Vérifiez si votre backend attend 'message' ou 'content'
  department_id?: number | null;
  is_general?: boolean;
}

// Créer une annonce (Adapté pour correspondre à votre formulaire)
export const createAnnouncement = async (data: CreateAnnouncementData): Promise<Announcement> => {
  // Si department_id est null et qu'il n'y a pas d'is_general, on peut forcer is_general à true
  const payload = {
    ...data,
    is_general: data.department_id === null
  };
  const response = await api.post("/announcements", payload);
  return response.data;
};

// Modifier une annonce
export const updateAnnouncement = async (
  id: number,
  data: Partial<Announcement>
): Promise<Announcement> => {
  const response = await api.put(`/announcements/${id}`, data);
  return response.data;
};

// Supprimer une annonce
export const deleteAnnouncement = async (id: number): Promise<void> => {
  await api.delete(`/announcements/${id}`);
};

// Voir une annonce spécifique
export const getAnnouncement = async (id: number): Promise<Announcement> => {
  const response = await api.get(`/announcements/${id}`);
  return response.data;
};