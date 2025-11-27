// src/modules/managers/model.ts

export interface Manager {
  id: number;
  name: string;
  email: string;
  phone?: string;
  department_id?: number;
  created_at?: string;
  updated_at?: string;
}
