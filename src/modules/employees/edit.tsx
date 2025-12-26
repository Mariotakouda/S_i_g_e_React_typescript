import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { EmployeeService } from "./service";

export default function EmployeeEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [departments, setDepartments] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]); // Liste de tous les rôles
    const [loading, setLoading] = useState(true);
    
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        hire_date: "",
        salary_base: 0,
        contract_type: "CDI",
        department_id: 0,
        role_ids: [] as number[] // IDs des rôles sélectionnés
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
                role_ids: emp.roles ? emp.roles.map((r: any) => r.id) : []
            });
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await EmployeeService.update(Number(id), form);
            alert("Employé mis à jour !");
            navigate(`/admin/employees`);
        } catch (err) {
            alert("Erreur lors de la modification.");
        }
    };

    if (loading) return <p>Chargement...</p>;

    return (
        <div style={{ maxWidth: '900px', margin: '20px auto', background: '#fff', padding: '30px', borderRadius: '10px' }}>
            <h2>Modifier l'employé</h2>
            <form onSubmit={handleSubmit}>
                <div style={gridContainer}>
                    <div style={formGroup}>
                        <label>Prénom</label>
                        <input type="text" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} style={inputStyle} />
                    </div>
                    <div style={formGroup}>
                        <label>Nom</label>
                        <input type="text" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} style={inputStyle} />
                    </div>
                    <div style={formGroup}>
                        <label>Email</label>
                        <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={inputStyle} />
                    </div>
                    <div style={formGroup}>
                        <label>Téléphone</label>
                        <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={inputStyle} />
                    </div>
                    <div style={formGroup}>
                        <label>Département</label>
                        <select value={form.department_id} onChange={e => setForm({...form, department_id: Number(e.target.value)})} style={inputStyle}>
                            <option value="0">Aucun</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div style={formGroup}>
                        <label>Type de contrat</label>
                        <select value={form.contract_type} onChange={e => setForm({...form, contract_type: e.target.value})} style={inputStyle}>
                            <option value="CDI">CDI</option>
                            <option value="CDD">CDD</option>
                            <option value="Stage">Stage</option>
                        </select>
                    </div>
                </div>

                {/* SECTION DES RÔLES */}
                <div style={{ marginTop: '20px' }}>
                    <label style={{ fontWeight: 'bold' }}>Rôles assignés</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                        {roles.map(role => (
                            <label key={role.id} style={{ 
                                padding: '10px', border: '1px solid #ddd', borderRadius: '5px', cursor: 'pointer',
                                background: form.role_ids.includes(role.id) ? '#dbeafe' : '#fff'
                            }}>
                                <input 
                                    type="checkbox" 
                                    checked={form.role_ids.includes(role.id)}
                                    onChange={(e) => {
                                        const ids = e.target.checked 
                                            ? [...form.role_ids, role.id] 
                                            : form.role_ids.filter(rid => rid !== role.id);
                                        setForm({...form, role_ids: ids});
                                    }}
                                /> {role.name}
                            </label>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
                    <button type="submit" style={btnSave}>Mettre à jour l'employé</button>
                    <button type="button" onClick={() => navigate(-1)} style={btnCancel}>Annuler</button>
                </div>
            </form>
        </div>
    );
}

// Styles
const gridContainer = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const formGroup = { display: 'flex', flexDirection: 'column' as 'column', gap: '5px' };
const inputStyle = { padding: '10px', border: '1px solid #ddd', borderRadius: '5px' };
const btnSave = { backgroundColor: '#3b82f6', color: 'white', padding: '12px 25px', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const btnCancel = { backgroundColor: '#9ca3af', color: 'white', padding: '12px 25px', border: 'none', borderRadius: '5px', cursor: 'pointer' };