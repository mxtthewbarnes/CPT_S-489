import { useState } from 'react'
import { auth } from '../firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import './Auth.css'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
      // redirect after success
    } catch (err) {
      setError(err.message)
    }
  }

  const handleGoogle = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
      // redirect after success
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <h2 className="auth-title">{isLogin ? 'Login' : 'Register'}</h2>

        {error && <p className="auth-error">{error}</p>}

        <input
          className="form-control mb-3"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="form-control mb-3"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button className="btn btn-light w-100 mb-2" onClick={handleSubmit}>
          {isLogin ? 'Login' : 'Register'}
        </button>

        <button className="btn btn-outline-light w-100 mb-3" onClick={handleGoogle}>
          Continue with Google
        </button>

        <p className="auth-toggle">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? ' Register' : ' Login'}
          </span>
        </p>
      </div>
    </div>
  )
}