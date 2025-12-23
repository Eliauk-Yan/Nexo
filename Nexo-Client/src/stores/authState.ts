import type { UserInfo } from '@/types'
import { create } from 'zustand'

type AuthState = {
  user: UserInfo | null
  isLoading: boolean
  setUser: (user: UserInfo | null) => void
  setIsLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setIsLoading: (isLoading) => set({ isLoading }),
}))


