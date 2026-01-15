import { useState, useEffect } from 'react'
import api from '../../services/api'

function Tragnobes() {
  const [tragnobes, setTragnobes] = useState([])
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  return (
    <div>
      <h2>🏘️ Gestion des Tragnobes</h2>
      <p style={{ color: '#777', marginBottom: '20px' }}>
        Gérer les clans familiaux Antambahoaka
      </p>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Chef</th>
              <th>Localisation</th>
              <th>Description</th>
              <th>Statut</th>
              <th>Date de création</th>
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
                <td>{new Date(tragnobe.date_creation).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Tragnobes
