// src/services/emailService.ts
import { api } from '../api/axios';

// Type pour les données que l'API Laravel attend
interface WelcomeEmailData {
    email: string;
    name: string;
}

/**
 * Envoie un e-mail de bienvenue via l'API Laravel.
 *
 * @param data Les données d'email et de nom de l'utilisateur.
 * @returns Une promesse qui résout en un message de succès.
 */
export const sendWelcomeEmail = async (data: WelcomeEmailData): Promise<string> => {
    // Note : L'URL de l'API est définie par la route Laravel.
    const url = '/emails/send-welcome'; 

    try {
        // Pas besoin de headers supplémentaires, car api.ts les gère.
        const response = await api.post(url, data);

        // Laravel retourne { message: "..." } en cas de succès (Code 200)
        return response.data.message || "E-mail de bienvenue en cours d'envoi.";

    } catch (error: any) {
        // En cas d'échec (ex: SMTP Down), nous enregistrons l'erreur 
        // mais nous ne bloquons PAS le processus d'inscription.
        console.error("❌ ERREUR LORS DE L'APPEL API D'EMAIL :", error.response?.data || error.message);
        
        // Nous retournons un message d'erreur, mais nous ne "throw" pas 
        // car l'inscription elle-même a réussi.
        return "Erreur d'envoi de l'e-mail de bienvenue (le compte est créé).";
    }
};