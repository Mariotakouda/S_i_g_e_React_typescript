import { useCrud } from "../useCrud";

export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  contract_type: string;
  hire_date: string;
  salary_base: number;
  department_id?: number;
  role_ids?: number[];
}

export const useEmployees = () => useCrud<Employee>("/employees");
