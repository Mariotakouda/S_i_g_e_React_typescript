import { useCrud } from "../useCrud";

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  due_date?: string;
  employee_id: number;
}

export const useTasks = () => useCrud<Task>("/tasks");
