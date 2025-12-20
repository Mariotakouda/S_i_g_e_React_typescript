import { useEffect, useState } from "react";
import { type Employee } from "./model";
import { EmployeeService } from "./service";
import { Link } from "react-router-dom";

export default function EmployeeList() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await EmployeeService.list(page, search);
            // On s'adapte à la structure Laravel (data.data)
            const employeesData = res.data.data || res.data;
            const lastPageData = res.data.last_page || 1;

            setEmployees(Array.isArray(employeesData) ? employeesData : []);
            setLastPage(lastPageData);
        } catch (err) {
            console.error("Erreur chargement:", err);
        } finally {
            setLoading(false);
        }
    };

    // Recharger si la page ou la recherche change
    useEffect(() => {
        loadData();
    }, [page, search]);

    const confirmDelete = async (id: number) => {
        if (window.confirm("Supprimer cet employé ?")) {
            try {
                await EmployeeService.delete(id);
                loadData();
            } catch (err) {
                alert("Erreur lors de la suppression");
            }
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2>Employés</h2>
                <Link to="/admin/employees/create" style={btnStyle}>+ Nouveau</Link>
            </div>
            
            <input 
                type="text" 
                placeholder="Rechercher un nom ou email..." 
                value={search} 
                onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1); // Reset à la page 1 lors d'une recherche
                }}
                style={{ width: '100%', padding: '10px', marginBottom: '20px', boxSizing: 'border-box' }}
            />

            {/* Utilisation de 'loading' pour l'expérience utilisateur */}
            {loading && <p>Chargement des données...</p>}

            {!loading && (
                <>
                    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                        <thead>
                            <tr style={{ background: '#f3f4f6' }}>
                                <th style={thStyle}>Nom</th>
                                <th style={thStyle}>Email</th>
                                <th style={thStyle}>Département</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.length > 0 ? (
                                employees.map(e => (
                                    <tr key={e.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={tdStyle}>{e.first_name} {e.last_name}</td>
                                        <td style={tdStyle}>{e.email}</td>
                                        <td style={tdStyle}>{e.department?.name || '-'}</td>
                                        <td style={tdStyle}>
                                            <Link to={`/admin/employees/${e.id}/edit`} style={{ color: '#3b82f6', textDecoration: 'none' }}>Modifier</Link>
                                            <button 
                                                onClick={() => confirmDelete(e.id)} 
                                                style={{ marginLeft: '15px', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}
                                            >
                                                Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} style={{ padding: '20px', textAlign: 'center' }}>Aucun employé trouvé.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Utilisation de 'page', 'setPage' et 'lastPage' pour la pagination */}
                    {lastPage > 1 && (
                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
                            <button 
                                disabled={page === 1} 
                                onClick={() => setPage(p => p - 1)}
                                style={paginationBtnStyle}
                            >
                                Précédent
                            </button>
                            <span>Page {page} sur {lastPage}</span>
                            <button 
                                disabled={page === lastPage} 
                                onClick={() => setPage(p => p + 1)}
                                style={paginationBtnStyle}
                            >
                                Suivant
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// Styles
const thStyle = { padding: '12px', textAlign: 'left' as const, borderBottom: '2px solid #e5e7eb' };
const tdStyle = { padding: '12px', textAlign: 'left' as const };
const btnStyle = { padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' };
const paginationBtnStyle = { padding: '5px 15px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' };