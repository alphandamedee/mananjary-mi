import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import ChangePassword from './ChangePassword';
import './Profile.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [tragnobes, setTragnobes] = useState([]);
  const [lohantragnoList, setLohantragnoList] = useState([]);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    ville: '',
    annee_naissance: '',
    genre: 'H',
    id_tragnobe: '',
    id_lohantragno: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        ville: user.ville || '',
        annee_naissance: user.annee_naissance || '',
        genre: user.genre || 'H',
        id_tragnobe: user.id_tragnobe || '',
        id_lohantragno: user.id_lohantragno || ''
      });
      if (user.photo) {
        setPhotoPreview(`http://localhost:8000/${user.photo}`);
      }
    }
  }, [user]);

  // Charger les tragnobes
  useEffect(() => {
    const fetchTragnobes = async () => {
      try {
        const response = await api.get('/tragnobes/');
        setTragnobes(response.data);
      } catch (err) {
        console.error('Erreur chargement tragnobes:', err);
      }
    };
    fetchTragnobes();
  }, []);

  // Charger les lohantragno quand un tragnobe est sélectionné
  useEffect(() => {
    const fetchLohantragno = async () => {
      if (formData.id_tragnobe) {
        try {
          const response = await api.get(`/lohantragno/by-tragnobe/${formData.id_tragnobe}`);
          setLohantragnoList(response.data);
        } catch (err) {
          console.error('Erreur chargement lohantragno:', err);
          setLohantragnoList([]);
        }
      } else {
        setLohantragnoList([]);
      }
    };
    fetchLohantragno();
  }, [formData.id_tragnobe]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La taille de l\'image ne doit pas dépasser 5MB');
      return;
    }

    // Prévisualisation
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload immédiat
    try {
      setLoading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/users/${user.id}/upload-photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage('Photo mise à jour avec succès');
      
      // Mettre à jour le contexte utilisateur
      if (updateUser) {
        updateUser({ ...user, photo: response.data.photo });
      }

      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Erreur upload photo:', err);
      const errorMsg = err.response?.data?.detail;
      if (typeof errorMsg === 'string') {
        setError(errorMsg);
      } else if (Array.isArray(errorMsg)) {
        setError(errorMsg.map(e => e.msg || e).join(', '));
      } else {
        setError('Erreur lors de l\'upload de la photo');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const updateData = { ...formData };
      
      // Supprimer le champ mot_de_passe (géré séparément)
      delete updateData.mot_de_passe;
      
      // Nettoyer les champs vides et convertir annee_naissance
      if (updateData.annee_naissance) {
        updateData.annee_naissance = parseInt(updateData.annee_naissance);
      } else {
        delete updateData.annee_naissance; // Supprimer si vide
      }
      
      // Supprimer les champs vides (chaînes vides)
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '' || updateData[key] === null || updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const response = await api.put(`/users/${user.id}`, updateData);
      
      setMessage('Profil mis à jour avec succès');
      
      // Mettre à jour le contexte utilisateur
      if (updateUser) {
        updateUser(response.data);
      }

      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Erreur mise à jour profil:', err);
      const errorMsg = err.response?.data?.detail;
      if (typeof errorMsg === 'string') {
        setError(errorMsg);
      } else if (Array.isArray(errorMsg)) {
        setError(errorMsg.map(e => e.msg || e).join(', '));
      } else {
        setError('Erreur lors de la mise à jour du profil');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <h2>Mon Profil</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="profile-content">
        {/* Section Photo */}
        <div className="profile-photo-section">
          <div className="photo-container">
            {photoPreview ? (
              <img src={photoPreview} alt="Photo de profil" className="profile-photo" />
            ) : (
              <div className="photo-placeholder">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            )}
          </div>
          <label htmlFor="photo-upload" className="photo-upload-btn">
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
              disabled={loading}
            />
            Changer la photo
          </label>
          <p className="photo-hint">JPG, PNG ou GIF (max 5MB)</p>
        </div>

        {/* Formulaire */}
        <div className="profile-form-section">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nom">Nom *</label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="prenom">Prénom *</label>
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="telephone">Téléphone</label>
                <input
                  type="tel"
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="genre">Genre</label>
                <select
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="H">Homme</option>
                  <option value="F">Femme</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="annee_naissance">Année de naissance</label>
                <input
                  type="number"
                  id="annee_naissance"
                  name="annee_naissance"
                  value={formData.annee_naissance}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear()}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="ville">Ville</label>
              <input
                type="text"
                id="ville"
                name="ville"
                value={formData.ville}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="id_tragnobe">Tragnobe</label>
                <select
                  id="id_tragnobe"
                  name="id_tragnobe"
                  value={formData.id_tragnobe}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Sélectionner un tragnobe</option>
                  {tragnobes.map(tragnobe => (
                    <option key={tragnobe.id} value={tragnobe.id}>
                      {tragnobe.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="id_lohantragno">Lohantragno</label>
                <select
                  id="id_lohantragno"
                  name="id_lohantragno"
                  value={formData.id_lohantragno}
                  onChange={handleChange}
                  disabled={loading || !formData.id_tragnobe}
                >
                  <option value="">Sélectionner un lohantragno</option>
                  {lohantragnoList.map(lohantragno => (
                    <option key={lohantragno.id} value={lohantragno.id}>
                      {lohantragno.nom}
                    </option>
                  ))}
                </select>
                {!formData.id_tragnobe && (
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    Veuillez d'abord sélectionner un tragnobe
                  </small>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Section changement de mot de passe */}
      <ChangePassword />
    </div>
  );
}
