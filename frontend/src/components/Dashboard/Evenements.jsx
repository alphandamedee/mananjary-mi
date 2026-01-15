import { useState, useEffect } from 'react'
import api from '../../services/api'

function Evenements() {
  const [evenements, setEvenements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvenements()
  }, [])

  const loadEvenements = async () => {
    try {
      const response = await api.get('/evenements')
      setEvenements(response.data)
    } catch (error) {
      console.error('Error loading evenements:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  return (
    <div>
      <h2>📅 Gestion des Événements</h2>
      <p style={{ color: '#777', marginBottom: '20px' }}>
        Événements et annonces communautaires
      </p>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Type</th>
              <th>Date</th>
              <th>Lieu</th>
              <th>Participants attendus</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {evenements.map((event) => (
              <tr key={event.id}>
                <td><strong>{event.titre}</strong></td>
                <td><span className="badge badge-success">{event.type}</span></td>
                <td>{new Date(event.date_evenement).toLocaleDateString('fr-FR')}</td>
                <td>{event.lieu || '-'}</td>
                <td>{event.participants_attendus || '-'}</td>
                <td>{event.description || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {evenements.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Aucun événement enregistré
          </div>
        )}
      </div>
    </div>
  )
}

export default Evenements
