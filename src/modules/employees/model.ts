// src/modules/employees/model.ts

export interface Department {
  id: number;
  name: string;
  description?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface Employee {
  id: number;
  first_name: string;
  last_name: string | null | undefined; 
  email: string | undefined;
  phone?: string | null;

  contract_type?: string | null;
  hire_date?: string | null;
  salary_base?: number | null;

  department_id?: number | null;
  department?: Department;
  
  user_id?: number | null;
  roles?: Role[];

  created_at?: string;
  updated_at?: string;
}

export interface EmployeeFormData {
  first_name: string;
  last_name: string | null | undefined; 
  email: string | undefined;
  phone?: string | null;

  contract_type?: string | null;
  hire_date?: string | null;
  salary_base?: number | null;

  department_id?: number | null;
  role_ids?: number[];
}

export interface EmployeeSelect {
    id: number;
    first_name: string;
last_name: string | null | undefined; 
}