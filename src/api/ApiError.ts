// src/api/ApiError.ts

/**
 * Classe d'erreur personnalisée pour les problèmes rencontrés avec l'API.
 * Permet de transporter le statut HTTP et les détails d'erreurs de validation.
 */
export class ApiError extends Error {
    status: number;
    errors?: Record<string, string[]>; // Utilisé pour les erreurs de validation Laravel (422)
    responseBody?: unknown;
    
    constructor(message: string, status: number, errors?: Record<string, string[]>, responseBody?: unknown) {
        // Appelle le constructeur de la classe Error
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.errors = errors;
        this.responseBody = responseBody;

        // Assure que l'instance est bien une ApiError (important pour 'instanceof')
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

/**
 * Fonction utilitaire pour gérer les erreurs renvoyées par Axios (dans les services).
 * Elle capture l'erreur et la relance en tant qu'ApiError.
 */
export function handleAxiosError(error: any): never {
    console.error('❌ Erreur de Service Axios:', error);
    
    if (error.response) {
        // Le serveur a répondu (ex: 400, 401, 422, 500)
        const status = error.response.status;
        const data = error.response.data;
        
        const message = data.message || `Erreur HTTP ${status}`;
        const errors = data.errors; // Souvent présent pour les erreurs 422
        
        throw new ApiError(message, status, errors, data);
        
    } else if (error.request) {
        // La requête a été faite, mais aucune réponse n'a été reçue (problème réseau/serveur injoignable)
        throw new ApiError('Aucune réponse du serveur ou erreur réseau.', 0);
        
    } else {
        // Erreur lors de la configuration de la requête
        throw new ApiError(error.message, 0);
    }
}