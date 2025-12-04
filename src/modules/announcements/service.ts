// src/modules/announcements/service.ts

import { api } from "../../api/axios";
import type { Announcement } from "./model";

export async function fetchAnnouncements(search = "", page = 1) {
  const res = await api.get("/announcements", {
    params: { search, page }
  });
  return res.data;
}

export async function getAnnouncement(id: number): Promise<Announcement> {
  const res = await api.get(`/announcements/${id}`);
  return res.data;
}

export async function createAnnouncement(data: Partial<Announcement>) {
  const res = await api.post("/announcements", data);
  return res.data;
}

export async function updateAnnouncement(id: number, data: Partial<Announcement>) {
  const res = await api.put(`/announcements/${id}`, data);
  return res.data;
}

export async function deleteAnnouncement(id: number) {
  await api.delete(`/announcements/${id}`);
  return true;
}