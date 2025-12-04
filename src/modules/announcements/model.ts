// src/modules/announcements/model.ts

export interface Announcement {
  id: number;
  employee_id?: number | null;
  title: string;
  message: string;
  created_at?: string;
  updated_at?: string;
  employee?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}