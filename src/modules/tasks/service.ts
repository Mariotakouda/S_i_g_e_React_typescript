// src/modules/tasks/service.ts

import { api } from "../../api/axios"; // ✅ Chemin correct vers votre instance axios
import type { Task, TaskForm } from "./model";

export const TaskService = {
  async list(page = 1, search = "") {
    console.log("📤 TaskService.list - Utilisation de l'API configurée");
    const res = await api.get("/tasks", {
      params: { page, search }
    });
    return res.data;
  },

  async get(id: number): Promise<Task> {
    console.log("📤 TaskService.get - Utilisation de l'API configurée");
    const res = await api.get(`/tasks/${id}`);
    return res.data;
  },

  async create(data: TaskForm) {
    console.log("📤 TaskService.create - Utilisation de l'API configurée");
    console.log("📤 URL de base:", (api.defaults as any).baseURL);
    const res = await api.post("/tasks", data);
    return res.data;
  },

  async update(id: number, data: TaskForm) {
    console.log("📤 TaskService.update - Utilisation de l'API configurée");
    const res = await api.put(`/tasks/${id}`, data);
    return res.data;
  },

  async remove(id: number) {
    console.log("📤 TaskService.remove - Utilisation de l'API configurée");
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
  },
};