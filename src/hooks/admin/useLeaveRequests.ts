import { useCrud } from "../useCrud";

export interface LeaveRequest {
  id: number;
  type: string;
  start_date: string;
  end_date: string;
  status: string;
  message?: string;
  employee_id: number;
}

export const useLeaveRequests = () => useCrud<LeaveRequest>("/leave-requests");
