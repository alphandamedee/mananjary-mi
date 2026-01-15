import { useState, useEffect } from 'react'
import api from '../../services/api'

function Tragnobes() {
  const [tragnobes, setTragnobes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    nom: '',
    nom_chef: '',
    localisation: '',
    description: '',
    actif: true
  })

  useEffect(() => {
    loadTragnobes()
  }, [])

  const loadTragnobes = async () => {
    try {
      const response = await api.get('/tragnobes')
      setTragnobes(response.data)
    } catch (error) {
      console.error('Error loading tragnobes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.put(`/tragnobes/${editingId}`, formData)
        alert('Tragnobe modifié avec succès!')
      } else {
        await api.post('/tragnobes/', formData)
        alert('Tragnobe ajouté avec succès!')
      }
      
      setShowAddForm(false)
      setEditingId(null)
      setFormData({
        nom: '',
        nom_chef: '',
        localisation: '',
        description: '',
        actif: true
      })
      loadTragnobes()
    } catch (error) {
      console.error('Error saving tragnobe:', error)
      alert(error.response?.data?.detail || 'Erreur lors de l\'enregistrement')
    }
  }

  const handleEdit = (tragnobe) => {
    setEditingId(tragnobe.id)
    setFormData({
      nom: tragnobe.nom,
      nom_chef: tragnobe.nom_chef || '',
      localisation: tragnobe.localisation || '',
      description: tragnobe.description || '',
      actif: tragnobe.actif
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce tragnobe ?')) {
      return
    }

    try {
      await api.delete(`/tragnobes/${id}`)
      alert('Tragnobe supprimé avec succès!')
      loadTragnobes()
    } catch (error) {
      console.error('Error deleting tragnobe:', error)
      alert(error.response?.data?.detail || 'Erreur lors de la suppression')
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingId(null)
    setFormData({
      nom: '',
      nom_chef: '',
      localisation: '',
      description: '',
      actif: true
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '-'
      return date.toLocaleDateString('fr-FR')
    } catch {
      return '-'
    }
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>🏘️ Gestion des Tragnobes</h2>
          <p style={{ color: '#777', marginBottom: '0' }}>
            Gérer les clans familiaux Antambahoaka
          </p>
        </div>
        <button
          className="btn btn-success"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '✕ Annuler' : '+ Ajouter un tragnobe'}
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>{editingId ? 'Modifier le tragnobe' : 'Ajouter un nouveau tragnobe'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Nom du tragnobe *</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="Ex: Anteony"
                />
              </div>

              <div className="form-group">
                <label>Nom du chef</label>
                <input
                  type="text"
                  name="nom_chef"
                  value={formData.nom_chef}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Nom du chef du tragnobe"
                />
              </div>

              <div className="form-group">
                <label>Localisation</label>
                <input
                  type="text"
                  name="localisation"
                  value={formData.localisation}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Ex: Mananjary, Madagascar"
                />
              </div>

              <div className="form-group">
                <label>Statut</label>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                  <input
                    type="checkbox"
                    name="actif"
                    checked={formData.actif}
                    onChange={handleInputChange}
                    style={{ marginRight: '8px', width: 'auto' }}
                  />
                  <span>Actif</span>
                </div>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                  placeholder="Description du tragnobe (optionnel)"
                />
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Modifier' : 'Enregistrer'}
              </button>
              <button
                type="button"
                className="btn"
                onClick={handleCancel}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {tragnobes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Aucun tragnobe trouvé. Commencez par en ajouter un.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Chef</th>
                <th>Localisation</th>
                <th>Description</th>
                <th>Statut</th>
                <th>Date de création</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tragnobes.map((tragnobe) => (
                <tr key={tragnobe.id}>
                  <td><strong>{tragnobe.nom}</strong></td>
                  <td>{tragnobe.nom_chef || '-'}</td>
                  <td>{tragnobe.localisation || '-'}</td>
                  <td>{tragnobe.description || '-'}</td>
                  <td>
                    <span className={`badge ${tragnobe.actif ? 'badge-success' : 'badge-danger'}`}>
                      {tragnobe.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td>{formatDate(tragnobe.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                        onClick={() => handleEdit(tragnobe)}
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                        onClick={() => handleDelete(tragnobe.id)}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Tragnobes
