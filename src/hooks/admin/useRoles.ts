import { useCrud } from "../useCrud";

export interface Role {
  id: number;
  name: string;
}

export const useRoles = () => useCrud<Role>("/roles");
