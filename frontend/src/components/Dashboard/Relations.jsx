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
      const relationsRequest = user?.id
        ? api.get(`/relations/user/${user.id}`)
        : api.get('/relations')
      const [relationsRes, usersRes] = await Promise.all([
        relationsRequest,
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
    const currentUserId = user?.id
    if (!currentUserId) {
      return { userMap: {}, rootUser: null, currentUserId: null, visibleRelations: [] }
    }

    const relationsByUser = new Map()
    relations.forEach(rel => {
      if (!relationsByUser.has(rel.id_user1)) relationsByUser.set(rel.id_user1, [])
      if (!relationsByUser.has(rel.id_user2)) relationsByUser.set(rel.id_user2, [])
      relationsByUser.get(rel.id_user1).push(rel)
      relationsByUser.get(rel.id_user2).push(rel)
    })

    const connectedUserIds = new Set([currentUserId])
    const queue = [currentUserId]
    while (queue.length) {
      const userId = queue.shift()
      const rels = relationsByUser.get(userId) || []
      rels.forEach(rel => {
        const otherId = rel.id_user1 === userId ? rel.id_user2 : rel.id_user1
        if (!connectedUserIds.has(otherId)) {
          connectedUserIds.add(otherId)
          queue.push(otherId)
        }
      })
    }

    const visibleRelations = relations.filter(
      rel => connectedUserIds.has(rel.id_user1) && connectedUserIds.has(rel.id_user2)
    )

    const userMap = {}
    users.forEach(u => {
      if (connectedUserIds.has(u.id)) {
        userMap[u.id] = {
          ...u,
          parents: [],
          children: [],
          spouse: null,
          siblings: []
        }
      }
    })

    const addUnique = (list, item) => {
      if (!list.find(i => i.id === item.id)) {
        list.push(item)
      }
    }

    visibleRelations.forEach(rel => {
      const user1 = userMap[rel.id_user1]
      const user2 = userMap[rel.id_user2]
      if (!user1 || !user2) return

      switch (rel.type_relation) {
        case 'pere':
        case 'mere':
        case 'fils':
        case 'fille':
          addUnique(user2.parents, user1)
          addUnique(user1.children, user2)
          break
        case 'epoux':
        case 'epouse':
          user1.spouse = user1.spouse || user2
          user2.spouse = user2.spouse || user1
          break
      }
    })

    Object.values(userMap).forEach(u => {
      if (u.parents.length > 0) {
        const parentIds = new Set(u.parents.map(p => p.id))
        Object.values(userMap).forEach(other => {
          if (other.id === u.id || other.parents.length === 0) return
          const sharesParent = other.parents.some(p => parentIds.has(p.id))
          if (sharesParent) addUnique(u.siblings, other)
        })
      }
    })

    const rootUser = userMap[currentUserId] || null
    return { userMap, rootUser, currentUserId, visibleRelations }
  }

  const renderUserCard = (userId, isCurrent = false) => {
    const u = users.find(user => user.id === userId)
    if (!u) return null

    const getPhotoUrl = (photo) => {
      if (!photo) return null
      if (photo.startsWith('http')) return photo
      return `http://localhost:8000${photo.startsWith('/') ? photo : '/' + photo}`
    }

    return (
      <div className="tree-node">
        <div className={`node-card ${isCurrent ? 'current-user' : ''}`}>
          <div className="node-avatar">
            {u.photo ? (
              <img src={getPhotoUrl(u.photo)} alt={u.prenom} />
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

  const { userMap, rootUser, currentUserId, visibleRelations } = buildFamilyTree()

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
          {!currentUserId ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              Connectez-vous pour afficher votre arbre généalogique.
            </div>
          ) : !rootUser ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              Aucune relation trouvée pour votre compte. Ajoutez vos relations familiales depuis votre profil.
            </div>
          ) : (
            <div className="family-tree">
              {renderCompleteTree(rootUser.id, userMap)}
            </div>
          )}
        </div>
      ) : (
        <div className="card">
        {visibleRelations.length === 0 ? (
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
              {visibleRelations.map((relation) => (
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
