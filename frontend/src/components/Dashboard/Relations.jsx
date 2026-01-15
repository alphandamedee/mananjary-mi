import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import './Relations.css'

function Relations() {
  const { user } = useAuth()
  const [relations, setRelations] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('tree') // 'tree' or 'table'

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [relationsRes, usersRes] = await Promise.all([
        api.get('/relations'),
        api.get('/users')
      ])
      setRelations(relationsRes.data)
      setUsers(usersRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette relation ?')) {
      return
    }

    try {
      await api.delete(`/relations/${id}`)
      alert('Relation supprimée avec succès!')
      loadData()
    } catch (error) {
      console.error('Error deleting relation:', error)
      alert(error.response?.data?.detail || 'Erreur lors de la suppression')
    }
  }

  const getUserName = (userId) => {
    const foundUser = users.find(u => u.id === userId)
    return foundUser ? `${foundUser.prenom} ${foundUser.nom}` : `ID: ${userId}`
  }

  const getRelationLabel = (type) => {
    const labels = {
      pere: 'Père',
      mere: 'Mère',
      fils: 'Fils',
      fille: 'Fille',
      epoux: 'Époux',
      epouse: 'Épouse'
    }
    return labels[type] || type
  }

  // Build family tree structure centered on current user
  const buildFamilyTree = () => {
    const userMap = {}
    
    // Create user map
    users.forEach(u => {
      userMap[u.id] = {
        ...u,
        parents: [],
        children: [],
        spouse: null,
        siblings: []
      }
    })

    // Process relations
    relations.forEach(rel => {
      const user1 = userMap[rel.id_user1]
      const user2 = userMap[rel.id_user2]
      
      if (!user1 || !user2) return

      switch(rel.type_relation) {
        case 'pere':
        case 'mere':
          user2.parents.push(user1)
          user1.children.push(user2)
          break
        case 'fils':
        case 'fille':
          user1.parents.push(user2)
          user2.children.push(user1)
          break
        case 'epoux':
        case 'epouse':
          user1.spouse = user2
          user2.spouse = user1
          break
      }
    })

    // Find siblings (people who share the same parents)
    Object.values(userMap).forEach(u => {
      if (u.parents.length > 0) {
        u.parents[0].children.forEach(child => {
          if (child.id !== u.id && !u.siblings.find(s => s.id === child.id)) {
            u.siblings.push(child)
          }
        })
      }
    })

    // Find current user or use first user
    const currentUserId = user?.user_id
    let rootUser = currentUserId ? userMap[currentUserId] : null
    
    // If current user not found, try to find any user with relations
    if (!rootUser) {
      rootUser = Object.values(userMap).find(u => 
        u.parents.length > 0 || u.children.length > 0 || u.spouse
      )
    }
    
    return { userMap, rootUser, currentUserId }
  }

  const renderUserCard = (userId, isCurrent = false) => {
    const u = users.find(user => user.id === userId)
    if (!u) return null

    return (
      <div className="tree-node">
        <div className={`node-card ${isCurrent ? 'current-user' : ''}`}>
          <div className="node-avatar">
            {u.photo ? (
              <img src={`http://localhost:8000${u.photo}`} alt={u.prenom} />
            ) : (
              <div className="avatar-placeholder">👤</div>
            )}
          </div>
          <div className="node-info">
            <div className="node-name">
              {u.prenom} {u.nom}
              {isCurrent && <span className="current-badge">Vous</span>}
            </div>
            <div className="node-details">{u.genre === 'H' ? '♂' : '♀'}</div>
          </div>
        </div>
      </div>
    )
  }

  const renderCompleteTree = (currentUserId, userMap) => {
    const userData = userMap[currentUserId]
    if (!userData) return null

    return (
      <div className="complete-tree">
        {/* Parents Section */}
        {userData.parents.length > 0 && (
          <div className="generation parents-generation">
            <h3>Parents</h3>
            <div className="generation-members">
              {userData.parents.map(parent => (
                <div key={parent.id}>
                  {renderUserCard(parent.id)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current User + Spouse + Siblings */}
        <div className="generation current-generation">
          <h3>Ma Génération</h3>
          <div className="generation-members">
            {/* Siblings */}
            {userData.siblings.map(sibling => (
              <div key={sibling.id}>
                {renderUserCard(sibling.id)}
              </div>
            ))}
            
            {/* Current User */}
            <div className="current-user-container">
              {renderUserCard(currentUserId, true)}
              {userData.spouse && (
                <>
                  <div className="marriage-line"></div>
                  {renderUserCard(userData.spouse.id)}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Children Section */}
        {userData.children.length > 0 && (
          <div className="generation children-generation">
            <h3>Enfants</h3>
            <div className="generation-members">
              {userData.children.map(child => (
                <div key={child.id}>
                  {renderUserCard(child.id)}
                  {/* Show grandchildren */}
                  {userMap[child.id]?.children.length > 0 && (
                    <div className="grandchildren">
                      {userMap[child.id].children.map(grandchild => (
                        <div key={grandchild.id}>
                          {renderUserCard(grandchild.id)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  const { userMap, rootUser, currentUserId } = buildFamilyTree()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>🌳 Arbre Généalogique</h2>
          <p style={{ color: '#777', marginBottom: '0' }}>
            Visualisation des relations familiales
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className={`btn ${viewMode === 'tree' ? 'btn-primary' : ''}`}
            onClick={() => setViewMode('tree')}
          >
            🌳 Arbre
          </button>
          <button
            className={`btn ${viewMode === 'table' ? 'btn-primary' : ''}`}
            onClick={() => setViewMode('table')}
          >
            📋 Tableau
          </button>
        </div>
      </div>

      {viewMode === 'tree' ? (
        <div className="card">
          {!rootUser ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              Aucune relation trouvée. Ajoutez vos relations familiales depuis votre profil.
            </div>
          ) : (
            <div className="family-tree">
              {renderCompleteTree(rootUser.id, userMap)}
            </div>
          )}
        </div>
      ) : (
        <div className="card">
        {relations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Aucune relation trouvée.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Personne 1</th>
                <th>Relation</th>
                <th>Personne 2</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {relations.map((relation) => (
                <tr key={relation.id}>
                  <td><strong>{getUserName(relation.id_user1)}</strong></td>
                  <td>
                    <span className="badge badge-primary">
                      {getRelationLabel(relation.type_relation)}
                    </span>
                  </td>
                  <td><strong>{getUserName(relation.id_user2)}</strong></td>
                  <td>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '5px 10px', fontSize: '12px' }}
                      onClick={() => handleDelete(relation.id)}
                    >
                      🗑️ Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        </div>
      )}
    </div>
  )
}

export default Relations
