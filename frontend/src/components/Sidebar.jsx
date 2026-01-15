import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Sidebar.css'

function Sidebar({ isOpen, toggleSidebar }) {
  const { user } = useAuth()
  
  const menuItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: '📊', roles: ['super_admin', 'admin', 'user'] },
    { path: '/dashboard/profile', label: 'Mon Profil', icon: '👤', roles: ['super_admin', 'admin', 'user'] },
    { path: '/dashboard/tragnobes', label: 'Tragnobes', icon: '🏘️', roles: ['super_admin'] },
    { path: '/dashboard/lohantragno', label: 'Lohantragno', icon: '📍', roles: ['super_admin', 'admin'] },
    { path: '/dashboard/members', label: 'Membres', icon: '👥', roles: ['super_admin', 'admin'] },
    { path: '/dashboard/relations', label: 'Arbre Généalogique', icon: '🌳', roles: ['super_admin', 'admin', 'user'] },
    { path: '/dashboard/cotisations', label: 'Cotisations', icon: '💰', roles: ['super_admin', 'admin'] },
    { path: '/dashboard/dons', label: 'Dons', icon: '🎁', roles: ['super_admin', 'admin'] },
    { path: '/dashboard/evenements', label: 'Événements', icon: '📅', roles: ['super_admin', 'admin', 'user'] },
    { path: '/dashboard/coutumes', label: 'Coutumes', icon: '🎭', roles: ['super_admin', 'admin', 'user'] },
    { path: '/dashboard/logs', label: 'Logs', icon: '📋', roles: ['super_admin', 'admin'] },
  ]

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    // If user is not loaded yet, show all items (will be filtered after login)
    if (!user?.user_type) return true
    return item.roles.includes(user.user_type)
  })

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar} />}
      
      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>🏛️ Mananjary-mi</h2>
        </div>

        <nav className="sidebar-nav">
          {filteredMenuItems.map((item) => (
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
