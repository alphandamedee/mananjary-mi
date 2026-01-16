import { useState, useEffect } from 'react'
import api from '../../services/api'

function Tragnobes() {
  const [tragnobes, setTragnobes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showHistorique, setShowHistorique] = useState(null)
  const [historique, setHistorique] = useState([])
  const [formData, setFormData] = useState({
    nom: '',
    ampanjaka: '',
    lefitra: '',
    localisation: '',
    description: '',
    date_debut: '',
    date_fin: ''
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

  const loadHistorique = async (tragnobeId) => {
    try {
      const response = await api.get(`/tragnobes/${tragnobeId}/historique`)
      setHistorique(response.data)
      setShowHistorique(tragnobeId)
    } catch (error) {
      console.error('Error loading historique:', error)
      alert('Erreur lors du chargement de l\'historique')
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
      const payload = {
        ...formData,
        ampanjaka: formData.ampanjaka || null,
        lefitra: formData.lefitra || null,
        localisation: formData.localisation || null,
        description: formData.description || null,
        date_debut: formData.date_debut || null,
        date_fin: formData.date_fin || null,
      }
      if (editingId) {
        await api.put(`/tragnobes/${editingId}`, payload)
        alert('Tragnobe modifié avec succès!')
      } else {
        await api.post('/tragnobes/', payload)
        alert('Tragnobe ajouté avec succès!')
      }
      
      setShowAddForm(false)
      setEditingId(null)
      setFormData({
        nom: '',
        ampanjaka: '',
        lefitra: '',
        localisation: '',
        description: '',
        date_debut: '',
        date_fin: ''
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
      ampanjaka: tragnobe.ampanjaka || '',
      lefitra: tragnobe.lefitra || '',
      localisation: tragnobe.localisation || '',
      description: tragnobe.description || '',
      date_debut: tragnobe.date_debut || '',
      date_fin: tragnobe.date_fin || ''
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
      ampanjaka: '',
      lefitra: '',
      localisation: '',
      description: '',
      date_debut: '',
      date_fin: ''
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
                <label>Ampanjaka (Chef)</label>
                <input
                  type="text"
                  name="ampanjaka"
                  value={formData.ampanjaka}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Nom de l'Ampanjaka"
                />
              </div>

              <div className="form-group">
                <label>Lefitra (Adjoint)</label>
                <input
                  type="text"
                  name="lefitra"
                  value={formData.lefitra}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Nom du Lefitra"
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
                <label>Date début règne</label>
                <input
                  type="date"
                  name="date_debut"
                  value={formData.date_debut}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Date fin règne</label>
                <input
                  type="date"
                  name="date_fin"
                  value={formData.date_fin}
                  onChange={handleInputChange}
                  className="form-control"
                />
                <small style={{ color: '#777' }}>Laisser vide si en cours</small>
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
                <th>Ampanjaka</th>
                <th>Lefitra</th>
                <th>Localisation</th>
                <th>Période règne</th>
                <th>Date de création</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tragnobes.map((tragnobe) => (
                <tr key={tragnobe.id}>
                  <td><strong>{tragnobe.nom}</strong></td>
                  <td>{tragnobe.ampanjaka || '-'}</td>
                  <td>{tragnobe.lefitra || '-'}</td>
                  <td>{tragnobe.localisation || '-'}</td>
                  <td>
                    {tragnobe.date_debut ? (
                      <>
                        {formatDate(tragnobe.date_debut)}
                        {tragnobe.date_fin ? (
                          <> → {formatDate(tragnobe.date_fin)}</>
                        ) : (
                          <span style={{ color: 'green', fontWeight: 'bold' }}> → En cours</span>
                        )}
                      </>
                    ) : '-'}
                  </td>
                  <td>{formatDate(tragnobe.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                        onClick={() => handleEdit(tragnobe)}
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        className="btn btn-info"
                        style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#17a2b8', color: 'white' }}
                        onClick={() => loadHistorique(tragnobe.id)}
                      >
                        📜 Historique
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

      {/* Modal Historique */}
      {showHistorique && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ 
            maxWidth: '800px', 
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>📜 Historique des Ampanjaka</h3>
              <button
                className="btn"
                onClick={() => setShowHistorique(null)}
                style={{ padding: '5px 15px' }}
              >
                ✕
              </button>
            </div>
            
            {historique.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                Aucun historique disponible
              </p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Ampanjaka</th>
                    <th>Lefitra</th>
                    <th>Date début</th>
                    <th>Date fin</th>
                    <th>Raison fin</th>
                  </tr>
                </thead>
                <tbody>
                  {historique.map((h) => (
                    <tr key={h.id}>
                      <td><strong>{h.ampanjaka}</strong></td>
                      <td>{h.lefitra || '-'}</td>
                      <td>{formatDate(h.date_debut)}</td>
                      <td>{h.date_fin ? formatDate(h.date_fin) : <span style={{ color: 'green' }}>En cours</span>}</td>
                      <td>{h.raison_fin || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Tragnobes
