import { useEffect, useState, type CSSProperties } from 'react';
import type { LeaveRequest } from '../leaveRequests/model';
import { ApiError, LeaveRequestService } from '../leaveRequests/service';

type ProcessingAction = {
    id: number;
    type: 'approve' | 'reject' | 'delete';
} | null;

export default function AdminLeaveRequests() {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingAction, setProcessingAction] = useState<ProcessingAction>(null); 

    useEffect(() => {
        fetchLeaveRequests();
    }, []);

    const fetchLeaveRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await LeaveRequestService.fetchAllAdmin();
            const sortedData = data.sort((a, b) => {
                if (a.status === 'pending' && b.status !== 'pending') return -1;
                if (a.status !== 'pending' && b.status === 'pending') return 1;
                return new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime();
            });
            setRequests(sortedData);
        } catch (err: unknown) {
            setError("Erreur lors du chargement des demandes.");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        const actionLabel = action === 'approve' ? 'APPROUVER' : 'REJETER';
        
        // 1. Demande de confirmation et de commentaire
        const comment = window.prompt(`Voulez-vous ${actionLabel} cette demande ? Ajoutez un motif (optionnel) :`, "");
        
        // Si l'admin clique sur "Annuler", on stoppe
        if (comment === null) return;

        setProcessingAction({ id, type: action });
        setError(null);
        try {
            const updatedRequest = action === 'approve'
                ? await LeaveRequestService.approve(id, comment)
                : await LeaveRequestService.reject(id, comment);
            
            setRequests(prev => 
                prev.map(req => req.id === id ? updatedRequest : req)
                    .sort((a, b) => { 
                        if (a.status === 'pending' && b.status !== 'pending') return -1;
                        if (a.status !== 'pending' && b.status === 'pending') return 1;
                        return new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime();
                    })
            );
            
            alert(`Demande ${action === 'approve' ? 'approuvée' : 'rejetée'} avec succès.`);
        } catch (err: unknown) {
            const errorMsg = err instanceof ApiError ? err.message : `Échec de l'action.`;
            setError(errorMsg);
        } finally {
            setProcessingAction(null);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Supprimer définitivement cette demande ?")) return;
        setProcessingAction({ id, type: 'delete' });
        try {
            await LeaveRequestService.delete(id); 
            setRequests(prev => prev.filter(req => req.id !== id));
        } catch (err: unknown) {
            setError("Échec de la suppression.");
        } finally {
            setProcessingAction(null);
        }
    };

    const getStatusClasses = (status: LeaveRequest['status']): CSSProperties => {
        switch (status) {
            case 'approved': return { backgroundColor: '#d4edda', color: '#155724', fontWeight: 'bold', padding: '4px 8px', borderRadius: '12px' };
            case 'rejected': return { backgroundColor: '#f8d7da', color: '#721c24', fontWeight: 'bold', padding: '4px 8px', borderRadius: '12px' };
            default: return { backgroundColor: '#fff3cd', color: '#856404', fontWeight: 'bold', padding: '4px 8px', borderRadius: '12px' };
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Chargement...</div>;
    
    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Gestion des congés</h1>
            
            {error && <div style={errorStyle}>❌ {error}</div>}

            <div style={tableContainerStyle}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                        <tr>
                            <th style={thStyle}>Employé</th>
                            <th style={thStyle}>Type</th>
                            <th style={thStyle}>Période</th>
                            <th style={thStyle}>Statut</th>
                            <th style={thStyle}>Raison & Commentaire</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((req) => {
                            const isPending = req.status === 'pending';
                            const processing = processingAction?.id === req.id;
                            const employeeName = req.employee ? `${req.employee.first_name} ${req.employee.last_name || ''}` : 'Inconnu';

                            return (
                                <tr key={req.id} style={{ borderBottom: '1px solid #dee2e6', backgroundColor: isPending ? '#fffbe6' : 'white' }}>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: '600' }}>{employeeName}</div>
                                        <div style={{ fontSize: '11px', color: '#6c757d' }}>ID: {req.employee_id}</div>
                                    </td>
                                    <td style={tdStyle}>{req.type}</td>
                                    <td style={tdStyle}>{req.start_date} au {req.end_date}</td>
                                    <td style={tdStyle}>
                                        <span style={getStatusClasses(req.status)}>{req.status}</span>
                                    </td>
                                    
                                    {/* ✅ COLONNE MOTIF + COMMENTAIRE ADMIN */}
                                    <td style={{ ...tdStyle, maxWidth: '250px' }}>
                                        <div style={{ fontSize: '13px', marginBottom: '4px' }}>
                                            <strong>Motif :</strong> {req.message || 'Non spécifié'}
                                        </div>
                                        {req.admin_comment && (
                                            <div style={adminCommentStyle}>
                                                <strong>Note Admin :</strong> {req.admin_comment}
                                            </div>
                                        )}
                                    </td>

                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                                            {isPending ? (
                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                    <button onClick={() => handleAction(req.id, 'approve')} disabled={processing} style={{ ...actionButtonStyle, backgroundColor: '#28a745' }}>
                                                        {processingAction?.type === 'approve' && processing ? '...' : 'Approuver'}
                                                    </button>
                                                    <button onClick={() => handleAction(req.id, 'reject')} disabled={processing} style={{ ...actionButtonStyle, backgroundColor: '#dc3545' }}>
                                                        {processingAction?.type === 'reject' && processing ? '...' : 'Rejeter'}
                                                    </button>
                                                </div>
                                            ) : <span style={{ color: '#6c757d', fontSize: '12px' }}>Traité</span>}
                                            <button onClick={() => handleDelete(req.id)} disabled={processing} style={{ ...actionButtonStyle, backgroundColor: '#6c757d' }}>
                                                {processingAction?.type === 'delete' && processing ? '...' : 'Supprimer'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// STYLES
const thStyle: CSSProperties = { padding: '12px', textAlign: 'left', fontSize: '11px', color: '#6c757d', textTransform: 'uppercase', borderBottom: '2px solid #dee2e6' };
const tdStyle: CSSProperties = { padding: '12px', fontSize: '13px' };
const actionButtonStyle: CSSProperties = { padding: '5px 8px', fontSize: '11px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const errorStyle: CSSProperties = { padding: '10px', marginBottom: '15px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' };
const tableContainerStyle: CSSProperties = { overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
const adminCommentStyle: CSSProperties = { fontSize: '12px', color: '#495057', padding: '6px', backgroundColor: '#e9ecef', borderRadius: '4px', borderLeft: '3px solid #0d6efd' };