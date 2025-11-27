// src/modules/managers/service.ts

import type { Manager } from "./model";


const API_URL = "http://127.0.0.1:8000/api/managers";

export async function fetchManagers(search = "", page = 1) {
  const res = await fetch(`${API_URL}?search=${search}&page=${page}`);
  if (!res.ok) throw new Error("Erreur lors du chargement des managers");
  return res.json();
}

export async function getManager(id: number): Promise<Manager> {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Manager introuvable");
  return res.json();
}

export async function createManager(data: Partial<Manager>) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur lors de la création");
  return res.json();
}

export async function updateManager(id: number, data: Partial<Manager>) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur lors de la modification");
  return res.json();
}

export async function deleteManager(id: number) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Erreur lors de la suppression");
  return true;
}
