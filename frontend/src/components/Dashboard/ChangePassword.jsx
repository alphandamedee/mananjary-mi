import { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './ChangePassword.css';

export default function ChangePassword() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      // Vérifier l'ancien mot de passe en essayant de se connecter
      const loginCheck = await api.post('/auth/login', {
        email: user.email,
        password: formData.currentPassword
      });

      if (!loginCheck.data.access_token) {
        setError('Mot de passe actuel incorrect');
        setLoading(false);
        return;
      }

      // Mettre à jour le mot de passe
      await api.put(`/users/${user.id}`, {
        mot_de_passe: formData.newPassword
      });

      setMessage('Mot de passe modifié avec succès');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Erreur changement mot de passe:', err);
      if (err.response?.status === 401) {
        setError('Mot de passe actuel incorrect');
      } else {
        const errorMsg = err.response?.data?.detail;
        if (typeof errorMsg === 'string') {
          setError(errorMsg);
        } else if (Array.isArray(errorMsg)) {
          setError(errorMsg.map(e => e.msg || e).join(', '));
        } else {
          setError('Erreur lors du changement de mot de passe');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <h3>Changer le mot de passe</h3>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="password-form">
        <div className="form-group">
          <label htmlFor="currentPassword">Mot de passe actuel *</label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            required
            disabled={loading}
            autoComplete="current-password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">Nouveau mot de passe *</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            disabled={loading}
            minLength={6}
            autoComplete="new-password"
          />
          <small>Minimum 6 caractères</small>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmer le mot de passe *</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Modification...' : 'Modifier le mot de passe'}
        </button>
      </form>
    </div>
  );
}
