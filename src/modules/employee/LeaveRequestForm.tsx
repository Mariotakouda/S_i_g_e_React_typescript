// src/modules/employee/LeaveRequestForm.tsx

import { useState, type FormEvent } from 'react';
import { api } from '../../api/axios';
import { useNavigate } from 'react-router-dom';

interface LeaveFormData {
    type: string;
    start_date: string;
    end_date: string;
    message: string; // Correspond au champ 'message' dans votre migration
}

export default function LeaveRequestForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<LeaveFormData>({
        type: 'annuel',
        start_date: '',
        end_date: '',
        message: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(null);
        setIsLoading(true);

        // Vérification simple de date
        if (new Date(formData.end_date) < new Date(formData.start_date)) {
            setMessage({ text: "La date de fin ne peut pas être antérieure à la date de début.", type: 'error' });
            setIsLoading(false);
            return;
        }

        try {
            // API Route: POST /api/me/leave_requests
            await api.post('/me/leave_requests', formData); 
            
            setMessage({ 
                text: "Demande soumise avec succès ! En attente d'approbation.", 
                type: 'success' 
            });

            // Redirection vers l'historique après succès
            setTimeout(() => navigate('/employee/leave_requests'), 2000);

        } catch (err: any) {
            console.error("Erreur de soumission de congé:", err);
            // Gérer les erreurs de validation spécifiques de Laravel
            const errorMsg = err.response?.data?.errors 
                ? Object.values(err.response.data.errors).flat().join(' ') 
                : err.response?.data?.message || "Erreur lors de la soumission de la demande.";
                
            setMessage({ text: errorMsg, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Faire une demande de congé</h2>
            <div style={{ maxWidth: '600px', margin: '20px 0', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            
                {message && (
                    <div style={{ 
                        padding: '15px', 
                        marginBottom: '20px', 
                        borderRadius: '5px', 
                        color: message.type === 'success' ? '#155724' : '#721c24', 
                        backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da' 
                    }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Type de Congé */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Type de Congé</label>
                        <select 
                            name="type" 
                            value={formData.type} 
                            onChange={handleChange} 
                            required
                            style={inputStyle}
                        >
                            <option value="paid">Congé Payé</option>
                            <option value="sick">Congé Maladie</option>
                            <option value="unpaid">Congé Sans Solde</option>
                            <option value="maternity">Maternité</option>
                            <option value="maternity">Paternité</option>
                            <option value="other">Autre</option>
                        </select>
                    </div>

                    {/* Dates */}
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Date de Début</label>
                            <input 
                                type="date" 
                                name="start_date" 
                                value={formData.start_date} 
                                onChange={handleChange} 
                                required
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Date de Fin</label>
                            <input 
                                type="date" 
                                name="end_date" 
                                value={formData.end_date} 
                                onChange={handleChange} 
                                required
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Message / Raison */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Raison (Message)</label>
                        <textarea 
                            name="message" 
                            value={formData.message} 
                            onChange={handleChange} 
                            rows={4}
                            maxLength={500}
                            style={{ ...inputStyle, resize: 'vertical' }}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        style={{ 
                            width: '100%', 
                            padding: '12px', 
                            backgroundColor: '#007bff', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            opacity: isLoading ? 0.7 : 1
                        }}
                    >
                        {isLoading ? 'Envoi en cours...' : 'Soumettre la Demande'}
                    </button>
                </form>
            </div>
        </div>
    );
}

const inputStyle = { 
    width: '100%', 
    padding: '10px', 
    borderRadius: '4px', 
    border: '1px solid #ccc',
    boxSizing: 'border-box' as const,
};