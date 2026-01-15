import { useState, useEffect } from 'react'
import api from '../../services/api'

function Members() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadMembers()
  }, [filter])

  const loadMembers = async () => {
    setLoading(true)
    try {
      let url = '/users'
      if (filter === 'pending') url = '/users/en-attente'
      if (filter === 'validated') url = '/users/valides'
      
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

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>👥 Gestion des membres</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
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

      <div className="card">
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
