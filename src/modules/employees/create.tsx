import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { type EmployeeFormData } from "./model";
import { toast } from "react-hot-toast";

// --- Squelette spécifique pour la création ---
const CreateSkeleton = () => (
    <div className="container py-4 py-md-5">
        <div className="skeleton mb-4" style={{ width: '250px', height: '35px', borderRadius: '8px' }}></div>
        <div className="row g-4">
            <div className="col-12 col-lg-8">
                <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '15px' }}>
                    <div className="skeleton mb-4" style={{ width: '40%', height: '24px' }}></div>
                    <div className="row g-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="col-md-6">
                                <div className="skeleton mb-2" style={{ width: '30%', height: '15px' }}></div>
                                <div className="skeleton" style={{ width: '100%', height: '40px', borderRadius: '8px' }}></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="col-12 col-lg-4">
                <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '15px' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="mb-3">
                            <div className="skeleton mb-2" style={{ width: '50%', height: '15px' }}></div>
                            <div className="skeleton" style={{ width: '100%', height: '40px' }}></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export default function EmployeeCreate() {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [initialLoading, setInitialLoading] = useState(true); // Pour le skeleton
    const [loading, setLoading] = useState(false); // Pour le bouton submit
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        contract_type: "CDI",
        hire_date: "",
        salary_base: 0,
        department_id: "" as string | number,
        role_ids: [] as number[],
        status: "actif"
    });

    useEffect(() => {
        setInitialLoading(true);
        Promise.all([
            api.get("/departments").then(res => res.data.data || res.data),
            api.get("/roles").then(res => res.data.data || res.data)
        ])
        .then(([deps, rolesList]) => {
            setDepartments(deps);
            setRoles(rolesList);
        })
        .finally(() => setInitialLoading(false));
    }, []);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!form.first_name.trim()) newErrors.first_name = "Le prénom est requis";
        if (!form.last_name.trim()) newErrors.last_name = "Le nom est requis";
        if (!form.email.trim()) {
            newErrors.email = "L'email est requis";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = "Format d'email invalide";
        }
        if (!form.hire_date) newErrors.hire_date = "La date d'embauche est requise";
        if (!form.salary_base || form.salary_base <= 0) newErrors.salary_base = "Le salaire doit être supérieur à 0";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const payload: EmployeeFormData = {
                ...form,
                department_id: form.department_id === "" ? undefined : Number(form.department_id)
            };

            await api.post("/employees", payload);
            toast.success(`Le recrutement de ${form.first_name} a été finalisé !`);
            navigate("/admin/employees");
        } catch (err: any) {
            if (err.response?.data?.errors) {
                setErrors(Object.fromEntries(
                    Object.entries(err.response.data.errors).map(([k, v]: any) => [k, v[0]])
                ));
            }
            toast.error("Une erreur est survenue lors du recrutement.");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return (
        <>
            <style>{`
                .skeleton {
                    background: linear-gradient(90deg, #f2f2f2 25%, #fafafa 50%, #f2f2f2 75%);
                    background-size: 200% 100%;
                    animation: skeleton-loading 1.5s infinite;
                }
                @keyframes skeleton-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
            `}</style>
            <CreateSkeleton />
        </>
    );

    return (
        <div className="container py-4 py-md-5">
            <div className="d-flex align-items-center mb-4">
                <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm me-3 border-0 shadow-sm rounded-3">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <h2 className="fw-bold text-dark mb-0 h3">Recruter un employé</h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="row g-4">
                    <div className="col-12 col-lg-8">
                        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '15px' }}>
                            <h5 className="mb-4 d-flex align-items-center fw-bold text-dark">
                                <span className="bg-primary bg-opacity-10 p-2 rounded-3 me-2">
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#0d6efd" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </span>
                                État civil & Contact
                            </h5>
                            
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Prénom *</label>
                                    <input type="text" className={`form-control border-light-subtle shadow-none ${errors.first_name ? 'is-invalid' : ''}`}
                                        value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} />
                                    {errors.first_name && <div className="invalid-feedback">{errors.first_name}</div>}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Nom *</label>
                                    <input type="text" className={`form-control border-light-subtle shadow-none ${errors.last_name ? 'is-invalid' : ''}`}
                                        value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} />
                                    {errors.last_name && <div className="invalid-feedback">{errors.last_name}</div>}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Email *</label>
                                    <input type="email" className={`form-control border-light-subtle shadow-none ${errors.email ? 'is-invalid' : ''}`}
                                        value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Téléphone</label>
                                    <input type="text" className="form-control border-light-subtle shadow-none"
                                        value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                                </div>
                            </div>

                            <hr className="my-4 opacity-25" />

                            <h5 className="mb-4 d-flex align-items-center fw-bold text-dark">
                                <span className="bg-info bg-opacity-10 p-2 rounded-3 me-2">
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#0dcaf0" strokeWidth="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                </span>
                                Rôles attribués
                            </h5>
                            <div className="d-flex flex-wrap gap-2">
                                {roles.map(role => (
                                    <label key={role.id} className={`btn btn-sm px-3 py-2 rounded-pill border transition-all ${form.role_ids?.includes(role.id) ? 'btn-primary shadow-sm border-primary' : 'btn-outline-light text-dark border-light-subtle'}`} style={{ cursor: 'pointer' }}>
                                        <input type="checkbox" className="d-none" checked={form.role_ids?.includes(role.id)} 
                                            onChange={e => {
                                                const ids = form.role_ids || [];
                                                setForm({...form, role_ids: e.target.checked ? [...ids, role.id] : ids.filter(id => id !== role.id)});
                                            }} />
                                        {role.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-lg-4">
                        <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '15px' }}>
                            <h5 className="mb-4 fw-bold text-dark">Poste & Contrat</h5>
                            
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">Département</label>
                                <select className="form-select border-light-subtle shadow-none" value={form.department_id} 
                                    onChange={e => setForm({...form, department_id: e.target.value})}>
                                    <option value="">Non assigné</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">Type de contrat *</label>
                                <select className="form-select border-light-subtle shadow-none" value={form.contract_type} onChange={e => setForm({...form, contract_type: e.target.value})}>
                                    <option value="CDI">CDI</option>
                                    <option value="CDD">CDD</option>
                                    <option value="Stage">Stage</option>
                                    <option value="Freelance">Freelance</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">Date d'embauche *</label>
                                <input type="date" className={`form-control border-light-subtle shadow-none ${errors.hire_date ? 'is-invalid' : ''}`}
                                    value={form.hire_date} onChange={e => setForm({...form, hire_date: e.target.value})} />
                                {errors.hire_date && <div className="invalid-feedback">{errors.hire_date}</div>}
                            </div>

                            <div className="mb-0">
                                <label className="form-label small fw-bold text-muted">Salaire de base *</label>
                                <div className="input-group has-validation">
                                    <input type="number" className={`form-control border-light-subtle shadow-none ${errors.salary_base ? 'is-invalid' : ''}`}
                                        value={form.salary_base || ""} onChange={e => setForm({...form, salary_base: Number(e.target.value)})} />
                                    <span className="input-group-text bg-light border-light-subtle small text-muted">XOF</span>
                                    {errors.salary_base && <div className="invalid-feedback">{errors.salary_base}</div>}
                                </div>
                            </div>
                        </div>

                        <div className="d-grid gap-2">
                            <button type="submit" disabled={loading} className="btn btn-primary btn-lg py-3 fw-bold shadow-sm rounded-4">
                                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : "Finaliser le recrutement"}
                            </button>
                            <button type="button" onClick={() => navigate(-1)} className="btn btn-light btn-lg py-3 fw-bold text-muted rounded-4 border-0">
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}