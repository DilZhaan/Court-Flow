import { useEffect } from 'react'
import { onIdTokenChanged } from 'firebase/auth'

import { useAppDispatch } from './useAppDispatch'
import { firebaseAuth } from '../config/firebase'
import { authResolved, signedOut } from '../features/auth/authSlice'
import { courtflowApi } from '../features/api/courtflowApi'

export const useAuthListener = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    return onIdTokenChanged(firebaseAuth, async (user) => {
      if (!user) {
        dispatch(signedOut())
        dispatch(courtflowApi.util.resetApiState())
        return
      }

      const token = await user.getIdToken()
      dispatch(
        authResolved({
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          },
          token,
        }),
      )
    })
  }, [dispatch])
}
