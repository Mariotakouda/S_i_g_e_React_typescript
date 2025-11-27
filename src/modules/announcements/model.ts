// src/modules/announcements/model.ts

export interface Announcement {
  id: number;
  employee_id?: number;
  title: string;
  message: string;
  created_at?: string;
  updated_at?: string;
}
