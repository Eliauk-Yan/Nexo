/**
 * 认证相关 Hook
 * - 使用 Zustand 管理全局登录状态
 * - 仅处理登录 / 登出与本地持久化，不做复杂校验
 */

import { authApi } from '@/api'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/authState'
import { authStore } from '@/stores/authStore'
import { LoginForm, UserInfo } from '@/types'
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
  const { user, isLoading, setUser, setIsLoading } = useAuthStore()

  // 首次使用时，从本地持久化中恢复用户信息
  useEffect(() => {
    let cancelled = false
    const hydrate = async () => {
      setIsLoading(true)
      try {
        const storedUser = await authStore.getUserInfo<UserInfo>()
        if (!cancelled) {
          setUser(storedUser ?? null)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }
    hydrate()
    return () => {
      cancelled = true
    }
  }, [setIsLoading, setUser])

  const login = useCallback(
    async (data: LoginForm) => {
      setIsLoading(true)
      try {
        const response = await authApi.login(data)
        await Promise.all([
          authStore.setToken(response.token),
          authStore.setUserInfo(response.userInfo),
        ])
        setUser(response.userInfo)
        router.replace(ROUTES.TABS.ACCOUNT)
      } finally {
        setIsLoading(false)
      }
    },
    [router, setIsLoading, setUser],
  )

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await authApi.logout()
      await Promise.all([authStore.removeToken(), authStore.removeUserInfo()])
      setUser(null)
      router.replace(ROUTES.AUTH.LOGIN)
    } finally {
      setIsLoading(false)
    }
  }, [router, setIsLoading, setUser])

  const refreshUser = useCallback(async () => {
    const userInfo = await authStore.getUserInfo<UserInfo>()
    setUser(userInfo ?? null)
  }, [setUser])

  return {
    user,
    isLogin: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  }
}
