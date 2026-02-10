import { api } from "../../api/axios";
import type { Department, DepartmentForm } from "./model";

interface PaginatedResponse {
  data: Department[];
  meta: {
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    total?: number;
  };
}

export const DepartmentService = {
  async list(page = 1, search = ""): Promise<PaginatedResponse> {
    const res = await api.get("/departments", {
      params: { page, search }
    });
    
    // Laravel paginé place les données dans res.data.data
    const raw = res.data;

    return {
      data: raw.data || [],
      meta: {
        current_page: raw.current_page || 1,
        last_page: raw.last_page || 1,
        prev_page_url: raw.prev_page_url,
        next_page_url: raw.next_page_url,
        total: raw.total
      }
    };
  },

  async get(id: number): Promise<Department> {
    const res = await api.get(`/departments/${id}`);
    return res.data.data || res.data;
  },

  async create(data: DepartmentForm): Promise<Department> {
    const res = await api.post("/departments", data);
    return res.data.data || res.data;
  },

  async update(id: number, data: DepartmentForm): Promise<Department> {
    const res = await api.put(`/departments/${id}`, data);
    return res.data.data || res.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/departments/${id}`);
  }
};