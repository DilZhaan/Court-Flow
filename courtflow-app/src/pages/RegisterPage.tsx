import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { LogIn } from 'lucide-react'

import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import { Field } from '../components/Field'
import { firebaseAuth } from '../config/firebase'
import { useAppSelector } from '../hooks/useAppSelector'
import { useGoogleAuth } from '../hooks/useGoogleAuth'

interface RegisterForm {
  displayName: string
  email: string
  password: string
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { token } = useAppSelector((state) => state.auth)
  const [error, setError] = useState('')
  const { isGoogleLoading, signInWithGoogle } = useGoogleAuth()
  const { register, handleSubmit, formState } = useForm<RegisterForm>()

  const onSubmit = async (values: RegisterForm) => {
    setError('')
    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, values.email, values.password)
      await updateProfile(credential.user, { displayName: values.displayName })
      navigate('/')
    } catch {
      setError('Could not create account. Check Firebase email/password settings.')
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
          <h1>Create Account</h1>
          <p>New accounts start as staff. Admins or managers can update roles later.</p>
        </div>
        <Alert message={error} tone="error" />
        <Field label="Name" error={formState.errors.displayName} {...register('displayName', { required: 'Name is required' })} />
        <Field label="Email" type="email" error={formState.errors.email} {...register('email', { required: 'Email is required' })} />
        <Field label="Password" type="password" error={formState.errors.password} {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Use at least 6 characters' } })} />
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? 'Creating account' : 'Create account'}
        </Button>
        <div className="auth-divider"><span>or</span></div>
        <Button variant="secondary" icon={<LogIn size={16} />} onClick={handleGoogleSignIn} disabled={isGoogleLoading}>
          {isGoogleLoading ? 'Connecting Google' : 'Continue with Google'}
        </Button>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </section>
  )
}
