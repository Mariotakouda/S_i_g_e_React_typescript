import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { EmployeeService } from "./service";
import { toast } from "react-hot-toast";

export default function EmployeeEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [departments, setDepartments] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        hire_date: "",
        salary_base: 0,
        contract_type: "CDI",
        department_id: 0,
        role_ids: [] as number[],
        status: "actif" // Ajouté ici
    });

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get("/departments").then(res => res.data.data || res.data),
            api.get("/roles").then(res => res.data.data || res.data),
            EmployeeService.get(Number(id))
        ]).then(([deps, rolesList, empRes]) => {
            setDepartments(deps);
            setRoles(rolesList);
            
            const emp = empRes.data;
            setForm({
                first_name: emp.first_name || "",
                last_name: emp.last_name || "",
                email: emp.email || "",
                phone: emp.phone || "",
                hire_date: emp.hire_date || "",
                salary_base: Number(emp.salary_base) || 0,
                contract_type: emp.contract_type || "CDI",
                department_id: emp.department_id || 0,
                role_ids: emp.roles ? emp.roles.map((r: any) => r.id) : [],
                status: emp.status || "actif" // Chargé ici
            });
        })
        .catch(() => toast.error("Erreur de chargement"))
        .finally(() => setLoading(false));
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await EmployeeService.update(Number(id), form);
            toast.success("Profil mis à jour avec succès");
            navigate(`/admin/employees`);
        } catch (err) {
            toast.error("Erreur lors de la modification.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="spinner-border text-primary"></div>
        </div>
    );

    return (
        <div className="container py-4 py-md-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center">
                    <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm me-3 border-0 shadow-sm">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <h2 className="fw-bold text-dark mb-0 h4">Modifier le Profil</h2>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="row g-4">
                    <div className="col-12 col-lg-8">
                        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '15px' }}>
                            <h5 className="mb-4 d-flex align-items-center fw-bold">
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="me-2 text-primary"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                Identité & Contact
                            </h5>
                            
                            <div className="row g-3">
                                <div className="col-md-6"><label className="form-label small fw-bold text-muted">Prénom</label><input type="text" className="form-control border-light-subtle" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} required /></div>
                                <div className="col-md-6"><label className="form-label small fw-bold text-muted">Nom</label><input type="text" className="form-control border-light-subtle" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} required /></div>
                                <div className="col-md-6"><label className="form-label small fw-bold text-muted">Email</label><input type="email" className="form-control border-light-subtle" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
                                <div className="col-md-6"><label className="form-label small fw-bold text-muted">Téléphone</label><input type="text" className="form-control border-light-subtle" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                            </div>

                            <hr className="my-4 opacity-25" />

                            <h5 className="mb-4 d-flex align-items-center fw-bold text-primary">Rôles & Accès</h5>
                            <div className="d-flex flex-wrap gap-2">
                                {roles.map(role => (
                                    <label key={role.id} className={`btn btn-sm px-3 py-2 rounded-pill border ${form.role_ids.includes(role.id) ? 'btn-primary shadow-sm' : 'btn-outline-light text-dark'}`}>
                                        <input type="checkbox" className="d-none" checked={form.role_ids.includes(role.id)}
                                            onChange={e => {
                                                const ids = e.target.checked ? [...form.role_ids, role.id] : form.role_ids.filter(rid => rid !== role.id);
                                                setForm({...form, role_ids: ids});
                                            }} />
                                        {role.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-lg-4">
                        <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '15px' }}>
                            <h5 className="mb-4 fw-bold text-dark">Détails de l'emploi</h5>
                            
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">Statut</label>
                                <select className="form-select border-light-subtle" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                                    <option value="actif">En poste</option>
                                    <option value="demission">Démission</option>
                                    <option value="renvoyer">Renvoyé</option>
                                    <option value="retraite">Retraité</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">Département</label>
                                <select className="form-select border-light-subtle" value={form.department_id} onChange={e => setForm({...form, department_id: Number(e.target.value)})}>
                                    <option value="0">Aucun</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">Type de contrat</label>
                                <select className="form-select border-light-subtle" value={form.contract_type} onChange={e => setForm({...form, contract_type: e.target.value})}>
                                    <option value="CDI">CDI</option>
                                    <option value="CDD">CDD</option>
                                    <option value="Stage">Stage</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">Salaire (XOF)</label>
                                <input type="number" className="form-control border-light-subtle" value={form.salary_base} onChange={e => setForm({...form, salary_base: Number(e.target.value)})} />
                            </div>
                        </div>

                        <div className="d-grid gap-2">
                            <button type="submit" disabled={submitting} className="btn btn-primary py-3 fw-bold rounded-4 shadow-sm">
                                {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : "Enregistrer les modifications"}
                            </button>
                            <button type="button" onClick={() => navigate(-1)} className="btn btn-light py-3 fw-semibold text-muted rounded-4">
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}