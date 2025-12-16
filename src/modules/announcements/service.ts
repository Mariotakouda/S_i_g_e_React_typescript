// src/modules/announcements/service.ts

import { api } from "../../api/axios";
import type { Announcement, CreateAnnouncementForm } from "./model";

/**
 * Récupère la liste paginée des annonces (Admin)
 */
export async function fetchAnnouncements(search = "", page = 1) {
  const res = await api.get("/announcements", {
    params: { search, page }
  });
  return res.data;
}

/**
 * Récupère une annonce spécifique par son ID
 */
export async function getAnnouncement(id: number): Promise<Announcement> {
  const res = await api.get(`/announcements/${id}`);
  return res.data;
}

/**
 * Crée une nouvelle annonce
 */
export async function createAnnouncement(data: CreateAnnouncementForm): Promise<Announcement> {
  const res = await api.post("/announcements", data);
  return res.data;
}

/**
 * Met à jour une annonce existante
 */
export async function updateAnnouncement(
  id: number, 
  data: Partial<CreateAnnouncementForm>
): Promise<Announcement> {
  const res = await api.put(`/announcements/${id}`, data);
  return res.data;
}

/**
 * Supprime une annonce
 */
export async function deleteAnnouncement(id: number): Promise<void> {
  await api.delete(`/announcements/${id}`);
}

/**
 * Récupère les annonces visibles par l'employé connecté
 * (Générales + Département + Personnelles)
 */
export async function fetchMyAnnouncements(): Promise<Announcement[]> {
  const res = await api.get("/me/announcements");
  return res.data;
}