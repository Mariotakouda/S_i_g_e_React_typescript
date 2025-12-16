// Fichier : AdminLeaveRequests.tsx

import { useEffect, useState, type CSSProperties } from 'react';
import type { LeaveRequest } from '../leaveRequests/model';
import { ApiError, LeaveRequestService } from '../leaveRequests/service';

// Définition du type pour l'état de traitement afin de connaître l'ID et l'action en cours
type ProcessingAction = {
    id: number;
    type: 'approve' | 'reject' | 'delete';
} | null;

export default function AdminLeaveRequests() {
    // Hooks d'état
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // 💡 CORRECTION : Nouvel état pour suivre l'ID ET le type d'action en cours
    const [processingAction, setProcessingAction] = useState<ProcessingAction>(null); 

    useEffect(() => {
        fetchLeaveRequests();
    }, []);

    // 🔄 Charger toutes les demandes de congé
    const fetchLeaveRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await LeaveRequestService.fetchAllAdmin();
            
            // Logique de tri (pending en premier, puis par date décroissante)
            const sortedData = data.sort((a, b) => {
                if (a.status === 'pending' && b.status !== 'pending') return -1;
                if (a.status !== 'pending' && b.status === 'pending') return 1;
                
                const dateA = new Date(a.created_at ?? '').getTime();
                const dateB = new Date(b.created_at ?? '').getTime();
                
                return dateB - dateA;
            });
            
            setRequests(sortedData);
        } catch (err: unknown) {
            const errorMsg = err instanceof ApiError ? err.message : "Erreur lors du chargement des demandes.";
            console.error("Erreur de chargement des demandes de congés:", err);
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // 🛠️ Action : Approuver ou rejeter une demande
    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        if (!window.confirm(`Êtes-vous sûr de vouloir ${action === 'approve' ? 'approuver' : 'rejeter'} cette demande ?`)) {
            return;
        }

        // 💡 Mettre à jour l'état pour afficher "..." sur le bouton correct
        setProcessingAction({ id, type: action });
        setError(null);
        try {
            const updatedRequest = action === 'approve'
                ? await LeaveRequestService.approve(id)
                : await LeaveRequestService.reject(id);
            
            // Mettre à jour l'état local avec le nouveau statut et retrier
            setRequests(prev => 
                prev.map(req => 
                    req.id === id ? updatedRequest : req
                ).sort((a, b) => { 
                    if (a.status === 'pending' && b.status !== 'pending') return -1;
                    if (a.status !== 'pending' && b.status === 'pending') return 1;
                    
                    const dateA = new Date(a.created_at ?? '').getTime();
                    const dateB = new Date(b.created_at ?? '').getTime();
                    
                    return dateB - dateA;
                })
            );
            
            alert(`Demande de congé ${action === 'approve' ? 'approuvée' : 'rejetée'} avec succès.`);
            
        } catch (err: unknown) {
            const errorMsg = err instanceof ApiError ? err.message : `Échec de l'action de ${action}.`;
            console.error(`Erreur ${action}:`, err);
            setError(errorMsg);
        } finally {
            // Réinitialiser l'état de traitement
            setProcessingAction(null);
        }
    };

    // 🗑️ ACTION : Supprimer une demande
    const handleDelete = async (id: number) => {
        if (!window.confirm("Êtes-vous sûr de vouloir SUPPRIMER DÉFINITIVEMENT cette demande de congé ? Cette action est irréversible.")) {
            return;
        }

        // 💡 Mettre à jour l'état pour afficher "..." sur le bouton Supprimer
        setProcessingAction({ id, type: 'delete' });
        setError(null);
        try {
            await LeaveRequestService.delete(id); 
            
            // Filtrer la demande supprimée
            setRequests(prev => prev.filter(req => req.id !== id));
            
            alert("Demande de congé supprimée avec succès.");

        } catch (err: unknown) {
            const errorMsg = err instanceof ApiError ? err.message : "Échec de la suppression de la demande.";
            console.error("Erreur de suppression:", err);
            setError(errorMsg);
        } finally {
            // Réinitialiser l'état de traitement
            setProcessingAction(null);
        }
    };

    // 🎨 Style des badges de statut
    const getStatusClasses = (status: LeaveRequest['status']): CSSProperties => {
        switch (status) {
            case 'approved':
                return { backgroundColor: '#d4edda', color: '#155724', fontWeight: 'bold', padding: '4px 8px', borderRadius: '12px' };
            case 'rejected':
                return { backgroundColor: '#f8d7da', color: '#721c24', fontWeight: 'bold', padding: '4px 8px', borderRadius: '12px' };
            default:
                return { backgroundColor: '#fff3cd', color: '#856404', fontWeight: 'bold', padding: '4px 8px', borderRadius: '12px' };
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Chargement des demandes de congés...</div>;
    
    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
                Gestion des demandes de congé
            </h1>
            
            {error && (
                <div style={{ padding: '15px', marginBottom: '20px', backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: '6px' }}>
                    ❌ Erreur : {error}
                </div>
            )}

            {requests.length === 0 ? (
                <p style={{ color: '#6c757d' }}>Aucune demande de congé en attente ou enregistrée.</p>
            ) : (
                <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f8f9fa' }}>
                            <tr>
                                <th style={thStyle}>Employé</th>
                                <th style={thStyle}>Type de Congé</th>
                                <th style={thStyle}>Période</th>
                                <th style={thStyle}>Statut</th>
                                <th style={thStyle}>Raison</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req) => {
                                const isPending = req.status === 'pending';
                                // 💡 Utiliser le nouvel état `processingAction`
                                const processing = processingAction?.id === req.id;
                                const employeeName = req.employee ? `${req.employee.first_name} ${req.employee.last_name || ''}` : 'Employé Inconnu';

                                return (
                                    <tr key={req.id} style={{ borderBottom: '1px solid #dee2e6', backgroundColor: isPending ? '#fffbe6' : 'white' }}>
                                        <td style={tdStyle}>
                                            <div style={{ fontWeight: '600' }}>{employeeName}</div>
                                            <div style={{ fontSize: '12px', color: '#6c757d' }}>ID: {req.employee_id}</div>
                                        </td>
                                        <td style={tdStyle}>
                                            {req.type.charAt(0).toUpperCase() + req.type.slice(1)}
                                        </td>
                                        <td style={tdStyle}>
                                            Du {req.start_date} au {req.end_date}
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={getStatusClasses(req.status)}>
                                                {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, maxWidth: '250px', whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {req.message || 'Aucune raison fournie'}
                                        </td>
                                        <td style={{ ...tdStyle, width: '150px' }}>
                                            <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                                                {isPending ? (
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={() => handleAction(req.id, 'approve')}
                                                            disabled={processing}
                                                            style={{ ...actionButtonStyle, backgroundColor: processing ? '#ccc' : '#28a745', flexGrow: 1 }}
                                                        >
                                                            {/* 💡 CORRIGÉ : Vérifie le type d'action en cours */}
                                                            {processingAction?.type === 'approve' ? '...' : 'Approuver'} 
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(req.id, 'reject')}
                                                            disabled={processing}
                                                            style={{ ...actionButtonStyle, backgroundColor: processing ? '#ccc' : '#dc3545', flexGrow: 1 }}
                                                        >
                                                            {/* 💡 CORRIGÉ : Vérifie le type d'action en cours */}
                                                            {processingAction?.type === 'reject' ? '...' : 'Rejeter'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#6c757d', fontSize: '12px', fontStyle: 'italic' }}>Traité</span>
                                                )}

                                                {/* 🗑️ BOUTON DE SUPPRESSION (pour Admin) */}
                                                <button
                                                    onClick={() => handleDelete(req.id)}
                                                    disabled={processing}
                                                    style={{ 
                                                        ...actionButtonStyle, 
                                                        // 💡 Utiliser processingAction?.type pour le style de chargement
                                                        backgroundColor: processingAction?.type === 'delete' ? '#ccc' : '#6c757d', 
                                                        marginTop: isPending ? '0px' : '8px', 
                                                        width: '100%',
                                                    }}
                                                >
                                                    {/* 💡 CORRIGÉ : Vérifie le type d'action en cours */}
                                                    {processingAction?.type === 'delete' ? '...' : 'Supprimer'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// STYLES DÉFINIS À L'EXTÉRIEUR DU COMPOSANT
const thStyle: CSSProperties = {
    padding: '12px 15px',
    textAlign: 'left',
    fontSize: '12px',
    color: '#6c757d',
    textTransform: 'uppercase',
    borderBottom: '2px solid #dee2e6',
};

const tdStyle: CSSProperties = {
    padding: '12px 15px',
    fontSize: '14px',
    color: '#212529',
};

const actionButtonStyle: CSSProperties = {
    padding: '6px 10px',
    fontSize: '12px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
};