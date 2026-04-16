import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardNav from '../components/DashboardNav'
import LoadingScreen from '../components/LoadingScreen'
import { useAuth } from '../context/useAuth'
import { apiRequest } from '../lib/api'
import './SellerDashboard.css'

const schools = ['WSU', 'UW', 'Oregon', 'UCLA', 'Arizona State', 'Notre Dame', 'Michigan', 'Stanford', 'Cal']
const categories = ['Hoodie', 'Sweatshirt', 'T-Shirt', 'Jacket', 'Hat', 'Memorabilia', 'Pullover']
const conditions = ['New', 'Like New', 'Excellent', 'Very Good', 'Good', 'Fair']

const initialForm = {
  title: '',
  category: '',
  school: '',
  price: '',
  size: '',
  condition: '',
  description: '',
  imageUrl: '',
  status: 'active',
}

export default function ListingForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { token, user } = useAuth()
  const isEditing = Boolean(id)
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(isEditing)
  const [savingMode, setSavingMode] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadListing() {
      if (!isEditing) {
        return
      }

      try {
        const data = await apiRequest('/seller/listings', { token })
        const listing = data.listings.find((entry) => String(entry.id) === id)

        if (!listing) {
          setError('Listing not found.')
          return
        }

        setForm({
          title: listing.title,
          category: listing.category || '',
          school: listing.school,
          price: listing.price === null ? '' : String(listing.price),
          size: listing.size,
          condition: listing.condition,
          description: listing.description,
          imageUrl: listing.imageUrl || '',
          status: listing.status === 'draft' ? 'draft' : 'active',
        })
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    if (!isEditing) {
      setForm((current) => ({
        ...current,
        school: current.school || user.university || '',
      }))
      setLoading(false)
      return
    }

    loadListing()
  }, [id, isEditing, token, user.university])

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  function uploadPhoto(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload a JPG, PNG, or another image file.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Please keep uploaded photos under 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setForm((current) => ({
        ...current,
        imageUrl: String(reader.result || ''),
      }))
      setError('')
    }
    reader.readAsDataURL(file)
  }

  async function saveListing(nextStatus) {
    setSavingMode(nextStatus)
    setError('')

    try {
      const endpoint = isEditing ? `/seller/listings/${id}` : '/seller/listings'
      const method = isEditing ? 'PUT' : 'POST'

      await apiRequest(endpoint, {
        method,
        token,
        body: {
          ...form,
          price: form.price === '' ? null : Number(form.price),
          status: nextStatus,
        },
      })

      navigate('/seller')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingMode('')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    await saveListing('active')
  }

  if (loading) {
    return <LoadingScreen message="Loading listing editor..." />
  }

  return (
    <div className="seller-page">
      <DashboardNav
        items={[
          { label: 'Dashboard', to: '/seller' },
          { label: 'Shop', to: '/shop' },
          { label: 'Notifications', to: '/notifications' },
          { label: 'New Listing', to: '/seller/listings/new', variant: 'primary' },
        ]}
      />

      <div className="seller-content">
        <div className="section-header">
          <h1 className="seller-heading">{isEditing ? 'Edit Listing' : 'Create Listing'}</h1>
        </div>

        <form className="panel form-card" onSubmit={handleSubmit}>
          <div className="page-header">
            <div>
              <p className="eyebrow">{form.status === 'draft' ? 'Draft mode' : 'Ready to publish'}</p>
              <p className="muted-copy">
                Active listings require every field plus a photo. Drafts can be saved with partial information.
              </p>
            </div>
          </div>

          <div className="form-grid">
            <label className="field-label">
              Title
              <input className="field-input" name="title" onChange={updateField} value={form.title} />
            </label>

            <label className="field-label">
              Category
              <select className="field-input" name="category" onChange={updateField} value={form.category}>
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-label">
              School
              <select className="field-input" name="school" onChange={updateField} value={form.school}>
                <option value="">Select school</option>
                {schools.map((school) => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-label">
              Price
              <input
                className="field-input"
                min="1"
                name="price"
                onChange={updateField}
                step="0.01"
                type="number"
                value={form.price}
              />
            </label>

            <label className="field-label">
              Size
              <input className="field-input" name="size" onChange={updateField} value={form.size} />
            </label>

            <label className="field-label">
              Condition
              <select className="field-input" name="condition" onChange={updateField} value={form.condition}>
                <option value="">Select condition</option>
                {conditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-label">
              Upload Photo
              <input accept="image/*" className="field-input" onChange={uploadPhoto} type="file" />
            </label>
          </div>

          {!!form.imageUrl && (
            <div className="listing-preview-card">
              <img alt={form.title || 'Listing preview'} className="listing-preview-image" src={form.imageUrl} />
              <div>
                <strong>Photo ready</strong>
                <p className="muted-copy">This image will be stored with the listing for the local demo build.</p>
              </div>
            </div>
          )}

          <label className="field-label field-label-block">
            Description
            <textarea
              className="field-input field-textarea"
              name="description"
              onChange={updateField}
              rows="5"
              value={form.description}
            />
          </label>

          {error && <p className="inline-error">{error}</p>}

          <div className="form-actions">
            <button className="btn-view-all" onClick={() => navigate('/seller')} type="button">
              Cancel
            </button>
            <button
              className="btn-view-all"
              disabled={Boolean(savingMode)}
              onClick={() => saveListing('draft')}
              type="button"
            >
              {savingMode === 'draft' ? 'Saving...' : 'Save as Draft'}
            </button>
            <button className="btn-new" disabled={Boolean(savingMode)} type="submit">
              {savingMode === 'active'
                ? 'Saving...'
                : isEditing
                  ? form.status === 'draft'
                    ? 'Publish Listing'
                    : 'Save Changes'
                  : 'Post Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
