// src/modules/announcements/service.ts

import type { Announcement } from "./model";


const API_URL = "http://127.0.0.1:8000/api/announcements";

export async function fetchAnnouncements(search = "", page = 1) {
  const res = await fetch(`${API_URL}?search=${search}&page=${page}`);
  if (!res.ok) throw new Error("Erreur lors du chargement des annonces");
  return res.json();
}

export async function getAnnouncement(id: number): Promise<Announcement> {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Annonce introuvable");
  return res.json();
}

export async function createAnnouncement(data: Partial<Announcement>) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur lors de la création");
  return res.json();
}

export async function updateAnnouncement(id: number, data: Partial<Announcement>) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur lors de la modification");
  return res.json();
}

export async function deleteAnnouncement(id: number) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erreur lors de la suppression");
  return true;
}
