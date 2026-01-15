import { useState, useEffect } from 'react'
import api from '../../services/api'

function Coutumes() {
  const [coutumes, setCoutumes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCoutumes()
  }, [])

  const loadCoutumes = async () => {
    try {
      const response = await api.get('/coutumes')
      setCoutumes(response.data)
    } catch (error) {
      console.error('Error loading coutumes:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  return (
    <div>
      <h2>🎭 Gestion des Coutumes</h2>
      <p style={{ color: '#777', marginBottom: '20px' }}>
        Coutumes et traditions Antambahoaka
      </p>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Catégorie</th>
              <th>Périodicité</th>
              <th>Importance</th>
              <th>Description</th>
              <th>Date de création</th>
            </tr>
          </thead>
          <tbody>
            {coutumes.map((coutume) => (
              <tr key={coutume.id}>
                <td><strong>{coutume.nom}</strong></td>
                <td><span className="badge badge-success">{coutume.categorie}</span></td>
                <td>{coutume.periodicite}</td>
                <td>
                  <span className={`badge ${
                    coutume.importance === 'sacre' ? 'badge-danger' :
                    coutume.importance === 'eleve' ? 'badge-warning' :
                    'badge-success'
                  }`}>
                    {coutume.importance}
                  </span>
                </td>
                <td>{coutume.description}</td>
                <td>{new Date(coutume.date_creation).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {coutumes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Aucune coutume enregistrée
          </div>
        )}
      </div>
    </div>
  )
}

export default Coutumes
