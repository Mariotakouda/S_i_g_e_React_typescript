import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";

export default function EmployeeList() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = () => {
        setLoading(true);
        api.get("/employees").then(res => {
            setEmployees(res.data.data || res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Supprimer cet employé ?")) {
            await api.delete(`/employees/${id}`);
            loadEmployees();
        }
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    return (
        <div className="container-fluid py-3 py-md-5 px-2 px-md-4 bg-light min-vh-100">
            {/* Header Section - Stacked on mobile, row on desktop */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
                <div>
                    <h2 className="fw-bold text-dark mb-1 h4 h2-md">Annuaire</h2>
                    <p className="text-muted small mb-0">Gestion de l'équipe</p>
                </div>
                <button 
                    onClick={() => navigate("/admin/employees/create")} 
                    className="btn btn-primary w-100 w-sm-auto d-flex align-items-center justify-content-center shadow-sm border-0 px-4 py-2"
                    style={{ borderRadius: '10px' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="me-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="fw-medium">Nouveau</span>
                </button>
            </div>

            {/* Table Card */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-3 py-3 text-muted small fw-bold" style={{ width: '60px' }}>Profil</th>
                                <th className="py-3 text-muted small fw-bold">Employé</th>
                                {/* Hidden on Mobile, Visible on Tablet (md) and up */}
                                <th className="py-3 text-muted small fw-bold d-none d-md-table-cell">Contact</th>
                                <th className="py-3 text-muted small fw-bold d-none d-sm-table-cell">Département</th>
                                <th className="py-3 text-muted small fw-bold text-end pe-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-5 text-muted">
                                        <div className="spinner-border spinner-border-sm text-primary" />
                                    </td>
                                </tr>
                            ) : (
                                employees.map(emp => (
                                    <tr key={emp.id}>
                                        <td className="ps-3">
                                            {emp.profile_photo_url ? (
                                                <img src={emp.profile_photo_url} className="rounded-circle border" style={{ width: '40px', height: '40px', objectFit: 'cover' }} alt="Avatar" />
                                            ) : (
                                                <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm"
                                                     style={{ width: '40px', height: '40px', fontSize: '12px', background: 'linear-gradient(45deg, #4e73df, #224abe)' }}>
                                                    {getInitials(emp.first_name, emp.last_name)}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '150px' }}>
                                                {emp.first_name} {emp.last_name}
                                            </div>
                                            {/* Visible only on small screens to replace the hidden email column */}
                                            <div className="d-md-none text-muted x-small" style={{ fontSize: '0.75rem' }}>{emp.email}</div>
                                        </td>
                                        <td className="d-none d-md-table-cell text-secondary small">
                                            {emp.email}
                                        </td>
                                        <td className="d-none d-sm-table-cell">
                                            <span className="badge rounded-pill bg-light text-primary border border-primary-subtle fw-medium">
                                                {emp.department?.name || "N/A"}
                                            </span>
                                        </td>
                                        <td className="text-end pe-3">
                                            <div className="d-flex justify-content-end gap-1 gap-md-2">
                                                <button onClick={() => navigate(`/admin/employees/${emp.id}`)} className="btn btn-sm btn-light border-0 p-2 text-primary shadow-xs">
                                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </button>
                                                <button onClick={() => navigate(`/admin/employees/${emp.id}/edit`)} className="btn btn-sm btn-light border-0 p-2 text-warning shadow-xs">
                                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button onClick={() => handleDelete(emp.id)} className="btn btn-sm btn-light border-0 p-2 text-danger shadow-xs">
                                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="mt-3 px-2 text-center text-md-start">
                <span className="text-muted small">Total: <strong>{employees.length}</strong> employés</span>
            </div>
        </div>
    );
}