import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { homePathForRole } from '../lib/roles'
import './Auth.css'

const demoAccounts = [
  { label: 'Buyer Demo', email: 'buyer@campuscloset.test' },
  { label: 'Seller Demo', email: 'seller@campuscloset.test' },
  { label: 'Admin Demo', email: 'admin@campuscloset.test' },
]

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'buyer',
    university: 'WSU',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { login, register, user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      navigate(homePathForRole(user.role), { replace: true })
    }
  }, [loading, navigate, user])

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const session = isLogin
        ? await login({
            email: form.email,
            password: form.password,
          })
        : await register(form)

      navigate(homePathForRole(session.user.role), { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDemoLogin(email) {
    setError('')
    setSubmitting(true)

    try {
      const session = await login({
        email,
        password: 'password123',
      })

      navigate(homePathForRole(session.user.role), { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div>
          <p className="auth-kicker">Campus Closet</p>
          <h2 className="auth-title">{isLogin ? 'Sign In' : 'Create an Account'}</h2>
          <p className="auth-copy">
            Use the seeded demo accounts or register a fresh buyer or seller account.
          </p>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            className="form-control mb-3"
            name="email"
            onChange={updateField}
            placeholder="Email"
            type="email"
            value={form.email}
          />
          <input
            className="form-control mb-3"
            name="password"
            onChange={updateField}
            placeholder="Password"
            type="password"
            value={form.password}
          />

          {!isLogin && (
            <>
              <select className="form-select mb-3" name="role" onChange={updateField} value={form.role}>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
              <select className="form-select mb-3" name="university" onChange={updateField} value={form.university}>
                <option value="WSU">WSU</option>
                <option value="UW">UW</option>
                <option value="Oregon">Oregon</option>
                <option value="UCLA">UCLA</option>
                <option value="Arizona State">Arizona State</option>
                <option value="Notre Dame">Notre Dame</option>
                <option value="Michigan">Michigan</option>
                <option value="Stanford">Stanford</option>
                <option value="Cal">Cal</option>
              </select>
            </>
          )}

          <button className="btn btn-light w-100 mb-3" disabled={submitting} type="submit">
            {submitting ? 'Working...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="demo-login-grid">
          {demoAccounts.map((account) => (
            <button
              className="btn btn-outline-light"
              key={account.email}
              onClick={() => handleDemoLogin(account.email)}
              type="button"
            >
              {account.label}
            </button>
          ))}
        </div>

        <p className="auth-toggle">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <span onClick={() => setIsLogin(!isLogin)}>{isLogin ? ' Register' : ' Login'}</span>
        </p>
      </div>
    </div>
  )
}
