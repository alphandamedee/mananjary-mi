import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

function Lohantragno() {
  const { user } = useAuth()
  const [lohantragnoList, setLohantragnoList] = useState([])
  const [tragnobeList, setTragnobeList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    id_tragnobe: user?.id_tragnobe || null
  })

  useEffect(() => {
    loadTragnobes()
    // Super admin et admin peuvent voir tous les lohantragno
    if (user?.user_type === 'super_admin') {
      loadAllLohantragno()
    } else if (user?.user_type === 'admin' && user?.id_tragnobe) {
      loadAllLohantragno() // Admin peut voir tous les lohantragno
      setFormData(prev => ({ ...prev, id_tragnobe: user.id_tragnobe }))
    }
  }, [user])

  const loadTragnobes = async () => {
    try {
      const response = await api.get('/tragnobes')
      setTragnobeList(response.data)
    } catch (error) {
      console.error('Error loading tragnobes:', error)
    }
  }

  const loadAllLohantragno = async () => {
    setLoading(true)
    try {
      const response = await api.get('/lohantragno/')
      setLohantragnoList(response.data)
    } catch (error) {
      console.error('Error loading all lohantragno:', error)
      alert(error.response?.data?.detail || 'Erreur lors du chargement des lohantragno')
    } finally {
      setLoading(false)
    }
  }

  const loadLohantragno = async (tragnobeId) => {
    if (!tragnobeId) {
      setLohantragnoList([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await api.get(`/lohantragno/by-tragnobe/${tragnobeId}`)
      setLohantragnoList(response.data)
    } catch (error) {
      console.error('Error loading lohantragno:', error)
    } finally {
      setLoading(false)
    }
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
      if (editingId) {
        await api.put(`/lohantragno/${editingId}`, formData)
        alert('Lohantragno modifié avec succès!')
      } else {
        await api.post('/lohantragno/', formData)
        alert('Lohantragno ajouté avec succès!')
      }
      
      setShowAddForm(false)
      setEditingId(null)
      
      // Réinitialiser le formulaire
      const defaultTragnobeId = user?.user_type === 'admin' ? user.id_tragnobe : null
      setFormData({
        nom: '',
        description: '',
        id_tragnobe: defaultTragnobeId
      })
      
      // Recharger tous les lohantragno
      loadAllLohantragno()
    } catch (error) {
      console.error('Error saving lohantragno:', error)
      alert(error.response?.data?.detail || 'Erreur lors de l\'enregistrement')
    }
  }

  const handleEdit = (lohantragno) => {
    setEditingId(lohantragno.id)
    setFormData({
      nom: lohantragno.nom,
      description: lohantragno.description || '',
      id_tragnobe: lohantragno.id_tragnobe
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce lohantragno ?')) {
      return
    }

    try {
      await api.delete(`/lohantragno/${id}`)
      alert('Lohantragno supprimé avec succès!')
      loadAllLohantragno()
    } catch (error) {
      console.error('Error deleting lohantragno:', error)
      alert(error.response?.data?.detail || 'Erreur lors de la suppression')
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingId(null)
    const defaultTragnobeId = user?.user_type === 'admin' ? user.id_tragnobe : null
    setFormData({
      nom: '',
      description: '',
      id_tragnobe: defaultTragnobeId
    })
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>📍 Gestion des Lohantragno</h2>
        <button
          className="btn btn-success"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '✕ Annuler' : '+ Ajouter un lohantragno'}
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>{editingId ? 'Modifier le lohantragno' : 'Ajouter un nouveau lohantragno'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tragnobe *</label>
              <select
                name="id_tragnobe"
                value={formData.id_tragnobe || ''}
                onChange={handleInputChange}
                required
                className="form-control"
                disabled={user?.user_type === 'admin'}
              >
                <option value="">Sélectionner un tragnobe</option>
                {tragnobeList.map(tragnobe => {
                  // Admin peut seulement voir son propre tragnobe dans la liste
                  if (user?.user_type === 'admin' && tragnobe.id !== user.id_tragnobe) {
                    return null
                  }
                  return (
                    <option key={tragnobe.id} value={tragnobe.id}>
                      {tragnobe.nom}
                    </option>
                  )
                })}
              </select>
              {user?.user_type === 'admin' && (
                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                  Vous pouvez uniquement ajouter des lohantragno à votre tragnobe : {tragnobeList.find(t => t.id === user.id_tragnobe)?.nom}
                </small>
              )}
              {user?.user_type === 'super_admin' && (
                <small style={{ color: '#4a90e2', marginTop: '5px', display: 'block' }}>
                  En tant que super admin, vous pouvez ajouter des lohantragno à n'importe quel tragnobe
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Nom *</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                required
                className="form-control"
                placeholder="Nom du lohantragno"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-control"
                rows="3"
                placeholder="Description du lohantragno (optionnel)"
              />
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
        {lohantragnoList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Aucun lohantragno trouvé. Commencez par en ajouter un.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Tragnobe</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lohantragnoList.map((loh) => (
                <tr key={loh.id}>
                  <td><strong>{loh.nom}</strong></td>
                  <td>
                    {tragnobeList.find(t => t.id === loh.id_tragnobe)?.nom || `ID: ${loh.id_tragnobe}`}
                  </td>
                  <td>{loh.description || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {/* Super admin peut tout modifier */}
                      {user?.user_type === 'super_admin' && (
                        <>
                          <button
                            className="btn btn-primary"
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                            onClick={() => handleEdit(loh)}
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                            onClick={() => handleDelete(loh.id)}
                          >
                            🗑️ Supprimer
                          </button>
                        </>
                      )}
                      {/* Admin peut modifier seulement son tragnobe */}
                      {user?.user_type === 'admin' && loh.id_tragnobe === user.id_tragnobe && (
                        <>
                          <button
                            className="btn btn-primary"
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                            onClick={() => handleEdit(loh)}
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                            onClick={() => handleDelete(loh.id)}
                          >
                            🗑️ Supprimer
                          </button>
                        </>
                      )}
                      {/* Admin ne peut pas modifier les autres tragnobes */}
                      {user?.user_type === 'admin' && loh.id_tragnobe !== user.id_tragnobe && (
                        <span style={{ color: '#999', fontSize: '12px', fontStyle: 'italic' }}>
                          Lecture seule
                        </span>
                      )}
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

export default Lohantragno
