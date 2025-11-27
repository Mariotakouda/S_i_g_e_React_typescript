// src/modules/tasks/model.ts

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: string; // pending | in_progress | completed
  assigned_to: number; // employee_id
  due_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TaskForm {
  title: string;
  description?: string;
  status: string;
  assigned_to: number;
  due_date?: string;
}
