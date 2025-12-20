import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { EmployeeService } from "./service";
import { DepartmentService } from "../departments/service"; 

export default function EmployeeEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // 🎯 Types harmonisés : department_id est un number pour correspondre à l'interface
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        hire_date: "",
        salary_base: 0,
        contract_type: "CDI",
        department_id: 0 
    });

    useEffect(() => {
        setLoading(true);
        // 🎯 Correction : Utilisation de list() et gestion de la pagination
        Promise.all([
            DepartmentService.list().then(res => {
                // On extrait les données du tableau paginé si nécessaire
                const rawData = (res as any).data?.data || (res as any).data || res;
            setDepartments(Array.isArray(rawData) ? rawData : []);
            }),
            EmployeeService.get(Number(id))
        ]).then(([_, empRes]) => {
            const emp = empRes.data;
            setForm({
                first_name: emp.first_name || "",
                last_name: emp.last_name || "",
                email: emp.email || "",
                phone: emp.phone || "",
                hire_date: emp.hire_date || "",
                salary_base: Number(emp.salary_base) || 0,
                contract_type: emp.contract_type || "CDI",
                department_id: Number(emp.department_id) || 0 // Conversion en number
            });
        })
        .catch(err => console.error("Erreur de chargement:", err))
        .finally(() => setLoading(false));
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Le formulaire contient maintenant les bons types (numbers)
            await EmployeeService.update(Number(id), form);
            alert("Employé mis à jour avec succès !");
            navigate(`/admin/employees/show/${id}`);
        } catch (err) {
            console.error("Erreur lors de la mise à jour", err);
            alert("Erreur lors de la modification.");
        }
    };

    if (loading) return <p style={{ textAlign: 'center', padding: '20px' }}>Chargement...</p>;

    return (
        <div style={containerStyle}>
            <h2 style={{ marginBottom: '20px' }}>Modifier l'employé</h2>
            
            <form onSubmit={handleSubmit} style={gridForm}>
                <div style={formGroup}>
                    <label style={labelStyle}>Prénom</label>
                    <input type="text" style={inputStyle} value={form.first_name} 
                        onChange={e => setForm({...form, first_name: e.target.value})} required />
                </div>
                <div style={formGroup}>
                    <label style={labelStyle}>Nom</label>
                    <input type="text" style={inputStyle} value={form.last_name} 
                        onChange={e => setForm({...form, last_name: e.target.value})} required />
                </div>

                <div style={formGroup}>
                    <label style={labelStyle}>Email</label>
                    <input type="email" style={inputStyle} value={form.email} 
                        onChange={e => setForm({...form, email: e.target.value})} required />
                </div>
                <div style={formGroup}>
                    <label style={labelStyle}>Téléphone</label>
                    <input type="text" style={inputStyle} value={form.phone} 
                        onChange={e => setForm({...form, phone: e.target.value})} />
                </div>

                <div style={formGroup}>
                    <label style={labelStyle}>Date d'embauche</label>
                    <input type="date" style={inputStyle} value={form.hire_date} 
                        onChange={e => setForm({...form, hire_date: e.target.value})} required />
                </div>
                <div style={formGroup}>
                    <label style={labelStyle}>Salaire de base (XOF)</label>
                    <input type="number" style={inputStyle} value={form.salary_base} 
                        onChange={e => setForm({...form, salary_base: Number(e.target.value)})} />
                </div>

                <div style={formGroup}>
                    <label style={labelStyle}>Type de contrat</label>
                    <select style={inputStyle} value={form.contract_type} 
                        onChange={e => setForm({...form, contract_type: e.target.value})}>
                        <option value="CDI">CDI</option>
                        <option value="CDD">CDD</option>
                        <option value="STAGE">Stage</option>
                        <option value="PRESTATAIRE">Prestataire</option>
                    </select>
                </div>
                <div style={formGroup}>
                    <label style={labelStyle}>Département</label>
                    <select 
                        style={inputStyle} 
                        value={form.department_id} 
                        // 🎯 Correction : Conversion explicite en Number pour le select
                        onChange={e => setForm({...form, department_id: Number(e.target.value)})} 
                        required
                    >
                        <option value="0">Sélectionner un département</option>
                        {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ gridColumn: 'span 2', marginTop: '20px' }}>
                    <button type="submit" style={btnUpdateStyle}>Mettre à jour l'employé</button>
                    <button type="button" onClick={() => navigate(-1)} style={btnCancelStyle}>Annuler</button>
                </div>
            </form>
        </div>
    );
}

// --- Styles conservés ---
const containerStyle = { maxWidth: '800px', margin: '20px auto', padding: '30px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };
const gridForm = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const formGroup = { display: 'flex' as const, flexDirection: 'column' as const };
const labelStyle = { fontSize: '14px', fontWeight: '600' as const, marginBottom: '5px', color: '#374151' };
const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '15px' };
const btnUpdateStyle = { padding: '12px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' as const, marginRight: '10px' };
const btnCancelStyle = { padding: '12px 24px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' as const };