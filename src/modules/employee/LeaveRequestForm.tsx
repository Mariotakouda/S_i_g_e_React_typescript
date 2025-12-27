import { useState, type FormEvent } from 'react';
import { api } from '../../api/axios';
import { useNavigate } from 'react-router-dom';

// --- ICONES SVG ---
const Icons = {
    Calendar: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    Type: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
    Info: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    Send: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polyline points="22 2 15 22 11 13 2 9 22 2"/></svg>
};

interface LeaveFormData {
    type: string;
    start_date: string;
    end_date: string;
    message: string;
}

export default function LeaveRequestForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<LeaveFormData>({
        type: 'paid',
        start_date: '',
        end_date: '',
        message: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'danger' } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(null);
        setIsLoading(true);

        if (new Date(formData.end_date) < new Date(formData.start_date)) {
            setMessage({ text: "La date de fin ne peut pas être antérieure au début.", type: 'danger' });
            setIsLoading(false);
            return;
        }

        try {
            await api.post('/me/leave_requests', formData); 
            setMessage({ text: "Demande soumise avec succès !", type: 'success' });
            setTimeout(() => navigate('/employee/leave_requests'), 2000);
        } catch (err: any) {
            const errorMsg = err.response?.data?.errors 
                ? Object.values(err.response.data.errors).flat().join(' ') 
                : "Erreur lors de la soumission.";
            setMessage({ text: errorMsg, type: 'danger' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <div className="row justify-content-center">
                <div className="col-12 col-lg-8 col-xl-6">
                    
                    {/* Header */}
                    <div className="d-flex align-items-center mb-4">
                        <div className="bg-primary text-white p-3 rounded-3 shadow-sm me-3">
                            <Icons.Calendar />
                        </div>
                        <div>
                            <h2 className="h4 mb-0 fw-bold text-dark">Demande de Congé</h2>
                            <p className="text-muted small mb-0">Remplissez les détails pour votre absence</p>
                        </div>
                    </div>

                    {/* Card Formulaire */}
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="card-body p-4 p-md-5">
                            
                            {message && (
                                <div className={`alert alert-${message.type} border-0 rounded-3 shadow-sm d-flex align-items-center mb-4 animate__animated animate__fadeIn`} role="alert">
                                    <div className="me-2"><Icons.Info /></div>
                                    <div className="small fw-semibold">{message.text}</div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="row g-4">
                                    
                                    {/* Type de Congé */}
                                    <div className="col-12">
                                        <label className="form-label fw-bold small text-uppercase text-muted d-flex align-items-center">
                                            <span className="me-2 text-primary"><Icons.Type /></span> Type de Congé
                                        </label>
                                        <select 
                                            className="form-select border-2 shadow-none py-2"
                                            name="type" 
                                            value={formData.type} 
                                            onChange={handleChange} 
                                            required
                                        >
                                            <option value="paid">Congé Payé</option>
                                            <option value="sick">Congé Maladie</option>
                                            <option value="unpaid">Congé Sans Solde</option>
                                            <option value="maternity">Maternité / Paternité</option>
                                            <option value="other">Autre</option>
                                        </select>
                                    </div>

                                    {/* Dates */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Date de Début</label>
                                        <input 
                                            type="date" 
                                            name="start_date" 
                                            className="form-control border-2 shadow-none py-2"
                                            value={formData.start_date} 
                                            onChange={handleChange} 
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Date de Fin</label>
                                        <input 
                                            type="date" 
                                            name="end_date" 
                                            className="form-control border-2 shadow-none py-2"
                                            value={formData.end_date} 
                                            onChange={handleChange} 
                                            required
                                        />
                                    </div>

                                    {/* Message */}
                                    <div className="col-12">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Raison (Message)</label>
                                        <textarea 
                                            name="message" 
                                            className="form-control border-2 shadow-none p-3"
                                            value={formData.message} 
                                            onChange={handleChange} 
                                            rows={4}
                                            maxLength={500}
                                            placeholder="Expliquez brièvement l'objet de votre demande..."
                                            style={{ resize: 'none', fontSize: '0.95rem' }}
                                        />
                                        <div className="text-end mt-1 text-muted small">{formData.message.length}/500</div>
                                    </div>

                                    {/* Bouton Action */}
                                    <div className="col-12 mt-4">
                                        <button 
                                            type="submit" 
                                            disabled={isLoading}
                                            className="btn btn-primary w-100 py-3 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm transition-all"
                                            style={{ fontSize: '1.05rem' }}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                    <span>Traitement en cours...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Icons.Send />
                                                    <span>Soumettre ma Demande</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}