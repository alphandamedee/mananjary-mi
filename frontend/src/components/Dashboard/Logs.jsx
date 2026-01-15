import { useState, useEffect } from 'react'
import api from '../../services/api'

function Logs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    try {
      const response = await api.get('/logs/recent')
      setLogs(response.data)
    } catch (error) {
      console.error('Error loading logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActorBadge = (actorType) => {
    const badges = {
      super_admin: 'badge-danger',
      admin: 'badge-warning',
      user: 'badge-success',
      system: 'badge-info',
    }
    return badges[actorType] || 'badge-success'
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  return (
    <div>
      <h2>📋 Journal d'activités</h2>
      <p style={{ color: '#777', marginBottom: '20px' }}>
        Suivi des actions sur la plateforme
      </p>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Type d'acteur</th>
              <th>ID Acteur</th>
              <th>Action</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>
                  <span className={`badge ${getActorBadge(log.acteur_type)}`}>
                    {log.acteur_type}
                  </span>
                </td>
                <td>#{log.acteur_id}</td>
                <td>{log.action}</td>
                <td>{new Date(log.date_action).toLocaleString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Aucune activité enregistrée
          </div>
        )}
      </div>
    </div>
  )
}

export default Logs
