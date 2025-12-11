import React, { useState, useContext, type FormEvent } from 'react';
// 🎯 CORRIGÉ : Importe 'User' du contexte
import { useNavigate, Link } from "react-router-dom";
import "./login.css"; 
import { AuthContext, type User } from '../../context/AuthContext';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);

    try {
      // ✅ CORRIGÉ : L'appel est maintenant valide (un seul objet)
      const userData: User = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      
      const redirectPath = userData.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
      navigate(redirectPath);
      
    } catch (err: any) {
        let errorMessage = "Une erreur est survenue lors de l'inscription.";
        
        if (err.response && err.response.data) {
            const validationErrors = Object.values(err.response.data.errors || {}).flat();
            errorMessage = validationErrors.length > 0 ? String(validationErrors[0]) : (err.response.data.message || errorMessage);
        } else if (err instanceof Error) {
            errorMessage = err.message;
        }

        setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Inscription Employé</h2>
        <p className="login-subtitle">Créez votre compte pour accéder à votre espace</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          
          <div className="form-group">
            <label htmlFor="name" className="form-label">Nom Complet</label>
            <input
              id="name"
              type="text"
              name="name"
              className="form-input"
              placeholder="Ex: Jean Dupont"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">Adresse email</label>
            <input
              id="email"
              type="email"
              name="email"
              className="form-input"
              placeholder="votre@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Mot de passe</label>
            <input
              id="password"
              type="password"
              name="password"
              className="form-input"
              placeholder="Minimum 8 caractères"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password_confirmation" className="form-label">Confirmer le mot de passe</label>
            <input
              id="password_confirmation"
              type="password"
              name="password_confirmation"
              className="form-input"
              placeholder="Confirmer votre mot de passe"
              value={formData.password_confirmation}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login" className="forgot-link">
            Déjà un compte ? Connectez-vous
          </Link>
        </div>
      </div>
    </div>
  );
}