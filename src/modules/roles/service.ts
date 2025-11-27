// src/modules/roles/service.ts

import { api } from "../../api/axios"; // Supposons que votre instance axios soit ici
import type { Role, RoleForm } from "./model";

export const RoleService = {
  async list(page = 1, search = "") {
    const res = await api.get("/roles", { // CHANGEMENT: Utilisation de 'api' au lieu de 'axios'
      params: { page, search }
    });
    return res.data;
  },

  async get(id: number): Promise<Role> {
    const res = await api.get(`/roles/${id}`); // CHANGEMENT: Utilisation de 'api'
    return res.data;
  },

  async create(data: RoleForm) {
    const res = await api.post("/roles", data); // CHANGEMENT: Utilisation de 'api'
    return res.data;
  },

  async update(id: number, data: RoleForm) {
    const res = await api.put(`/roles/${id}`, data); // CHANGEMENT: Utilisation de 'api'
    return res.data;
  },

  async remove(id: number) {
    const res = await api.delete(`/roles/${id}`); // CHANGEMENT: Utilisation de 'api'
    return res.data;    
    },
};