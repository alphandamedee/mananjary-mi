import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from '../components/Sidebar'
import DashboardHome from '../components/Dashboard/DashboardHome'
import Tragnobes from '../components/Dashboard/Tragnobes'
import Members from '../components/Dashboard/Members'
import Cotisations from '../components/Dashboard/Cotisations'
import Dons from '../components/Dashboard/Dons'
import Evenements from '../components/Dashboard/Evenements'
import Coutumes from '../components/Dashboard/Coutumes'
import Logs from '../components/Dashboard/Logs'
import Lohantragno from '../components/Dashboard/Lohantragno'
import Relations from '../components/Dashboard/Relations'
import Profile from '../components/Dashboard/Profile'
import './Dashboard.css'

function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [photoError, setPhotoError] = useState(false)

  useEffect(() => {
    setPhotoError(false)
  }, [user?.photo])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getPhotoUrl = (photo) => {
    if (!photo) return null
    if (photo.startsWith('http')) return photo
    return `http://localhost:8000/${photo}`
  }

  const hasValidPhoto = !!user?.photo && !['null', 'None', 'undefined', ''].includes(user.photo)
  const photoUrl = hasValidPhoto ? getPhotoUrl(user.photo) : null

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <header className="dashboard-header">
          <div className="header-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>
            <h1>Mananjary-mi</h1>
          </div>
          
          <div className="header-right">
            <div className="user-profile-header">
              <div className="user-avatar-small">
                {photoUrl && !photoError ? (
                  <img
                    src={photoUrl}
                    alt={user?.prenom || 'Avatar'}
                    onError={() => setPhotoError(true)}
                  />
                ) : (
                  <div className="avatar-placeholder-small">
                    👤
                  </div>
                )}
              </div>
              <div className="user-info">
                <span className="user-name">
                  {user?.prenom ? `${user.prenom} ${user.nom}` : user?.nom}
                </span>
                <span className={`user-role badge ${
                  user?.user_type === 'super_admin' ? 'badge-danger' : 
                  user?.user_type === 'admin' ? 'badge-primary' : 
                  'badge-success'
                }`}>
                  {user?.user_type === 'super_admin' && 'Super Admin'}
                  {user?.user_type === 'admin' && 'Admin'}
                  {user?.user_type === 'user' && 'Membre'}
                </span>
              </div>
            </div>
            <button className="btn-logout-icon" onClick={handleLogout} title="Déconnexion">
              🔴
            </button>
          </div>
        </header>

        <main className="dashboard-content">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/tragnobes" element={<Tragnobes />} />
            <Route path="/lohantragno" element={<Lohantragno />} />
            <Route path="/members" element={<Members />} />
            <Route path="/relations" element={<Relations />} />
            <Route path="/cotisations" element={<Cotisations />} />
            <Route path="/dons" element={<Dons />} />
            <Route path="/evenements" element={<Evenements />} />
            <Route path="/coutumes" element={<Coutumes />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
