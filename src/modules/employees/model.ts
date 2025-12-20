export interface Employee {
    id: number;
    first_name: string;
    last_name: string | null;
    email: string;
    phone: string | null;
    contract_type: string | null;
    hire_date: string | null;
    salary_base: number | null;
    department_id: number | null;
    department?: { id: number; name: string };
    roles?: { id: number; name: string }[];
}

export interface EmployeeFormData {
    first_name: string;
    last_name: string | null;
    email: string;
    phone: string | null;
    contract_type: string | null;
    hire_date: string | null;
    salary_base?: number | null;
    department_id?: number | null;
    role_ids?: number[]; 
}