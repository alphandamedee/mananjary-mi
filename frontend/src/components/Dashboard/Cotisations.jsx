import { useState, useEffect } from 'react'
import api from '../../services/api'

function Cotisations() {
  const [cotisations, setCotisations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCotisations()
  }, [])

  const loadCotisations = async () => {
    try {
      const response = await api.get('/cotisations')
      setCotisations(response.data)
    } catch (error) {
      console.error('Error loading cotisations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  return (
    <div>
      <h2>💰 Gestion des Cotisations</h2>
      <p style={{ color: '#777', marginBottom: '20px' }}>
        Suivi des cotisations des membres
      </p>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>ID Membre</th>
              <th>Montant (Ar)</th>
              <th>Type</th>
              <th>Moyen de paiement</th>
              <th>Date de paiement</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {cotisations.map((cotisation) => (
              <tr key={cotisation.id}>
                <td>#{cotisation.user_id}</td>
                <td><strong>{parseFloat(cotisation.montant).toLocaleString('fr-FR')} Ar</strong></td>
                <td>
                  <span className="badge badge-success">{cotisation.type_cotisation}</span>
                </td>
                <td>{cotisation.moyen_paiement}</td>
                <td>{new Date(cotisation.date_paiement).toLocaleDateString('fr-FR')}</td>
                <td>{cotisation.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {cotisations.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Aucune cotisation enregistrée
          </div>
        )}
      </div>
    </div>
  )
}

export default Cotisations
