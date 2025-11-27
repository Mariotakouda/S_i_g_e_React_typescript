// src/modules/employees/service.ts
import { api } from "../../api/axios";
import {type Employee, type EmployeeFormData,  } from "./model";

export const EmployeeService = {
  async list(page = 1, search = "") {
    return api.get(`/employees`, {
      params: { page, search }
    });
  },

  // 💡 NOUVELLE FONCTION: Récupérer tous les employés pour le sélecteur
  async fetchAllForSelect(): Promise<Employee[]> {
    // Supposons que l'API /employees?all=true retourne la liste complète sans pagination
    const res = await api.get<{data: Employee[]}>('/employees', {
        params: { all: true, fields: 'id,first_name,last_name' } // Pour optimiser la requête
    });
    // L'API pourrait renvoyer la liste directement ou dans un champ 'data'
    return res.data.data || res.data as unknown as Employee[]; 
  },

  async get(id: number) {
    return api.get<Employee>(`/employees/${id}`);
  },

  async create(data: EmployeeFormData) {
    return api.post<Employee>(`/employees`, data);
  },

  async update(id: number, data: EmployeeFormData) {
    return api.put<Employee>(`/employees/${id}`, data);
  },

  async delete(id: number) {
    return api.delete(`/employees/${id}`);
  }
};
