import { useEffect, useState, } from 'react';
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
        const comment = window.prompt(`Voulez-vous ${actionLabel} cette demande ? Ajoutez un motif (optionnel) :`, "");
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

    // --- Icones SVG ---
    const IconCheck = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
    const IconX = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
    const IconTrash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

    if (loading) return <div className="loading-state">Chargement des demandes en cours...</div>;
    
    return (
        <div className="admin-container">
            <style>{`
                .admin-container { padding: 30px; max-width: 1200px; margin: 0 auto; font-family: 'Inter', system-ui, sans-serif; color: #1e293b; }
                .page-header { margin-bottom: 25px; }
                .page-title { fontSize: 24px; font-weight: 700; color: #0f172a; margin: 0; }
                
                .alert-error { padding: 12px 16px; background-color: #fef2f2; border: 1px solid #fee2e2; color: #991b1b; border-radius: 8px; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
                
                .table-card { background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden; }
                .table-wrapper { overflow-x: auto; }
                table { width: 100%; border-collapse: collapse; text-align: left; }
                th { padding: 14px 20px; background: #f8fafc; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; border-bottom: 1px solid #e2e8f0; }
                td { padding: 16px 20px; font-size: 14px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
                
                .row-pending { background-color: #fffaf0; }
                .employee-info { display: flex; flex-direction: column; }
                .emp-name { font-weight: 600; color: #1e293b; }
                .emp-id { font-size: 11px; color: #94a3b8; }
                
                .badge { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; display: inline-block; }
                .badge-approved { background: #dcfce7; color: #166534; }
                .badge-rejected { background: #fee2e2; color: #991b1b; }
                .badge-pending { background: #fef3c7; color: #92400e; }
                
                .comment-box { margin-top: 8px; padding: 10px; background: #f8fafc; border-left: 3px solid #cbd5e1; border-radius: 4px; font-size: 13px; color: #475569; }
                .comment-box.admin { border-left-color: #3b82f6; background: #eff6ff; }
                
                .actions-cell { display: flex; flex-direction: column; gap: 8px; min-width: 140px; }
                .btn-group { display: flex; gap: 6px; }
                .btn-icon { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 12px; border-radius: 6px; border: none; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; color: white; }
                .btn-approve { background: #10b981; }
                .btn-approve:hover { background: #059669; }
                .btn-reject { background: #ef4444; }
                .btn-reject:hover { background: #dc2626; }
                .btn-delete { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }
                .btn-delete:hover { background: #fee2e2; color: #991b1b; border-color: #fecaca; }
                
                .loading-state { padding: 100px; text-align: center; color: #64748b; }

                @media (max-width: 768px) {
                    .admin-container { padding: 15px; }
                    th { display: none; }
                    td { display: block; width: 100%; box-sizing: border-box; padding: 10px 20px; border-bottom: none; }
                    tr { display: block; padding: 15px 0; border-bottom: 2px solid #e2e8f0; }
                    td::before { content: attr(data-label); display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px; }
                }
            `}</style>

            <div className="page-header">
                <h1 className="page-title">Gestion des congés</h1>
            </div>
            
            {error && (
                <div className="alert-error">
                    <IconX /> {error}
                </div>
            )}

            <div className="table-card">
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Employé</th>
                                <th>Type</th>
                                <th>Période</th>
                                <th>Statut</th>
                                <th>Détails</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req) => {
                                const isPending = req.status === 'pending';
                                const processing = processingAction?.id === req.id;
                                const employeeName = req.employee ? `${req.employee.first_name} ${req.employee.last_name || ''}` : 'Inconnu';

                                return (
                                    <tr key={req.id} className={isPending ? 'row-pending' : ''}>
                                        <td data-label="Employé">
                                            <div className="employee-info">
                                                <span className="emp-name">{employeeName}</span>
                                                <span className="emp-id">Matricule: {req.employee_id}</span>
                                            </div>
                                        </td>
                                        <td data-label="Type">
                                            <span style={{fontWeight: 500}}>{req.type}</span>
                                        </td>
                                        <td data-label="Période">
                                            <div style={{fontSize: '13px'}}>Du {req.start_date}</div>
                                            <div style={{fontSize: '13px'}}>Au {req.end_date}</div>
                                        </td>
                                        <td data-label="Statut">
                                            <span className={`badge badge-${req.status}`}>
                                                {req.status === 'pending' ? 'En attente' : req.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                                            </span>
                                        </td>
                                        <td data-label="Détails">
                                            <div style={{fontSize: '13px'}}>
                                                <strong>Motif :</strong> {req.message || 'Non spécifié'}
                                            </div>
                                            {req.admin_comment && (
                                                <div className="comment-box admin">
                                                    <strong>Note Admin :</strong> {req.admin_comment}
                                                </div>
                                            )}
                                        </td>
                                        <td data-label="Actions">
                                            <div className="actions-cell">
                                                {isPending ? (
                                                    <div className="btn-group">
                                                        <button 
                                                            onClick={() => handleAction(req.id, 'approve')} 
                                                            disabled={processing} 
                                                            className="btn-icon btn-approve"
                                                        >
                                                            {processingAction?.type === 'approve' && processing ? '...' : <><IconCheck /> Approuver</>}
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAction(req.id, 'reject')} 
                                                            disabled={processing} 
                                                            className="btn-icon btn-reject"
                                                        >
                                                            {processingAction?.type === 'reject' && processing ? '...' : <><IconX /> Rejeter</>}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>Demande traitée</span>
                                                )}
                                                <button 
                                                    onClick={() => handleDelete(req.id)} 
                                                    disabled={processing} 
                                                    className="btn-icon btn-delete"
                                                >
                                                    {processingAction?.type === 'delete' && processing ? '...' : <><IconTrash /> Supprimer</>}
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
        </div>
    );
}