import { useCrud } from "../useCrud";

export interface Manager {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  employee_id: number;
  department_id?: number;
}

export const useManagers = () => useCrud<Manager>("/managers");
