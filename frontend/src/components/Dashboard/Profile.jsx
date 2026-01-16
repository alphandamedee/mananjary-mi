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
  const [users, setUsers] = useState([]);
  const [relations, setRelations] = useState([]);
  const [showAddRelation, setShowAddRelation] = useState(false);
  const [relationType, setRelationType] = useState('');
  const [relationFormData, setRelationFormData] = useState({
    id_user2: '',
    type_relation: 'pere'
  });
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

  // Charger les utilisateurs et relations
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, relationsRes] = await Promise.all([
          api.get('/users'),
          api.get('/relations')
        ]);
        setUsers(usersRes.data);
        setRelations(relationsRes.data);
      } catch (err) {
        console.error('Erreur chargement données:', err);
      }
    };
    fetchData();
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

  const handleRelationSubmit = async (e) => {
    e.preventDefault();
    try {
      const currentUserId = parseInt(user?.id);
      const selectedUserId = parseInt(relationFormData.id_user2);

      // Validation
      if (!selectedUserId || isNaN(selectedUserId)) {
        setError('Veuillez sélectionner une personne');
        return;
      }

      if (!currentUserId || isNaN(currentUserId)) {
        setError('Erreur: utilisateur non connecté');
        return;
      }

      // Trouver les utilisateurs concernés
      const currentUserData = users.find(u => u.id === currentUserId);
      const selectedUserData = users.find(u => u.id === selectedUserId);

      // Validation de l'âge pour les relations parent-enfant
      if (relationType === 'parent') {
        // Le parent (selectedUser) doit être plus âgé que l'enfant (currentUser)
        if (selectedUserData?.annee_naissance && currentUserData?.annee_naissance) {
          if (selectedUserData.annee_naissance >= currentUserData.annee_naissance) {
            setError(`${selectedUserData.prenom} ${selectedUserData.nom} ne peut pas être votre parent car il/elle est né(e) en ${selectedUserData.annee_naissance}, vous êtes né(e) en ${currentUserData.annee_naissance}`);
            return;
          }
        }
      } else if (relationType === 'child') {
        // L'enfant (selectedUser) doit être plus jeune que le parent (currentUser)
        if (selectedUserData?.annee_naissance && currentUserData?.annee_naissance) {
          if (selectedUserData.annee_naissance <= currentUserData.annee_naissance) {
            setError(`${selectedUserData.prenom} ${selectedUserData.nom} ne peut pas être votre enfant car il/elle est né(e) en ${selectedUserData.annee_naissance}, vous êtes né(e) en ${currentUserData.annee_naissance}`);
            return;
          }
        }
      }

      let dataToSend = {};

      if (relationType === 'parent') {
        // Le parent sélectionné est user1, l'utilisateur courant est user2
        dataToSend = {
          id_user1: selectedUserId,
          id_user2: currentUserId,
          type_relation: relationFormData.type_relation
        };
      } else if (relationType === 'child') {
        // L'utilisateur courant est user1 (parent), l'enfant sélectionné est user2
        dataToSend = {
          id_user1: currentUserId,
          id_user2: selectedUserId,
          type_relation: relationFormData.type_relation
        };
      } else if (relationType === 'spouse') {
        // Pour le conjoint, l'utilisateur courant est user1
        dataToSend = {
          id_user1: currentUserId,
          id_user2: selectedUserId,
          type_relation: relationFormData.type_relation
        };
      }

      console.log('Sending relation data:', dataToSend);
      console.log('Type of id_user1:', typeof dataToSend.id_user1, 'Value:', dataToSend.id_user1);
      console.log('Type of id_user2:', typeof dataToSend.id_user2, 'Value:', dataToSend.id_user2);
      console.log('Type of type_relation:', typeof dataToSend.type_relation, 'Value:', dataToSend.type_relation);
      
      await api.post('/relations/', dataToSend);
      setMessage('Relation ajoutée avec succès!');
      setShowAddRelation(false);
      setRelationType('');
      setRelationFormData({ id_user2: '', type_relation: 'pere' });
      
      // Recharger les relations
      const relationsRes = await api.get('/relations');
      setRelations(relationsRes.data);
    } catch (err) {
      console.error('Error creating relation:', err);
      const errorMsg = err.response?.data?.detail;
      if (typeof errorMsg === 'string') {
        setError(errorMsg);
      } else if (Array.isArray(errorMsg)) {
        setError(errorMsg.map(e => e.msg || e).join(', '));
      } else {
        setError('Erreur lors de l\'ajout de la relation');
      }
    }
  };

  const handleDeleteRelation = async (relationId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette relation ?')) return;
    
    try {
      await api.delete(`/relations/${relationId}`);
      setMessage('Relation supprimée avec succès!');
      const relationsRes = await api.get('/relations');
      setRelations(relationsRes.data);
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const buildMyRelations = () => {
    if (!user) return { parents: [], children: [], spouse: null, siblings: [] };

    const userMap = {};
    users.forEach(u => {
      userMap[u.id] = {
        ...u,
        parents: [],
        children: [],
        spouse: null,
        siblings: []
      };
    });

    // Process relations
    relations.forEach(rel => {
      const user1 = userMap[rel.id_user1];
      const user2 = userMap[rel.id_user2];
      if (!user1 || !user2) return;

      switch(rel.type_relation) {
        case 'pere':
        case 'mere':
          user2.parents.push({ ...user1, relation_id: rel.id });
          user1.children.push({ ...user2, relation_id: rel.id });
          break;
        case 'fils':
        case 'fille':
          user1.parents.push({ ...user2, relation_id: rel.id });
          user2.children.push({ ...user1, relation_id: rel.id });
          break;
        case 'epoux':
        case 'epouse':
          user1.spouse = { ...user2, relation_id: rel.id };
          user2.spouse = { ...user1, relation_id: rel.id };
          break;
      }
    });

    // Detect siblings (people who share the same parents)
    Object.values(userMap).forEach(u => {
      if (u.parents.length > 0) {
        u.parents[0].children.forEach(child => {
          if (child.id !== u.id && !u.siblings.find(s => s.id === child.id)) {
            u.siblings.push(child);
          }
        });
      }
    });

    const currentUserData = userMap[user.user_id];
    return currentUserData || { parents: [], children: [], spouse: null, siblings: [] };
  };

  const getUserCard = (userData) => {
    if (!userData) return null;
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px',
        border: '2px solid #4a90e2',
        borderRadius: '8px',
        background: 'white',
        minWidth: '200px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid #4a90e2',
          flexShrink: 0
        }}>
          {userData.photo ? (
            <img src={`http://localhost:8000${userData.photo}`} alt={userData.prenom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontSize: '20px' }}>
              👤
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{userData.prenom} {userData.nom}</div>
          <div style={{ fontSize: '16px', color: '#4a90e2' }}>{userData.genre === 'H' ? '♂' : '♀'}</div>
        </div>
      </div>
    );
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
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
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
            </div>

            <div className="form-row">
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

      {/* Relations Familiales */}
      <div className="profile-card">
        <h2>👨‍👩‍👧‍👦 Relations Familiales</h2>
        
        {!showAddRelation ? (
          <>
            <div style={{ marginBottom: '20px' }}>
              <button 
                className="btn-primary" 
                onClick={() => setShowAddRelation(true)}
                style={{ width: '100%' }}
              >
                + Ajouter une relation familiale
              </button>
            </div>

            {(() => {
              const myRelations = buildMyRelations();
              const hasRelations = myRelations.parents.length > 0 || myRelations.siblings.length > 0 || 
                                   myRelations.spouse || myRelations.children.length > 0;

              if (!hasRelations) {
                return <p style={{ textAlign: 'center', color: '#999' }}>Aucune relation familiale enregistrée</p>;
              }

              return (
                <div style={{ display: 'grid', gap: '20px' }}>
                  {/* Parents */}
                  {myRelations.parents.length > 0 && (
                    <div>
                      <h4 style={{ marginBottom: '10px', color: '#555', borderBottom: '2px solid #4a90e2', paddingBottom: '5px' }}>
                        👨‍👦 Parents
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                        {myRelations.parents.map((parent) => (
                          <div key={parent.relation_id} style={{ position: 'relative' }}>
                            {getUserCard(parent.user)}
                            <button
                              onClick={() => handleDeleteRelation(parent.relation_id)}
                              style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                background: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '25px',
                                height: '25px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Frères et Sœurs */}
                  {myRelations.siblings.length > 0 && (
                    <div>
                      <h4 style={{ marginBottom: '10px', color: '#555', borderBottom: '2px solid #9b59b6', paddingBottom: '5px' }}>
                        👨‍👩‍👧‍👦 Frères et Sœurs
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                        {myRelations.siblings.map((sibling) => getUserCard(sibling))}
                      </div>
                    </div>
                  )}

                  {/* Conjoint(e) */}
                  {myRelations.spouse && (
                    <div>
                      <h4 style={{ marginBottom: '10px', color: '#555', borderBottom: '2px solid #e91e63', paddingBottom: '5px' }}>
                        💑 Conjoint(e)
                      </h4>
                      <div style={{ position: 'relative', maxWidth: '220px' }}>
                        {getUserCard(myRelations.spouse.user)}
                        <button
                          onClick={() => handleDeleteRelation(myRelations.spouse.relation_id)}
                          style={{
                            position: 'absolute',
                            top: '5px',
                            right: '5px',
                            background: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '25px',
                            height: '25px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Enfants */}
                  {myRelations.children.length > 0 && (
                    <div>
                      <h4 style={{ marginBottom: '10px', color: '#555', borderBottom: '2px solid #27ae60', paddingBottom: '5px' }}>
                        👶 Enfants
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                        {myRelations.children.map((child) => (
                          <div key={child.relation_id} style={{ position: 'relative' }}>
                            {getUserCard(child.user)}
                            <button
                              onClick={() => handleDeleteRelation(child.relation_id)}
                              style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                background: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '25px',
                                height: '25px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </>
        ) : (
          <div>
            {!relationType ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setRelationType('parent');
                    setRelationFormData({ id_user2: '', type_relation: 'pere' });
                  }}
                  style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
                >
                  <span style={{ fontSize: '30px' }}>👨‍👦</span>
                  <span>Mon parent</span>
                </button>
                
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setRelationType('child');
                    setRelationFormData({ id_user2: '', type_relation: 'fils' });
                  }}
                  style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
                >
                  <span style={{ fontSize: '30px' }}>👶</span>
                  <span>Mon enfant</span>
                </button>
                
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setRelationType('spouse');
                    setRelationFormData({ id_user2: '', type_relation: 'epoux' });
                  }}
                  style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
                >
                  <span style={{ fontSize: '30px' }}>💑</span>
                  <span>Mon conjoint</span>
                </button>
                
                <button
                  type="button"
                  style={{ padding: '20px', background: '#e0e0e0', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                  onClick={() => setShowAddRelation(false)}
                >
                  <span style={{ fontSize: '30px' }}>✕</span>
                  <span style={{ display: 'block' }}>Annuler</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleRelationSubmit}>
                <div style={{ marginBottom: '15px', padding: '10px', background: '#f0f7ff', borderRadius: '5px' }}>
                  {relationType === 'parent' && '👨‍👦 Vous ajoutez un de vos parents'}
                  {relationType === 'child' && '👶 Vous ajoutez un de vos enfants'}
                  {relationType === 'spouse' && '💑 Vous ajoutez votre conjoint(e)'}
                </div>

                <div className="form-group">
                  <label>
                    {relationType === 'parent' && 'Sélectionner votre parent *'}
                    {relationType === 'child' && 'Sélectionner votre enfant *'}
                    {relationType === 'spouse' && 'Sélectionner votre conjoint(e) *'}
                  </label>
                  <select
                    value={relationFormData.id_user2}
                    onChange={(e) => setRelationFormData(prev => ({ ...prev, id_user2: e.target.value }))}
                    required
                  >
                    <option value="">Sélectionner une personne</option>
                    {users.filter(u => u.id !== user?.user_id).map(u => (
                      <option key={u.id} value={u.id}>
                        {u.prenom} {u.nom} ({u.genre === 'H' ? '♂' : '♀'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Type de relation *</label>
                  <select
                    value={relationFormData.type_relation}
                    onChange={(e) => setRelationFormData(prev => ({ ...prev, type_relation: e.target.value }))}
                    required
                  >
                    {relationType === 'parent' && (
                      <>
                        <option value="pere">Père</option>
                        <option value="mere">Mère</option>
                      </>
                    )}
                    {relationType === 'child' && (
                      <>
                        <option value="fils">Fils</option>
                        <option value="fille">Fille</option>
                      </>
                    )}
                    {relationType === 'spouse' && (
                      <>
                        <option value="epoux">Époux</option>
                        <option value="epouse">Épouse</option>
                      </>
                    )}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn-primary">
                    ✓ Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRelationType('');
                      setRelationFormData({ id_user2: '', type_relation: 'pere' });
                    }}
                    style={{ padding: '10px 20px', background: '#e0e0e0', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    ← Retour
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Section changement de mot de passe */}
      <ChangePassword />
    </div>
  );
}
