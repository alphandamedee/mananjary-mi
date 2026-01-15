import { useState, useEffect, useContext } from 'react'
import api from '../../services/api'
import { AuthContext } from '../../contexts/AuthContext'

function Lohantragno() {
  const { user } = useContext(AuthContext)
  const [lohantragnoList, setLohantragnoList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    id_tragnobe: user?.id_tragnobe || null
  })

  useEffect(() => {
    if (user?.id_tragnobe) {
      loadLohantragno()
      setFormData(prev => ({ ...prev, id_tragnobe: user.id_tragnobe }))
    }
  }, [user])

  const loadLohantragno = async () => {
    setLoading(true)
    try {
      const tragnobeId = user?.id_tragnobe
      if (!tragnobeId) {
        console.error('Admin sans tragnobe')
        return
      }
      
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
      setFormData({
        nom: '',
        description: '',
        id_tragnobe: user?.id_tragnobe || null
      })
      loadLohantragno()
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
      loadLohantragno()
    } catch (error) {
      console.error('Error deleting lohantragno:', error)
      alert(error.response?.data?.detail || 'Erreur lors de la suppression')
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingId(null)
    setFormData({
      nom: '',
      description: '',
      id_tragnobe: user?.id_tragnobe || null
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
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lohantragnoList.map((loh) => (
                <tr key={loh.id}>
                  <td><strong>{loh.nom}</strong></td>
                  <td>{loh.description || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
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
