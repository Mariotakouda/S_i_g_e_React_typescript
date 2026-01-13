import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";

// Composant Icone pour la cohérence visuelle
const Icon = ({ name }: { name: 'eye' | 'edit' | 'trash' | 'plus' }) => {
    const icons = {
        eye: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
        edit: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
        trash: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
        plus: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 4v16m8-8H4" /></svg>
    };
    return icons[name];
};

export default function EmployeeList() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => { loadEmployees(); }, []);

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
        <div className="container-fluid py-4 py-md-5 px-3 px-md-5 bg-light min-vh-100">
            
            {/* HEADER SECTION */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                <div>
                    <h1 className="display-6 fw-bold text-dark mb-1">Équipe</h1>
                    <p className="text-muted mb-0 fs-5">Gestion des collaborateurs ({employees.length})</p>
                </div>
                <button 
                    onClick={() => navigate("/admin/employees/create")} 
                    className="btn btn-primary shadow px-4 py-3 rounded-4 d-flex align-items-center justify-content-center"
                >
                    <Icon name="plus" />
                    <span className="fw-bold ms-2 fs-5">Ajouter un employé</span>
                </button>
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div></div>
            ) : employees.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-5 shadow-sm text-muted fs-4">Aucun employé trouvé.</div>
            ) : (
                <>
                    {/* VUE MOBILE (Cartes) - Visible uniquement sur petit écran */}
                    <div className="d-md-none">
                        {employees.map(emp => (
                            <div key={emp.id} className="card border-0 shadow-sm mb-4 rounded-5 overflow-hidden">
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-center mb-4">
                                        <div className="me-3">
                                            {emp.profile_photo_url ? (
                                                <img src={emp.profile_photo_url} className="rounded-circle border" style={{ width: '65px', height: '65px', objectFit: 'cover' }} alt="" />
                                            ) : (
                                                <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm"
                                                     style={{ width: '65px', height: '65px', fontSize: '20px', background: 'linear-gradient(45deg, #4e73df, #224abe)' }}>
                                                    {getInitials(emp.first_name, emp.last_name)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '20px' }}>{emp.first_name} {emp.last_name}</h2>
                                            <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2" style={{ fontSize: '13px' }}>
                                                {emp.department?.name || "Sans département"}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <div className="text-muted small text-uppercase fw-bold mb-1">Contact</div>
                                        <div className="fs-6 text-dark">{emp.email}</div>
                                    </div>

                                    <div className="d-flex gap-3">
                                        <button onClick={() => navigate(`/admin/employees/${emp.id}`)} className="btn btn-light flex-grow-1 py-3 rounded-4 border shadow-sm">
                                            <Icon name="eye" />
                                        </button>
                                        <button onClick={() => navigate(`/admin/employees/${emp.id}/edit`)} className="btn btn-light px-4 rounded-4 border shadow-sm text-warning">
                                            <Icon name="edit" />
                                        </button>
                                        <button onClick={() => handleDelete(emp.id)} className="btn btn-light px-4 rounded-4 border shadow-sm text-danger">
                                            <Icon name="trash" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* VUE DESKTOP (Tableau) - Masqué sur mobile */}
                    <div className="card border-0 shadow-sm d-none d-md-block rounded-5 overflow-hidden bg-white">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light border-bottom">
                                    <tr style={{ fontSize: '13px', textTransform: 'uppercase', color: '#666', letterSpacing: '1px' }}>
                                        <th className="px-5 py-4">Collaborateur</th>
                                        <th className="py-4">Contact</th>
                                        <th className="py-4">Département</th>
                                        <th className="py-4 text-center px-5">Actions</th>
                                    </tr>
                                </thead>
                                <tbody style={{ fontSize: '17px' }}>
                                    {employees.map(emp => (
                                        <tr key={emp.id}>
                                            <td className="px-5 py-5">
                                                <div className="d-flex align-items-center">
                                                    {emp.profile_photo_url ? (
                                                        <img src={emp.profile_photo_url} className="rounded-circle border me-3" style={{ width: '55px', height: '55px', objectFit: 'cover' }} alt="" />
                                                    ) : (
                                                        <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm me-3"
                                                             style={{ width: '55px', height: '55px', fontSize: '16px', background: 'linear-gradient(45deg, #4e73df, #224abe)' }}>
                                                            {getInitials(emp.first_name, emp.last_name)}
                                                        </div>
                                                    )}
                                                    <div className="fw-bold text-dark">{emp.first_name} {emp.last_name}</div>
                                                </div>
                                            </td>
                                            <td className="py-5 text-muted">{emp.email}</td>
                                            <td className="py-5">
                                                <span className="fw-bold px-4 py-2 bg-light rounded-pill text-primary border" style={{ fontSize: '14px' }}>
                                                    {emp.department?.name || "N/A"}
                                                </span>
                                            </td>
                                            <td className="text-center px-5">
                                                <div className="d-inline-flex gap-3">
                                                    <button onClick={() => navigate(`/admin/employees/${emp.id}`)} className="btn btn-outline-primary rounded-4 p-3 shadow-sm" title="Voir"><Icon name="eye" /></button>
                                                    <button onClick={() => navigate(`/admin/employees/${emp.id}/edit`)} className="btn btn-outline-warning rounded-4 p-3 shadow-sm" title="Modifier"><Icon name="edit" /></button>
                                                    <button onClick={() => handleDelete(emp.id)} className="btn btn-outline-danger rounded-4 p-3 shadow-sm" title="Supprimer"><Icon name="trash" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}