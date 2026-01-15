import { useState, useEffect } from 'react'
import api from '../../services/api'

function Dons() {
  const [dons, setDons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDons()
  }, [])

  const loadDons = async () => {
    try {
      const response = await api.get('/dons')
      setDons(response.data)
    } catch (error) {
      console.error('Error loading dons:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  return (
    <div>
      <h2>🎁 Gestion des Dons</h2>
      <p style={{ color: '#777', marginBottom: '20px' }}>
        Suivi des dons volontaires
      </p>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Donateur</th>
              <th>Montant (Ar)</th>
              <th>Type</th>
              <th>Date du don</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {dons.map((don) => (
              <tr key={don.id}>
                <td>
                  {don.anonyme ? (
                    <em>Anonyme</em>
                  ) : (
                    don.nom_donateur || `#${don.user_id}` || '-'
                  )}
                </td>
                <td><strong>{parseFloat(don.montant).toLocaleString('fr-FR')} Ar</strong></td>
                <td><span className="badge badge-success">{don.type_don}</span></td>
                <td>{new Date(don.date_don).toLocaleDateString('fr-FR')}</td>
                <td>{don.description || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {dons.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Aucun don enregistré
          </div>
        )}
      </div>
    </div>
  )
}

export default Dons
