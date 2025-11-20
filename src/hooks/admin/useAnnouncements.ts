import { useCrud } from "../useCrud";

export interface Announcement {
  id: number;
  title: string;
  message: string;
  employee_id?: number;
}

export const useAnnouncements = () => useCrud<Announcement>("/announcements");
