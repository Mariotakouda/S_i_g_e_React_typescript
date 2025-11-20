import { useCrud } from "../useCrud";

export interface EmployeeRole {
  id: number;
  employee_id: number;
  role_id: number;
}

export const useEmployeeRoles = () => useCrud<EmployeeRole>("/employee-roles");
