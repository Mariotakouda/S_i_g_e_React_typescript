/**
 * Interface pour les informations basiques d'un employé
 * (utilisée dans les relations)
 */
export interface EmployeeNameOnly {
    id: number;
    first_name: string;
    last_name?: string | null;
}

/**
 * Interface principale pour une demande de congé
 */
export interface LeaveRequest {
    id: number;
    employee_id: number;
    type: 'vacances' | 'maladie' | 'impayé' | 'autres';
    start_date: string;
    end_date: string;
    status: 'pending' | 'approved' | 'rejected';
    message?: string | null | undefined;
    
    // Relation avec l'employé (chargée via eager loading)
    employee?: EmployeeNameOnly;
    
    // Timestamps
    created_at?: string; // 👈 Ceci cause l'erreur car il peut être undefined
    updated_at?: string;
}

/**
 * Type pour la création d'une demande de congé
 * (exclut les champs auto-générés)
 */
export interface CreateLeaveRequest {
  employee_id: number;
  type: string;
  start_date: string;
  end_date: string;
  message?: string | null | undefined;
}

/**
 * Type pour la mise à jour d'une demande
 * (tous les champs sont optionnels)
 */
export interface UpdateLeaveRequest {
  employee_id?: number;
  type?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  message?: string | null | undefined;
}

/**
 * Interface pour la réponse paginée de l'API
 */
export interface LeaveRequestPaginatedResponse {
  data: LeaveRequest[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

/**
 * Interface pour les statistiques des congés
 */
export interface LeaveStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  by_type: Array<{
    type: string;
    count: number;
  }>;
}

/**
 * Type pour les filtres de recherche
 */
export interface LeaveRequestFilters {
  search?: string;
  status?: 'pending' | 'approved' | 'rejected';
  employee_id?: number;
  page?: number;
}