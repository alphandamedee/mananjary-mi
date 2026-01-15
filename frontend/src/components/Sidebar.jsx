import { NavLink } from 'react-router-dom'
import './Sidebar.css'

function Sidebar({ isOpen, toggleSidebar }) {
  const menuItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: '📊' },
    { path: '/dashboard/profile', label: 'Mon Profil', icon: '👤' },
    { path: '/dashboard/tragnobes', label: 'Tragnobes', icon: '🏘️' },
    { path: '/dashboard/members', label: 'Membres', icon: '👥' },
    { path: '/dashboard/cotisations', label: 'Cotisations', icon: '💰' },
    { path: '/dashboard/dons', label: 'Dons', icon: '🎁' },
    { path: '/dashboard/evenements', label: 'Événements', icon: '📅' },
    { path: '/dashboard/coutumes', label: 'Coutumes', icon: '🎭' },
    { path: '/dashboard/logs', label: 'Logs', icon: '📋' },
  ]

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar} />}
      
      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>🏛️ Mananjary-mi</h2>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              end={item.path === '/dashboard'}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
