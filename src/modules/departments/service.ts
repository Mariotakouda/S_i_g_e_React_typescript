// src/modules/departments/service.ts
import { api } from "../../api/axios";
import type { Department, DepartmentForm } from "./model";

export const DepartmentService = {
  async list(page = 1, search = "") {
    const res = await api.get("/departments", {
      params: { page, search }
    });
    console.log("✅ Départements chargés:", res.data);
    return res.data;
  },

  async get(id: number): Promise<Department> {
    const res = await api.get(`/departments/${id}`);
    console.log("✅ Département chargé:", res.data);
    return res.data.data || res.data;
  },

  async create(data: DepartmentForm) {
    const res = await api.post("/departments", data);
    console.log("✅ Département créé:", res.data);
    return res.data;
  },

  async update(id: number, data: DepartmentForm) {
    const res = await api.put(`/departments/${id}`, data);
    console.log("✅ Département mis à jour:", res.data);
    return res.data;
  },

  async remove(id: number) {
    const res = await api.delete(`/departments/${id}`);
    console.log("✅ Département supprimé");
    return res.data;
  },
};