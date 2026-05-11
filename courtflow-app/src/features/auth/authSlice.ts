import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface SerializableFirebaseUser {
  uid: string
  email: string | null
  displayName: string | null
}

interface AuthState {
  firebaseUser: SerializableFirebaseUser | null
  token: string | null
  ready: boolean
}

const initialState: AuthState = {
  firebaseUser: null,
  token: null,
  ready: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authResolved: (
      state,
      action: PayloadAction<{ user: SerializableFirebaseUser | null; token: string | null }>,
    ) => {
      state.firebaseUser = action.payload.user
      state.token = action.payload.token
      state.ready = true
    },
    signedOut: (state) => {
      state.firebaseUser = null
      state.token = null
      state.ready = true
    },
  },
})

export const { authResolved, signedOut } = authSlice.actions
export default authSlice.reducer
