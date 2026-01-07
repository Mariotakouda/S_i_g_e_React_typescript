import { api } from "../../api/axios";

export interface EmployeePresence {
  id: number;
  employee_id: number;
  date: string;
  check_in: string | null;
  check_out: string | null;
  total_hours: number | null;
  status: string;
  employee?: {
    id: number;
    first_name: string;
    last_name: string;
    profile_picture?: string;
  };
}

/**
 * NOUVEAU : Exporter les présences en CSV
 */
export async function exportPresences(): Promise<void> {
  try {
    const response = await api.get("/presences/export", { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `export_presences_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Erreur export:", error);
    throw error;
  }
}

export async function getAllPresences(filters?: { date?: string; month?: string }): Promise<any> {
  try {
    const response = await api.get("/presences", { params: filters });
    return response.data;
  } catch (error) { throw error; }
}

export async function getMyPresences(): Promise<EmployeePresence[]> {
  try {
    const response = await api.get("/me/presences");
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  } catch (error) { throw error; }
}

export async function hasActiveCheckIn(): Promise<{ active: boolean; presence?: EmployeePresence }> {
  try {
    const presences = await getMyPresences();
    const today = new Date().toISOString().split('T')[0];
    const active = presences.find(p => p.date === today && !p.check_out);
    return { active: !!active, presence: active };
  } catch (error) { return { active: false }; }
}

export async function checkIn(): Promise<EmployeePresence> {
  const response = await api.post("/presences/check-in");
  return response.data;
}

export async function checkOut(presenceId: number): Promise<EmployeePresence> {
  const response = await api.put(`/presences/${presenceId}/check-out`);
  return response.data;
}

export function getPresenceStats(presences: EmployeePresence[]) {
  const now = new Date();
  const monthly = presences.filter(p => {
    const d = new Date(p.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const total = monthly.reduce((sum, p) => sum + (Number(p.total_hours) || 0), 0);
  return {
    totalHours: total.toFixed(2),
    daysPresent: monthly.length,
    averageHours: (monthly.length > 0 ? total / monthly.length : 0).toFixed(2)
  };
}