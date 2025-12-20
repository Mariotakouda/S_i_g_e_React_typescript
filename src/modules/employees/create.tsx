import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { type EmployeeFormData } from "./model";

export default function EmployeeCreate() {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);

    const [form, setForm] = useState<EmployeeFormData>({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        contract_type: "CDI",
        hire_date: "",
        salary_base: 0,
        department_id: undefined,
        role_ids: []
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    // Charger les départements et rôles pour les listes déroulantes
    useEffect(() => {
        api.get("/departments").then(res => setDepartments(res.data.data || res.data));
        api.get("/roles").then(res => setRoles(res.data.data || res.data));
    }, []);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!form.first_name.trim()) newErrors.first_name = "Le prénom est requis";
        if (!form.last_name?.trim()) newErrors.last_name = "Le nom est requis";
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
            await api.post("/employees", form);
            alert("Employé créé ! Un email avec le mot de passe temporaire a été envoyé.");
            navigate("/admin/employees");
        } catch (err: any) {
            if (err.response?.data?.errors) {
                setErrors(Object.fromEntries(
                    Object.entries(err.response.data.errors).map(([k, v]: any) => [k, v[0]])
                ));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Nouvel Employé</h2>
            
            <form onSubmit={handleSubmit}>
                <div style={rowStyle}>
                    <div style={colStyle}>
                        <label style={labelStyle}>Prénom *</label>
                        <input type="text" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} style={inputStyle(!!errors.first_name)} />
                        {errors.first_name && <small style={errorText}>{errors.first_name}</small>}
                    </div>
                    <div style={colStyle}>
                        <label style={labelStyle}>Nom *</label>
                        <input type="text" value={form.last_name || ""} onChange={e => setForm({...form, last_name: e.target.value})} style={inputStyle(!!errors.last_name)} />
                        {errors.last_name && <small style={errorText}>{errors.last_name}</small>}
                    </div>
                </div>

                <div style={rowStyle}>
                    <div style={colStyle}>
                        <label style={labelStyle}>Email (Identifiant) *</label>
                        <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={inputStyle(!!errors.email)} placeholder="exemple@entreprise.com" />
                        {errors.email && <small style={errorText}>{errors.email}</small>}
                    </div>
                    <div style={colStyle}>
                        <label style={labelStyle}>Téléphone</label>
                        <input type="text" value={form.phone || ""} onChange={e => setForm({...form, phone: e.target.value})} style={inputStyle(false)} />
                    </div>
                </div>

                <div style={rowStyle}>
                    <div style={colStyle}>
                        <label style={labelStyle}>Type de contrat *</label>
                        <select value={form.contract_type || "CDI"} onChange={e => setForm({...form, contract_type: e.target.value})} style={inputStyle(false)}>
                            <option value="CDI">CDI</option>
                            <option value="CDD">CDD</option>
                            <option value="Stage">Stage</option>
                            <option value="Freelance">Freelance</option>
                        </select>
                    </div>
                    <div style={colStyle}>
                        <label style={labelStyle}>Date d'embauche *</label>
                        <input type="date" value={form.hire_date || ""} onChange={e => setForm({...form, hire_date: e.target.value})} style={inputStyle(!!errors.hire_date)} />
                        {errors.hire_date && <small style={errorText}>{errors.hire_date}</small>}
                    </div>
                </div>

                <div style={rowStyle}>
                    <div style={colStyle}>
                        <label style={labelStyle}>Salaire de base *</label>
                        <input type="number" value={form.salary_base || ""} onChange={e => setForm({...form, salary_base: Number(e.target.value)})} style={inputStyle(!!errors.salary_base)} />
                        {errors.salary_base && <small style={errorText}>{errors.salary_base}</small>}
                    </div>
                    <div style={colStyle}>
                        <label style={labelStyle}>Département</label>
                        <select value={form.department_id || ""} onChange={e => setForm({...form, department_id: Number(e.target.value)})} style={inputStyle(false)}>
                            <option value="">Sélectionner un département</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>Rôles / Fonctions</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '5px' }}>
                        {roles.map(role => (
                            <label key={role.id} style={{ padding: '5px 10px', border: '1px solid #eee', borderRadius: '4px', cursor: 'pointer', background: form.role_ids?.includes(role.id) ? '#e0f2fe' : '#fff' }}>
                                <input 
                                    type="checkbox" 
                                    checked={form.role_ids?.includes(role.id)} 
                                    onChange={e => {
                                        const ids = form.role_ids || [];
                                        setForm({...form, role_ids: e.target.checked ? [...ids, role.id] : ids.filter(id => id !== role.id)});
                                    }} 
                                    style={{ marginRight: '5px' }}
                                />
                                {role.name}
                            </label>
                        ))}
                    </div>
                </div>

                <button type="submit" disabled={loading} style={btnStyle(loading)}>
                    {loading ? "Création et envoi de l'email..." : "Créer l'employé et envoyer l'invitation"}
                </button>
            </form>
        </div>
    );
}

// Styles Inline
const rowStyle = { display: 'flex', gap: '20px', marginBottom: '15px' };
const colStyle = { flex: 1, display: 'flex', flexDirection: 'column' as const };
const labelStyle = { fontWeight: 'bold', marginBottom: '5px', fontSize: '14px', color: '#374151' };
const inputStyle = (hasError: boolean) => ({
    padding: '10px',
    borderRadius: '4px',
    border: `1px solid ${hasError ? '#ef4444' : '#d1d5db'}`,
    outline: 'none',
    fontSize: '15px'
});
const errorText = { color: '#ef4444', fontSize: '12px', marginTop: '2px' };
const btnStyle = (loading: boolean) => ({
    width: '100%',
    padding: '12px',
    backgroundColor: loading ? '#9ca3af' : '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '10px',
    transition: 'background 0.2s'
});