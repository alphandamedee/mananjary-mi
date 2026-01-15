import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import './Register.css'

function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  
  const [tragnobes, setTragnobes] = useState([])
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    mot_de_passe: '',
    confirmPassword: '',
    date_naissance: '',
    adresse: '',
    id_tragnobe: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load tragnobes
    api.get('/tragnobes')
      .then(response => setTragnobes(response.data))
      .catch(err => console.error('Error loading tragnobes:', err))
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (formData.mot_de_passe !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)

    const { confirmPassword, ...dataToSend } = formData
    
    // Convert id_tragnobe to integer
    dataToSend.id_tragnobe = parseInt(dataToSend.id_tragnobe)

    const result = await register(dataToSend)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="register-container">
        <div className="register-card">
          <div className="alert alert-success">
            <h2>✅ Inscription réussie !</h2>
            <p>Votre compte a été créé avec succès.</p>
            <p>Vous allez être redirigé vers la page de connexion...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>🏛️ Antambahoaka Connect</h1>
          <p>Créer un nouveau compte membre</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nom">Nom *</label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="prenom">Prénom *</label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="telephone">Téléphone *</label>
            <input
              type="tel"
              id="telephone"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="mot_de_passe">Mot de passe *</label>
              <input
                type="password"
                id="mot_de_passe"
                name="mot_de_passe"
                value={formData.mot_de_passe}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="date_naissance">Date de naissance</label>
            <input
              type="date"
              id="date_naissance"
              name="date_naissance"
              value={formData.date_naissance}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="adresse">Adresse</label>
            <textarea
              id="adresse"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              rows="2"
            />
          </div>

          <div className="form-group">
            <label htmlFor="id_tragnobe">Tragnobe *</label>
            <select
              id="id_tragnobe"
              name="id_tragnobe"
              value={formData.id_tragnobe}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionnez votre tragnobe</option>
              {tragnobes.map(tragnobe => (
                <option key={tragnobe.id} value={tragnobe.id}>
                  {tragnobe.nom}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Déjà un compte ?{' '}
            <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
