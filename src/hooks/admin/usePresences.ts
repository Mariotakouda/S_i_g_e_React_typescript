import { useCrud } from "../useCrud";

export interface Presence {
  id: number;
  date?: string;
  check_in?: string;
  check_out?: string;
  total_hours?: number;
  employee_id: number;
}

export const usePresences = () => useCrud<Presence>("/presences");
