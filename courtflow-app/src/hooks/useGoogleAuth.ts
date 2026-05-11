import { useCallback, useState } from 'react'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

import { firebaseAuth } from '../config/firebase'

const googleProvider = new GoogleAuthProvider()

googleProvider.setCustomParameters({
  prompt: 'select_account',
})

export const useGoogleAuth = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const signInWithGoogle = useCallback(async () => {
    setIsGoogleLoading(true)
    try {
      await signInWithPopup(firebaseAuth, googleProvider)
    } finally {
      setIsGoogleLoading(false)
    }
  }, [])

  return { isGoogleLoading, signInWithGoogle }
}
