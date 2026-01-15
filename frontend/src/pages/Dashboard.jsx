import { useState } from 'react'
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
import Profile from '../components/Dashboard/Profile'
import './Dashboard.css'

function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getPhotoUrl = (photo) => {
    if (!photo) return null
    if (photo.startsWith('http')) return photo
    return `http://localhost:8000/${photo}`
  }

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
                {user?.photo ? (
                  <img src={getPhotoUrl(user.photo)} alt={user.prenom} />
                ) : (
                  <div className="avatar-placeholder-small">
                    {user?.prenom?.[0]}{user?.nom?.[0]}
                  </div>
                )}
              </div>
              <div className="user-info">
                <span className="user-name">
                  {user?.prenom ? `${user.prenom} ${user.nom}` : user?.nom}
                </span>
                <span className="user-role badge badge-success">
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
            <Route path="/members" element={<Members />} />
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
