import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardNav from '../components/DashboardNav'
import { useAuth } from '../context/useAuth'
import { apiRequest } from '../lib/api'
import './Dashboard.css'
import './SellerDashboard.css'
import './Shop.css'

const universities = [
  'WSU',
  'UW',
  'Oregon',
  'UCLA',
  'Arizona State',
  'Notre Dame',
  'Michigan',
  'Stanford',
  'Cal',
]

export default function UniversitySelection() {
  const navigate = useNavigate()
  const { token, user, refreshUser } = useAuth()
  const [selectedUniversity, setSelectedUniversity] = useState(user?.university || '')
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const filteredUniversities = universities.filter((entry) =>
    entry.toLowerCase().includes(search.trim().toLowerCase()),
  )

  async function saveUniversity() {
    setSaving(true)
    setError('')

    try {
      await apiRequest('/profile', {
        method: 'PATCH',
        token,
        body: { university: selectedUniversity },
      })
      await refreshUser()
      navigate('/shop')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="seller-page">
      <DashboardNav
        items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Shop', to: '/shop' },
          { label: 'Notifications', to: '/notifications' },
        ]}
      />

      <div className="seller-content">
        <div className="panel form-card">
          <div className="page-header">
            <div>
              <p className="eyebrow">University preference</p>
              <h1 className="section-title">Choose your default campus feed</h1>
              <p className="muted-copy">
                Your selected school becomes the default filter on the shop page, but you can still browse all
                listings anytime.
              </p>
            </div>
          </div>

          <label className="field-label field-label-block">
            Search universities
            <input
              className="field-input"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by school name..."
              type="text"
              value={search}
            />
          </label>

          <div className="university-grid">
            {filteredUniversities.map((entry) => (
              <button
                className={`chip university-chip ${selectedUniversity === entry ? 'chip-active' : ''}`}
                key={entry}
                onClick={() => setSelectedUniversity(entry)}
                type="button"
              >
                {entry}
              </button>
            ))}
          </div>

          {error && <p className="inline-error">{error}</p>}

          <div className="form-actions">
            <button className="btn-view-all" onClick={() => navigate('/dashboard')} type="button">
              Cancel
            </button>
            <button className="btn-new" disabled={saving || !selectedUniversity} onClick={saveUniversity} type="button">
              {saving ? 'Saving...' : 'Save University'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
