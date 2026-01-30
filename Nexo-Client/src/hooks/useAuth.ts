import { authApi } from '@/api'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/authState'
import { authStore } from '@/stores/authStore'
import { LoginForm, UserInfo } from '@/types'
import { useSession } from '@/utils/ctx'
import { useRouter } from 'expo-router'
import { useCallback, useEffect } from 'react'

interface UseAuthReturn {
  user: UserInfo | null
  isLogin: boolean
  isLoading: boolean
  login: (data: LoginForm) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const useAuth = (): UseAuthReturn => {
  const router = useRouter()
  const { user, isLoading: isStoreLoading, setUser, setIsLoading: setStoreLoading } = useAuthStore()
  const { session, isLoading: isSessionLoading, signIn, signOut } = useSession()

  // 综合加载状态
  const isLoading = isStoreLoading || isSessionLoading

  // 首次使用时，从本地持久化中恢复用户信息
  useEffect(() => {
    let cancelled = false
    const hydrate = async () => {
      setStoreLoading(true)
      try {
        const storedUser = await authStore.getUserInfo<UserInfo>()
        if (!cancelled) {
          setUser(storedUser ?? null)
        }
      } finally {
        if (!cancelled) {
          setStoreLoading(false)
        }
      }
    }
    hydrate()
    return () => {
      cancelled = true
    }
  }, [setStoreLoading, setUser])

  const login = useCallback(
    async (data: LoginForm) => {
      setStoreLoading(true)
      try {
        const response = await authApi.login(data)
        // 使用新的 Session 系统管理 Token
        signIn(response.token)
        // 使用 Store 管理用户信息
        await authStore.setUserInfo(response.userInfo)
        setUser(response.userInfo)
        router.replace(ROUTES.TABS.HOME)
      } finally {
        setStoreLoading(false)
      }
    },
    [router, setStoreLoading, setUser, signIn],
  )

  const logout = useCallback(async () => {
    setStoreLoading(true)
    try {
      await authApi.logout()
      // 清除 Session
      signOut()
      // 清除本地 Store
      await authStore.removeUserInfo()
      setUser(null)
      router.replace(ROUTES.AUTH.LOGIN)
    } finally {
      setStoreLoading(false)
    }
  }, [router, setStoreLoading, setUser, signOut])

  const refreshUser = useCallback(async () => {
    const userInfo = await authStore.getUserInfo<UserInfo>()
    setUser(userInfo ?? null)
  }, [setUser])

  return {
    user,
    isLogin: !!session, // 以 session 是否存在作为登录判断标准
    isLoading,
    login,
    logout,
    refreshUser,
  }
}
