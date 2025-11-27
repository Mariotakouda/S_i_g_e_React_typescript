// src/modules/leave_requests/model.ts (Mise à jour)

export interface EmployeeNameOnly {
  id: number;
  first_name: string;
  last_name?: string | null;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  type: string;
  start_date: string;
  end_date: string;
  status: string;
  message?: string;
  
  // 💡 NOUVEAU: Pour afficher le nom
  employee?: EmployeeNameOnly; 
  // Ou si votre backend le met à plat :
  // employee_first_name?: string;
  // employee_last_name?: string | null;

  created_at?: string;
  updated_at?: string;
}