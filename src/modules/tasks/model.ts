// src/modules/tasks/model.ts

export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: string; // pending | in_progress | completed
  employee_id?: number | null;
  employee?: Employee;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TaskForm {
  title: string;
  description?: string | null;
  status: string;
  employee_id?: number | null; // ✅ Accepte maintenant null
  due_date?: string | null;
}