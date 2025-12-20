import { api } from "../../api/axios";
import { type Employee, type EmployeeFormData } from "./model";

export const EmployeeService = {
    async list(page = 1, search = "") {
        return api.get<{ data: Employee[], last_page: number }>(`/employees`, {
            params: { page, search }
        });
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
    },

    async fetchAllForSelect(): Promise<Employee[]> {
        const res = await api.get('/employees', { params: { all: true } });
        return res.data.data || res.data;
    }
};