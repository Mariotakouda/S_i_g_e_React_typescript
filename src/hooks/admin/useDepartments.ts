import { useCrud } from "../useCrud";

export interface Department {
  id: number;
  name: string;
  description?: string;
  manager_id?: number;
}

export const useDepartments = () => useCrud<Department>("/departments");
