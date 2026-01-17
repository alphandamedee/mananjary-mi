import { useState, useEffect, useMemo, useRef } from 'react'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import Tree from 'react-d3-tree'
import './Relations.css'
import defaultAvatar from '../../img/profil homme.jpg'

function Relations() {
  const { user } = useAuth()
  const [relations, setRelations] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('tree') // 'tree' or 'table'
  const treeWrapperRef = useRef(null)
  const [treeTranslate, setTreeTranslate] = useState({ x: 0, y: 0 })
  const [selectedUserId, setSelectedUserId] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  // Debug : log users, relations, sélection admin
  useEffect(() => {
    console.log('--- DEBUG Relations.jsx ---')
    console.log('user:', user)
    console.log('selectedUserId:', selectedUserId)
    console.log('users:', users)
    console.log('relations:', relations)
  }, [user, selectedUserId, users, relations])

  const loadData = async () => {
    setLoading(true)
    try {
      const isAdmin = (user?.user_type && String(user.user_type).toLowerCase().includes('admin')) ||
                     (user?.role_name && String(user.role_name).toLowerCase().includes('admin'));
      const relationsRequest = isAdmin
        ? api.get('/relations')
        : user?.id
          ? api.get(`/relations/user/${user.id}`)
          : api.get('/relations');
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

  // Build family tree structure centered on current user ou sélection admin
  const buildFamilyTree = () => {
    // Détection admin robuste
    const isAdmin = (user?.user_type && String(user.user_type).toLowerCase().includes('admin')) ||
                   (user?.role_name && String(user.role_name).toLowerCase().includes('admin'));
    // Si admin et sélection, utiliser selectedUserId, sinon user.id
    const currentUserId = isAdmin && selectedUserId ? selectedUserId : user?.id;
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

  const getPhotoUrl = (photo) => {
    if (!photo) return defaultAvatar
    if (photo.startsWith('http')) return photo
    return `http://localhost:8000${photo.startsWith('/') ? photo : '/' + photo}`
  }

  const getAge = (birthYear) => {
    const year = parseInt(birthYear, 10)
    if (!year || Number.isNaN(year)) return null
    const currentYear = new Date().getFullYear()
    const age = currentYear - year
    return age > 0 ? age : null
  }

  const buildTreeData = (rootUser) => {
    if (!rootUser) return null

    const toPersonNode = (u) => ({
      name: `${u.prenom} ${u.nom}`,
      attributes: {
        genre: u.genre,
        age: getAge(u.annee_naissance),
        photo: getPhotoUrl(u.photo) || defaultAvatar
      }
    })

    const makeGroupNode = (label, list) => {
      if (!list || list.length === 0) return null
      return {
        name: label,
        attributes: { group: true },
        children: list.map(toPersonNode)
      }
    }

    const nodes = [
      makeGroupNode('Parents', rootUser.parents),
      makeGroupNode('Frères/Sœurs', rootUser.siblings),
      rootUser.spouse
        ? { name: 'Conjoint(e)', attributes: { group: true }, children: [toPersonNode(rootUser.spouse)] }
        : null,
      makeGroupNode('Enfants', rootUser.children)
    ].filter(Boolean)

    return {
      name: `${rootUser.prenom} ${rootUser.nom}`,
      attributes: {
        genre: rootUser.genre,
        age: getAge(rootUser.annee_naissance),
        photo: getPhotoUrl(rootUser.photo) || defaultAvatar
      },
      children: nodes
    }
  }

  const renderCustomNode = ({ nodeDatum }) => {
    if (nodeDatum.attributes?.group) {
      // Emoji contextuel selon le groupe
      let emoji = '';
      if (/parent/i.test(nodeDatum.name)) emoji = '👨‍👩‍👧‍👦';
      else if (/enfant/i.test(nodeDatum.name)) emoji = '👶';
      else if (/conjoint|époux|épouse/i.test(nodeDatum.name)) emoji = '💍';
      else emoji = '👥';
      return (
        <g className="d3-group-node">
          <rect
            x="-70" y="-18" width="140" height="36" rx="20"
            fill="url(#d3-group-bg)"
            filter="url(#d3-group-rect-shadow)"
            style={{ backdropFilter: 'blur(7px)', opacity: 0.92, stroke: 'rgba(123,31,162,0.25)', strokeWidth: 2 }}
          />
          <text
            className="d3-group-label neon-glow"
            dy="8"
            textAnchor="middle"
            stroke="#fff"
            strokeWidth="2.5"
            paintOrder="stroke"
            filter="url(#d3-group-shadow)"
            fill="url(#d3-group-gradient-anim)"
          >
            <tspan fontSize="20">{emoji} </tspan>{nodeDatum.name}
          </text>
          {/* Définition du filtre ombre portée SVG, du dégradé animé texte et du fond glassy */}
          <defs>
            <linearGradient id="d3-group-gradient-anim" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4a90e2">
                <animate attributeName="offset" values="0;1;0" dur="3s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#7b1fa2">
                <animate attributeName="offset" values="1;0;1" dur="3s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
            <linearGradient id="d3-group-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f0f7ff" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#e1eaff" stopOpacity="0.8" />
            </linearGradient>
            <filter id="d3-group-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1" stdDeviation="2.2" flood-color="#7b1fa2" flood-opacity="0.25" />
              <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#4a90e2" flood-opacity="0.18" />
            </filter>
            <filter id="d3-group-rect-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="3.5" flood-color="#7b1fa2" flood-opacity="0.18" />
            </filter>
          </defs>
        </g>
      )
    }

    const gender = nodeDatum.attributes?.genre === 'H' ? '♂' : '♀'
    const age = nodeDatum.attributes?.age
    const photo = nodeDatum.attributes?.photo || defaultAvatar

    return (
      <g>
        <foreignObject width="170" height="72" x="-85" y="-36">
          <div className="d3-node-card">
            <div className="d3-node-avatar">
              {photo ? (
                <img src={photo} alt={nodeDatum.name} />
              ) : (
                <div className="d3-node-placeholder">👤</div>
              )}
            </div>
            <div className="d3-node-text">
              <div className="d3-node-name">{nodeDatum.name}</div>
              <div className="d3-node-meta">
                <span>{gender}</span>
                {age && <span>{age} ans</span>}
              </div>
            </div>
          </div>
        </foreignObject>
      </g>
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
            <div className="generation-title">Parents</div>
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
          <div className="generation-title">Ma Génération</div>
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
            <div className="generation-title">Enfants</div>
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

  const { userMap, rootUser, currentUserId, visibleRelations } = buildFamilyTree()
  // Debug : log currentUserId, rootUser, visibleRelations
  console.log('currentUserId:', currentUserId)
  console.log('rootUser:', rootUser)
  console.log('visibleRelations:', visibleRelations)
  const treeData = useMemo(() => buildTreeData(rootUser), [rootUser, selectedUserId])

  useEffect(() => {
    if (viewMode !== 'tree') return
    if (!treeWrapperRef.current) return
    const { width } = treeWrapperRef.current.getBoundingClientRect()
    setTreeTranslate({ x: width / 2, y: 60 })
  }, [viewMode, loading, relations, users])

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>🌳 Arbre Généalogique</h2>
          <p style={{ color: '#777', marginBottom: '0' }}>
            Visualisation des relations familiales
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
          {/* Sélecteur d'utilisateur pour les admins */}
          {user &&
            (
              (user.user_type && String(user.user_type).toLowerCase().includes('admin')) ||
              (user.role_name && String(user.role_name).toLowerCase().includes('admin'))
            ) &&
            user.id_tragnobe && (
            <select
              style={{ marginLeft: '20px', padding: '6px', borderRadius: '5px' }}
              value={selectedUserId || ''}
              onChange={e => setSelectedUserId(e.target.value)}
            >
              <option value="">Sélectionner un membre du tragnobe</option>
              {users
                .filter(u => u.id_tragnobe === user.id_tragnobe)
                .map(u => (
                  <option key={u.id} value={u.id}>
                    {u.prenom} {u.nom} ({u.genre === 'H' ? '♂' : '♀'})
                  </option>
                ))}
            </select>
          )}
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
            <div className="family-tree" ref={treeWrapperRef}>
              {treeData && (
                <Tree
                  data={treeData}
                  translate={treeTranslate}
                  orientation="vertical"
                  pathFunc="elbow"
                  nodeSize={{ x: 190, y: 140 }}
                  separation={{ siblings: 1.1, nonSiblings: 1.3 }}
                  renderCustomNodeElement={renderCustomNode}
                  enableLegacyTransitions
                />
              )}
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
