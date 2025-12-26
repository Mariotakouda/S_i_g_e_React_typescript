import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";

export default function EmployeeList() {
    const [employees, setEmployees] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = () => {
        api.get("/employees").then(res => {
            setEmployees(res.data.data || res.data);
        });
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Supprimer cet employé ?")) {
            await api.delete(`/employees/${id}`);
            loadEmployees();
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2>Employés</h2>
                <button onClick={() => navigate("/admin/employees/create")} style={btnPrimary}>+ Nouveau</button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
                <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                        <th style={thStyle}>Nom</th>
                        <th style={thStyle}>Email</th>
                        <th style={thStyle}>Département</th>
                        <th style={thStyle}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map(emp => (
                        <tr key={emp.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={tdStyle}>{emp.first_name} {emp.last_name}</td>
                            <td style={tdStyle}>{emp.email}</td>
                            <td style={tdStyle}>{emp.department?.name || "-"}</td>
                            <td style={tdStyle}>
                                <button onClick={() => navigate(`/admin/employees/${emp.id}`)} style={btnDetail}>Détails</button>
                                <button onClick={() => navigate(`/admin/employees/${emp.id}/edit`)} style={btnEdit}>Modifier</button>
                                <button onClick={() => handleDelete(emp.id)} style={btnDelete}>Supprimer</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Styles
const thStyle = { padding: '12px', color: '#666' };
const tdStyle = { padding: '12px' };
const btnPrimary = { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' };
const btnDetail = { backgroundColor: '#10b981', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', marginRight: '5px', cursor: 'pointer' };
const btnEdit = { backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', marginRight: '5px', cursor: 'pointer' };
const btnDelete = { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' };