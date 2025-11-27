// src/modules/presences/service.ts

import type { Presence } from "./model";


const API_URL = "http://127.0.0.1:8000/api/presences";

export async function fetchPresences(search = "", page = 1) {
  const res = await fetch(`${API_URL}?search=${search}&page=${page}`);
  if (!res.ok) throw new Error("Erreur lors du chargement des présences");
  return res.json();
}

export async function getPresence(id: number): Promise<Presence> {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Présence introuvable");
  return res.json();
}

export async function createPresence(data: Partial<Presence>) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur lors de la création");
  return res.json();
}

export async function updatePresence(id: number, data: Partial<Presence>) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur lors de la modification");
  return res.json();
}

export async function deletePresence(id: number) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erreur lors de la suppression");
  return true;
}
