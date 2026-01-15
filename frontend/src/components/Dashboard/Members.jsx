import { useState, useEffect, useContext } from 'react'
import api from '../../services/api'
import { AuthContext } from '../../contexts/AuthContext'

function Members() {
  const { user } = useContext(AuthContext)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [lohantragnoList, setLohantragnoList] = useState([])
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    mot_de_passe: '',
    genre: 'H',
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/users/', formData)
      alert('Membre ajouté avec succès!')
      setShowAddForm(false)
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        mot_de_passe: '',
        genre: 'H',
        adresse: '',
        ville: '',
        id_tragnobe: user?.id_tragnobe || null,
        id_lohantragno: null,
        id_role: 3
      })
      loadMembers()
    } catch (error) {
      console.error('Error creating member:', error)
      alert(error.response?.data?.detail || 'Erreur lors de la création du membre')
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
          <button
            className="btn btn-success"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? '✕ Annuler' : '+ Ajouter un membre'}
          </button>
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

      <div className="card"
        <table className="table">
          <thead>
            <tr>
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
                <td>{member.nom}</td>
                <td>{member.prenom}</td>
                <td>{member.email}</td>
                <td>{member.telephone}</td>
                <td>
                  <span className={`badge ${getStatusBadge(member.statut)}`}>
                    {member.statut}
                  </span>
                </td>
                <td>{new Date(member.date_inscription).toLocaleDateString('fr-FR')}</td>
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
  )
}

export default Members
