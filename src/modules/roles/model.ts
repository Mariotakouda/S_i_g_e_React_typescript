// src/modules/roles/model.ts

export interface Role {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface RoleForm {
  name: string;
}


