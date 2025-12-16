// src/modules/departments/service.ts
import { api } from "../../api/axios";
import type { Department, DepartmentForm } from "./model";

// Interface pour la réponse paginée
interface PaginatedResponse {
  data: Department[];
  meta: {
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    per_page?: number;
    total?: number;
  };
}

export const DepartmentService = {
  /**
   * Liste tous les départements (avec pagination)
   */
  async list(page = 1, search = ""): Promise<PaginatedResponse> {
    const res = await api.get("/departments", {
      params: { page, search }
    });
    console.log("✅ Départements chargés:", res.data);
    
    // Adapter la réponse selon le format de votre API
    return {
      data: res.data.data || res.data,
      meta: res.data.meta || {
        current_page: res.data.current_page || page,
        last_page: res.data.last_page || 1,
        prev_page_url: res.data.prev_page_url || null,
        next_page_url: res.data.next_page_url || null,
        per_page: res.data.per_page,
        total: res.data.total
      }
    };
  },

  /**
   * Récupère un département par ID
   */
  async get(id: number): Promise<Department> {
    const res = await api.get(`/departments/${id}`);
    console.log("✅ Département chargé:", res.data);
    return res.data.data || res.data;
  },

  /**
   * Crée un nouveau département
   */
  async create(data: DepartmentForm): Promise<Department> {
    const res = await api.post("/departments", data);
    console.log("✅ Département créé:", res.data);
    return res.data.data || res.data;
  },

  /**
   * Met à jour un département existant
   */
  async update(id: number, data: DepartmentForm): Promise<Department> {
    const res = await api.put(`/departments/${id}`, data);
    console.log("✅ Département mis à jour:", res.data);
    return res.data.data || res.data;
  },

  /**
   * Supprime un département
   */
  async remove(id: number): Promise<void> {
    await api.delete(`/departments/${id}`);
    console.log("✅ Département supprimé");
  }
};

// Exporter le type pour utilisation dans d'autres modules
export type { Department, DepartmentForm };