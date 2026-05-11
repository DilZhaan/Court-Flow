import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { LogIn } from 'lucide-react'

import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import { Field } from '../components/Field'
import { firebaseAuth } from '../config/firebase'
import { useAppSelector } from '../hooks/useAppSelector'
import { useGoogleAuth } from '../hooks/useGoogleAuth'

interface LoginForm {
  email: string
  password: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const { token } = useAppSelector((state) => state.auth)
  const [error, setError] = useState('')
  const { isGoogleLoading, signInWithGoogle } = useGoogleAuth()
  const { register, handleSubmit, formState } = useForm<LoginForm>()

  const onSubmit = async (values: LoginForm) => {
    setError('')
    try {
      await signInWithEmailAndPassword(firebaseAuth, values.email, values.password)
      navigate('/')
    } catch {
      setError('Invalid email or password')
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    try {
      await signInWithGoogle()
      navigate('/')
    } catch {
      setError('Google sign in was cancelled or failed')
    }
  }

  if (token) return <Navigate to="/" replace />

  return (
    <section className="auth-page">
      <form className="auth-panel" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <h1>CourtFlow</h1>
          <p>Sign in to manage facilities, bookings, and staff access.</p>
        </div>
        <Alert message={error} tone="error" />
        <Field label="Email" type="email" autoComplete="email" error={formState.errors.email} {...register('email', { required: 'Email is required' })} />
        <Field label="Password" type="password" autoComplete="current-password" error={formState.errors.password} {...register('password', { required: 'Password is required' })} />
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? 'Signing in' : 'Sign in'}
        </Button>
        <div className="auth-divider"><span>or</span></div>
        <Button variant="secondary" icon={<LogIn size={16} />} onClick={handleGoogleSignIn} disabled={isGoogleLoading}>
          {isGoogleLoading ? 'Connecting Google' : 'Continue with Google'}
        </Button>
        <p className="auth-switch">Need a Firebase account? <Link to="/register">Create one</Link></p>
      </form>
    </section>
  )
}
