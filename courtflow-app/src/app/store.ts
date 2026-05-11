import { configureStore } from '@reduxjs/toolkit'

import { courtflowApi } from '../features/api/courtflowApi'
import authReducer from '../features/auth/authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [courtflowApi.reducerPath]: courtflowApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(courtflowApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
