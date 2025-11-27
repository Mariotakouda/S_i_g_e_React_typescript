// src/modules/tasks/service.ts

import axios from "axios";
import type { Task, TaskForm } from "./model";

export const TaskService = {
  async list(page = 1, search = "") {
    const res = await axios.get("/tasks", {
      params: { page, search }
    });
    return res.data;
  },

  async get(id: number): Promise<Task> {
    const res = await axios.get(`/tasks/${id}`);
    return res.data;
  },

  async create(data: TaskForm) {
    const res = await axios.post("/tasks", data);
    return res.data;
  },

  async update(id: number, data: TaskForm) {
    const res = await axios.put(`/tasks/${id}`, data);
    return res.data;
  },

  async remove(id: number) {
    const res = await axios.delete(`/tasks/${id}`);
    return res.data;
  },
};
