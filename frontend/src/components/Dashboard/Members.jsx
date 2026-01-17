import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import defaultAvatar from '../../img/profil homme.jpg'

function Members() {
  const { user } = useAuth()
  const canManageMembers = user?.user_type === 'admin' || user?.user_type === 'super_admin' || user?.role_id === 1 || user?.role_id === 2
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [lohantragnoList, setLohantragnoList] = useState([])
  const [relationUsers, setRelationUsers] = useState([])
  const [relationData, setRelationData] = useState({
    targetUserId: '',
    type_relation: ''
  })
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    mot_de_passe: '',
    genre: 'H',
    annee_naissance: '',
    adresse: '',
    ville: '',
    id_tragnobe: user?.id_tragnobe || null,
    id_lohantragno: null,
    id_role: 3 // Membre par défaut
  })

  useEffect(() => {
    loadMembers()
  }, [filter])

  useEffect(() => {
    // Charger les lohantragno du tragnobe de l'admin
    if (user?.id_tragnobe) {
      loadLohantragno(user.id_tragnobe)
      setFormData(prev => ({ ...prev, id_tragnobe: user.id_tragnobe }))
    }
  }, [user])

  useEffect(() => {
    const loadRelationUsers = async () => {
      if (!formData.id_tragnobe) {
        setRelationUsers([])
        return
      }
      try {
        const response = await api.get(`/users?id_tragnobe=${formData.id_tragnobe}`)
        setRelationUsers(response.data)
      } catch (error) {
        console.error('Error loading relation users:', error)
        setRelationUsers([])
      }
    }

    loadRelationUsers()
  }, [formData.id_tragnobe])

  const loadLohantragno = async (tragnobeId) => {
    try {
      const response = await api.get(`/lohantragno/by-tragnobe/${tragnobeId}`)
      setLohantragnoList(response.data)
    } catch (error) {
      console.error('Error loading lohantragno:', error)
    }
  }

  const loadMembers = async () => {
    setLoading(true)
    try {
      let url = '/users'
      
      // Si l'utilisateur est admin, filtrer par son tragnobe
      if (user?.acteur_type === 'admin' && user?.id_tragnobe) {
        url = `/users?id_tragnobe=${user.id_tragnobe}`
      }
      
      if (filter === 'pending') url = url.includes('?') ? `${url}&statut=en_attente` : '/users/en-attente'
      if (filter === 'validated') url = url.includes('?') ? `${url}&statut=valide` : '/users/valides'
      
      const response = await api.get(url)
      setMembers(response.data)
    } catch (error) {
      console.error('Error loading members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = async (id) => {
    try {
      await api.post(`/users/${id}/valider`)
      loadMembers()
    } catch (error) {
      console.error('Error validating member:', error)
    }
  }

  const handleReject = async (id) => {
    try {
      await api.post(`/users/${id}/rejeter`)
      loadMembers()
    } catch (error) {
      console.error('Error rejecting member:', error)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      valide: 'badge-success',
      en_attente: 'badge-warning',
      rejete: 'badge-danger',
    }
    return badges[status] || 'badge-warning'
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('fr-FR');
    } catch (e) {
      return '-';
    }
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>👥 Gestion des membres</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {canManageMembers && (
            <button
              className="btn btn-success"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? '✕ Annuler' : '+ Ajouter un membre'}
            </button>
          )}
          <button
            className={`btn ${filter === 'all' ? 'btn-primary' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tous
          </button>
          <button
            className={`btn ${filter === 'pending' ? 'btn-primary' : ''}`}
            onClick={() => setFilter('pending')}
          >
            En attente
          </button>
          <button
            className={`btn ${filter === 'validated' ? 'btn-primary' : ''}`}
            onClick={() => setFilter('validated')}
          >
            Validés
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Ajouter un nouveau membre</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Prénom *</label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Téléphone *</label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Mot de passe *</label>
                <input
                  type="password"
                  name="mot_de_passe"
                  value={formData.mot_de_passe}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Genre *</label>
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                >
                  <option value="H">Homme</option>
                  <option value="F">Femme</option>
                </select>
              </div>

              <div className="form-group">
                <label>Année de naissance *</label>
                <input
                  type="number"
                  name="annee_naissance"
                  value={formData.annee_naissance}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Lohantragno</label>
                <select
                  name="id_lohantragno"
                  value={formData.id_lohantragno || ''}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="">Sélectionner un lohantragno</option>
                  {lohantragnoList.map(loh => (
                    <option key={loh.id} value={loh.id}>
                      {loh.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Ville</label>
                <input
                  type="text"
                  name="ville"
                  value={formData.ville}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Adresse</label>
                <textarea
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>Créer une relation (même tragnobe)</label>
                <select
                  name="relation_target"
                  value={relationData.targetUserId}
                  onChange={(e) => setRelationData(prev => ({ ...prev, targetUserId: e.target.value }))}
                  className="form-control"
                >
                  <option value="">Aucune relation</option>
                  {relationUsers
                    .filter(u => u.id !== user?.id)
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.prenom} {u.nom}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label>Type de relation</label>
                <select
                  name="type_relation"
                  value={relationData.type_relation}
                  onChange={(e) => setRelationData(prev => ({ ...prev, type_relation: e.target.value }))}
                  className="form-control"
                  disabled={!relationData.targetUserId}
                >
                  <option value="">Sélectionner</option>
                  <option value="pere">Père</option>
                  <option value="mere">Mère</option>
                  <option value="fils">Fils</option>
                  <option value="fille">Fille</option>
                  <option value="epoux">Époux</option>
                  <option value="epouse">Épouse</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">
                Enregistrer
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setShowAddForm(false)}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Statut</th>
              <th>Date d'inscription</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td>
                  <img
                    src={member.photo_profil && member.photo_profil !== '/uploads/photos/' ? `http://localhost:8000${member.photo_profil}` : defaultAvatar}
                    alt={member.photo_profil && member.photo_profil !== '/uploads/photos/' ? `${member.prenom} ${member.nom}` : 'Avatar par défaut'}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      backgroundColor: '#e0e0e0',
                      display: 'block'
                    }}
                  />
                </td>
                <td>{member.nom}</td>
                <td>{member.prenom}</td>
                <td>{member.email}</td>
                <td>{member.telephone}</td>
                <td>
                  <span className={`badge ${getStatusBadge(member.statut)}`}>
                    {member.statut}
                  </span>
                </td>
                <td>{formatDate(member.created_at)}</td>
                <td>
                  {member.statut === 'en_attente' && (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        className="btn btn-success"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                        onClick={() => handleValidate(member.id)}
                      >
                        ✓ Valider
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                        onClick={() => handleReject(member.id)}
                      >
                        ✗ Rejeter
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {members.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Aucun membre trouvé
          </div>
        )}
      </div>
    </div>
  );
}

export default Members