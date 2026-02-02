import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";

// Composant Icone SVG
const Icon = ({ name }: { name: 'eye' | 'edit' | 'trash' | 'plus' | 'settings' }) => {
    const icons = {
        eye: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
        edit: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
        trash: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
        plus: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 4v16m8-8H4" /></svg>,
        settings: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
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

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await api.put(`/employees/${id}`, { status });
            loadEmployees();
        } catch (error) {
            alert("Erreur lors de la mise à jour du statut");
        }
    };

    const getStatusBadge = (status: string) => {
        const configs: Record<string, { label: string, color: string }> = {
            actif: { label: 'En poste', color: 'success' },
            demission: { label: 'Démission', color: 'warning' },
            renvoyer: { label: 'Renvoyé', color: 'danger' },
            retraite: { label: 'Retraité', color: 'info' }
        };
        const config = configs[status] || configs.actif;
        return (
            <span className={`badge rounded-pill border bg-${config.color} bg-opacity-10 text-${config.color} fw-normal px-2 py-1`} style={{ fontSize: '11px' }}>
                {config.label}
            </span>
        );
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    return (
        <div className="container-fluid py-4 py-md-5 px-3 px-md-5 bg-light min-vh-100">
            
            {/* HEADER */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                <div>
                    <h1 className="display-6 fw-bold text-dark mb-1">Employees</h1>
                    <p className="text-muted mb-0 fs-5">Gestion des collaborateurs ({employees.length})</p>
                </div>
                <button 
                    onClick={() => navigate("/admin/employees/create")} 
                    className="btn btn-primary shadow-sm px-4 py-3 rounded-4 d-flex align-items-center justify-content-center border-0"
                    style={{ backgroundColor: '#4e73df' }}
                >
                    <Icon name="plus" />
                    <span className="fw-bold ms-2">Nouvel employé</span>
                </button>
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
            ) : employees.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-4 shadow-sm text-muted fs-5">Aucun employé trouvé.</div>
            ) : (
                <>
                    {/* VUE MOBILE (Cartes) */}
                    <div className="d-md-none">
                        {employees.map(emp => (
                            <div key={emp.id} className="card border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-center mb-4">
                                        <div className="me-3">
                                            {emp.profile_photo_url ? (
                                                <img src={emp.profile_photo_url} className="rounded-circle border" style={{ width: '60px', height: '60px', objectFit: 'cover' }} alt="" />
                                            ) : (
                                                <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm"
                                                     style={{ width: '60px', height: '60px', background: 'linear-gradient(45deg, #4e73df, #224abe)' }}>
                                                    {getInitials(emp.first_name, emp.last_name)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h5 className="fw-bold text-dark mb-1">{emp.first_name} {emp.last_name}</h5>
                                            {getStatusBadge(emp.status)}
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button onClick={() => navigate(`/admin/employees/${emp.id}`)} className="btn btn-light flex-grow-1 border py-2"><Icon name="eye" /></button>
                                        <button onClick={() => navigate(`/admin/employees/${emp.id}/edit`)} className="btn btn-light border text-warning py-2"><Icon name="edit" /></button>
                                        <button onClick={() => handleDelete(emp.id)} className="btn btn-light border text-danger py-2"><Icon name="trash" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* VUE DESKTOP (Tableau) */}
                    <div className="card border-0 shadow-sm d-none d-md-block rounded-4 overflow-hidden bg-white">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light border-bottom">
                                    <tr>
                                        <th className="px-4 py-3 text-muted fw-bold" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Collaborateur</th>
                                        <th className="py-3 text-muted fw-bold" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Département</th>
                                        <th className="py-3 text-center text-muted fw-bold" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map(emp => (
                                        <tr key={emp.id}>
                                            <td className="px-4 py-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="me-3">
                                                        {emp.profile_photo_url ? (
                                                            <img src={emp.profile_photo_url} className="rounded-circle border" style={{ width: '45px', height: '45px', objectFit: 'cover' }} alt="" />
                                                        ) : (
                                                            <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm"
                                                                 style={{ width: '45px', height: '45px', fontSize: '12px', background: 'linear-gradient(45deg, #4e73df, #224abe)' }}>
                                                                {getInitials(emp.first_name, emp.last_name)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark">{emp.first_name} {emp.last_name}</div>
                                                        <div className="small text-muted">{emp.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <div className="mb-1">{getStatusBadge(emp.status)}</div>
                                                <span className="small text-muted">{emp.department?.name || "N/A"}</span>
                                            </td>
                                            <td className="py-3 text-center">
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button onClick={() => navigate(`/admin/employees/${emp.id}`)} className="btn btn-sm btn-outline-secondary border-0 p-2" title="Voir"><Icon name="eye" /></button>
                                                    <button onClick={() => navigate(`/admin/employees/${emp.id}/edit`)} className="btn btn-sm btn-outline-warning border-0 p-2" title="Modifier"><Icon name="edit" /></button>
                                                    
                                                    <div className="dropdown d-inline">
                                                        <button className="btn btn-sm btn-outline-secondary border-0 p-2" data-bs-toggle="dropdown"><Icon name="settings" /></button>
                                                        <ul className="dropdown-menu shadow border-0 rounded-4 p-2">
                                                            <li><button className="dropdown-item rounded-3" onClick={() => handleStatusUpdate(emp.id, 'actif')}>Actif</button></li>
                                                            <li><button className="dropdown-item rounded-3" onClick={() => handleStatusUpdate(emp.id, 'demission')}>Démission</button></li>
                                                            <li><button className="dropdown-item rounded-3" onClick={() => handleStatusUpdate(emp.id, 'renvoyer')}>Renvoyé</button></li>
                                                            <li><button className="dropdown-item rounded-3 text-info" onClick={() => handleStatusUpdate(emp.id, 'retraite')}>Retraite</button></li>
                                                        </ul>
                                                    </div>

                                                    <button onClick={() => handleDelete(emp.id)} className="btn btn-sm btn-outline-danger border-0 p-2" title="Supprimer"><Icon name="trash" /></button>
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