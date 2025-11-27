// src/modules/employees/list.tsx

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
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("📤 Chargement employés - Page:", page, "Search:", search);
      
      const res = await EmployeeService.list(page, search);
      
      console.log("✅ Employés chargés:", res.data);
      
      // Gérer différents formats de réponse
      const employeesData = res.data.data || res.data;
      const paginationData = res.data.last_page || res.data.meta?.last_page || 1;
      
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
      setLastPage(paginationData);
    } catch (err: any) {
      console.error("❌ Erreur chargement employés:", err);
      setError(err.response?.data?.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        loadData();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const confirmDelete = async (id: number, name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${name} ?`)) {
      return;
    }

    try {
      await EmployeeService.delete(id);
      console.log("✅ Employé supprimé");
      loadData();
    } catch (err: any) {
      console.error("❌ Erreur suppression:", err);
      alert(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  if (loading && employees.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Chargement des employés...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
      }}>
        <h2 style={{ fontSize: "24px", margin: 0 }}>Liste des employés</h2>
        <Link
          to="/admin/employees/create"
          style={{
            padding: "10px 20px",
            backgroundColor: "#3b82f6",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
            fontWeight: "500",
          }}
        >
          + Créer un employé
        </Link>
      </div>

      {error && (
        <div style={{
          padding: "15px",
          backgroundColor: "#fee",
          border: "1px solid #fcc",
          borderRadius: "5px",
          marginBottom: "20px",
          color: "#c00",
        }}>
          {error}
        </div>
      )}

      <div style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}>
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="🔍 Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "5px",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {employees.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "40px",
            color: "#6b7280",
          }}>
            <p style={{ fontSize: "16px", marginBottom: "10px" }}>
              Aucun employé trouvé
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#f3f4f6",
                  border: "1px solid #d1d5db",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Réinitialiser la recherche
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
            }}>
              <thead>
                <tr style={{
                  backgroundColor: "#f9fafb",
                  borderBottom: "2px solid #e5e7eb",
                }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Nom complet</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Téléphone</th>
                  <th style={thStyle}>Département</th>
                  <th style={thStyle}>Contrat</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {employees.map((e) => (
                  <tr
                    key={e.id}
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <td style={tdStyle}>{e.id}</td>
                    <td style={tdStyle}>
                      <strong>{e.first_name} {e.last_name}</strong>
                    </td>
                    <td style={tdStyle}>{e.email}</td>
                    <td style={tdStyle}>{e.phone || "-"}</td>
                    <td style={tdStyle}>
                      {e.department?.name || e.department_id || "-"}
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: "4px 8px",
                        backgroundColor: "#dbeafe",
                        color: "#1e40af",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "500",
                      }}>
                        {e.contract_type || "-"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}>
                        <Link
                          to={`/admin/employees/${e.id}`}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#dbeafe",
                            color: "#1e40af",
                            textDecoration: "none",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                        >
                          Voir
                        </Link>
                        <Link
                          to={`/admin/employees/${e.id}/edit`}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#fef3c7",
                            color: "#92400e",
                            textDecoration: "none",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                        >
                          Modifier
                        </Link>
                        <button
                          onClick={() => confirmDelete(e.id, `${e.first_name} ${e.last_name}`)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#fee2e2",
                            color: "#991b1b",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "500",
                            cursor: "pointer",
                          }}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {lastPage > 1 && (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "15px",
            marginTop: "30px",
            paddingTop: "20px",
            borderTop: "1px solid #e5e7eb",
          }}>
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              style={{
                padding: "8px 16px",
                backgroundColor: page === 1 ? "#f3f4f6" : "#3b82f6",
                color: page === 1 ? "#9ca3af" : "white",
                border: "none",
                borderRadius: "5px",
                cursor: page === 1 ? "not-allowed" : "pointer",
                fontWeight: "500",
              }}
            >
              ← Précédent
            </button>

            <span style={{
              padding: "8px 16px",
              backgroundColor: "#f3f4f6",
              borderRadius: "5px",
              fontWeight: "500",
            }}>
              Page {page} / {lastPage}
            </span>

            <button
              disabled={page === lastPage}
              onClick={() => setPage(page + 1)}
              style={{
                padding: "8px 16px",
                backgroundColor: page === lastPage ? "#f3f4f6" : "#3b82f6",
                color: page === lastPage ? "#9ca3af" : "white",
                border: "none",
                borderRadius: "5px",
                cursor: page === lastPage ? "not-allowed" : "pointer",
                fontWeight: "500",
              }}
            >
              Suivant →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Styles
const thStyle: React.CSSProperties = {
  padding: "12px",
  textAlign: "left",
  fontWeight: "600",
  fontSize: "14px",
  color: "#374151",
};

const tdStyle: React.CSSProperties = {
  padding: "12px",
  fontSize: "14px",
  color: "#1f2937",
};