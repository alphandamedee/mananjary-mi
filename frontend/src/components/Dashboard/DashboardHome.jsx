import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import './DashboardHome.css'

function DashboardHome() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMembers: 0,
    pendingMembers: 0,
    totalTragnobes: 0,
    totalCotisations: 0,
    totalDons: 0,
    totalEvenements: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [members, pending, tragnobes, cotisations, dons, evenements] = await Promise.all([
        api.get('/users'),
        api.get('/users/en-attente'),
        api.get('/tragnobes'),
        api.get('/cotisations'),
        api.get('/dons'),
        api.get('/evenements'),
      ])

      setStats({
        totalMembers: members.data.length,
        pendingMembers: pending.data.length,
        totalTragnobes: tragnobes.data.length,
        totalCotisations: cotisations.data.length,
        totalDons: dons.data.length,
        totalEvenements: evenements.data.length,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  return (
    <div className="dashboard-home">
      <h2>Tableau de bord</h2>
      <p className="subtitle">Vue d'ensemble de la plateforme</p>

      <div className="stats-grid">
        <div className="stat-card clickable" onClick={() => navigate('/dashboard/members')} title="Voir les membres">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalMembers}</h3>
            <p>Membres total</p>
          </div>
        </div>

        <div className="stat-card warning clickable" onClick={() => navigate('/dashboard/members?filter=pending')} title="Voir les membres en attente">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingMembers}</h3>
            <p>En attente</p>
          </div>
        </div>

        <div className="stat-card clickable" onClick={() => navigate('/dashboard/tragnobes')} title="Voir les tragnobes">
          <div className="stat-icon">🏘️</div>
          <div className="stat-content">
            <h3>{stats.totalTragnobes}</h3>
            <p>Tragnobes</p>
          </div>
        </div>

        <div className="stat-card success clickable" onClick={() => navigate('/dashboard/cotisations')} title="Voir les cotisations">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{stats.totalCotisations}</h3>
            <p>Cotisations</p>
          </div>
        </div>

        <div className="stat-card clickable" onClick={() => navigate('/dashboard/dons')} title="Voir les dons">
          <div className="stat-icon">🎁</div>
          <div className="stat-content">
            <h3>{stats.totalDons}</h3>
            <p>Dons</p>
          </div>
        </div>

        <div className="stat-card clickable" onClick={() => navigate('/dashboard/evenements')} title="Voir les événements">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.totalEvenements}</h3>
            <p>Événements</p>
          </div>
        </div>
      </div>

      <div className="dashboard-info">
        <div className="card">
          <h3>🎉 Bienvenue sur Mananjary-mi</h3>
          <p>
            Plateforme de gestion communautaire pour Mananjary.
            Gérez les membres, tragnobes, cotisations, dons, événements et coutumes.
          </p>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome
