// src/modules/employees/show.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { EmployeeService } from "./service";
import type { Employee } from "./model";

export default function EmployeeShow() {
    const { id } = useParams();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        if (id) {
            EmployeeService.get(Number(id))
                .then(res => setEmployee(res.data))
                .catch(err => console.error("Erreur chargement employé:", err))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const getInitials = () => {
        return `${employee?.first_name?.charAt(0) || ''}${employee?.last_name?.charAt(0) || ''}`;
    };

    if (loading) return <div style={centerStyle}><p>Chargement des données...</p></div>;
    if (!employee) return <div style={centerStyle}><p>Employé introuvable.</p></div>;

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: 'auto' }}>
            <div style={{ marginBottom: '20px' }}>
                <Link to="/admin/employees" style={backLinkStyle}>← Retour à la liste</Link>
            </div>

            <header style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {/* Photo de profil */}
                    {employee.profile_photo_url ? (
                        <img 
                            src={employee.profile_photo_url} 
                            alt={`${employee.first_name} ${employee.last_name}`}
                            style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '4px solid #3b82f6',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            backgroundColor: '#3b82f6',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '36px',
                            border: '4px solid #3b82f6',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            {getInitials()}
                        </div>
                    )}

                    {/* Nom et contrat */}
                    <div>
                        <h1 style={{ margin: 0 }}>{employee.first_name} {employee.last_name}</h1>
                        <span style={badgeStyle(employee.contract_type || 'Inconnu')}>
                            {employee.contract_type || 'Type de contrat non défini'}
                        </span>
                    </div>
                </div>
                <div style={idBadgeStyle}>ID: #{employee.id}</div>
            </header>

            <div style={gridContainer}>
                {/* Section Informations Personnelles */}
                <div style={cardStyle}>
                    <h3 style={cardTitle}>Informations Personnelles</h3>
                    <p><strong>Email:</strong> {employee.email}</p>
                    <p><strong>Téléphone:</strong> {employee.phone || 'Non renseigné'}</p>
                    <p><strong>Département:</strong> {employee.department?.name || 'Aucun département'}</p>
                </div>

                {/* Section Contrat et Salaire */}
                <div style={cardStyle}>
                    <h3 style={cardTitle}>Détails du Contrat</h3>
                    <p>
                        <strong>Date d'embauche:</strong> {
                            employee.hire_date 
                            ? new Date(employee.hire_date).toLocaleDateString('fr-FR') 
                            : 'Non renseignée'
                        }
                    </p>
                    <p>
                        <strong>Salaire de base:</strong> {
                            new Intl.NumberFormat('fr-FR', { 
                                style: 'currency', 
                                currency: 'XOF' 
                            }).format(employee.salary_base ?? 0)
                        }
                    </p>
                    <div>
                        <strong>Rôles :</strong>
                        <div style={{ display: 'flex', gap: '5px', marginTop: '5px', flexWrap: 'wrap' }}>
                            {employee.roles && employee.roles.length > 0 ? (
                                employee.roles.map((role: any) => (
                                    <span key={role.id} style={roleBadgeStyle}>{role.name}</span>
                                ))
                            ) : (
                                <span style={{ color: '#999', fontSize: '13px' }}>Aucun rôle assigné</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <div style={{ marginTop: '30px', textAlign: 'right' }}>
                <Link to={`/admin/employees/${employee.id}/edit`} style={editButtonStyle}>
                    Modifier le profil
                </Link>
            </div>

            <div style={{ marginTop: '20px', fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
                Profil lié au compte utilisateur : {employee.email}
            </div>
        </div>
    );
}

// --- STYLES ---

const centerStyle = { display: 'flex' as const, justifyContent: 'center', alignItems: 'center', height: '50vh' };

const backLinkStyle = { color: '#2563eb', textDecoration: 'none', fontWeight: '500' };

const headerStyle = { 
    display: 'flex' as const, 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '30px',
    borderBottom: '2px solid #f1f5f9',
    paddingBottom: '20px'
};

const gridContainer = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px'
};

const cardStyle = { 
    background: 'white', 
    padding: '25px', 
    borderRadius: '12px', 
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0'
};

const cardTitle = { margin: '0 0 15px 0', fontSize: '18px', color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' };

const badgeStyle = (type: string) => ({
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold' as const,
    backgroundColor: type === 'CDI' ? '#dcfce7' : '#fef9c3',
    color: type === 'CDI' ? '#166534' : '#854d0e',
    marginTop: '10px'
});

const roleBadgeStyle = {
    backgroundColor: '#eff6ff',
    color: '#1e40af',
    padding: '2px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    border: '1px solid #bfdbfe'
};

const idBadgeStyle = {
    backgroundColor: '#f8fafc',
    padding: '5px 15px',
    borderRadius: '8px',
    color: '#64748b',
    fontWeight: 'bold' as const,
    border: '1px solid #e2e8f0'
};

const editButtonStyle = {
    backgroundColor: '#1e293b',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600'
};