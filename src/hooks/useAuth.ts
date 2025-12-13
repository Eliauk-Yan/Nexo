/**
 * 认证相关 Hook
 * 管理用户登录、注册、登出等状态
 */

import { authApi } from '@/api'
import { ROUTES } from '@/constants/routes'
import { LoginForm, RegisterForm, User } from '@/types'
import { storage } from '@/utils/storage'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'

interface UseAuthReturn {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginForm) => Promise<void>
  register: (data: RegisterForm) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // 初始化时检查是否已登录
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await storage.getToken()
        if (token) {
          const userInfo = await storage.getUserInfo<User>()
          if (userInfo) {
            setUser(userInfo)
          }
        }
      } catch (error) {
        console.error('Auth init error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  // 登录
  const login = useCallback(
    async (data: LoginForm) => {
      try {
        setIsLoading(true)
        const response = await authApi.login(data)
        await storage.setToken(response.token)
        await storage.setUserInfo(response.user)
        setUser(response.user)
        router.replace(ROUTES.TABS.HOME)
      } catch (error) {
        console.error('Login error:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [router],
  )

  // 注册
  const register = useCallback(
    async (data: RegisterForm) => {
      try {
        setIsLoading(true)
        const response = await authApi.register(data)
        await storage.setToken(response.token)
        await storage.setUserInfo(response.user)
        setUser(response.user)
        router.replace(ROUTES.TABS.HOME)
      } catch (error) {
        console.error('Register error:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [router],
  )

  // 登出
  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      await storage.removeToken()
      await storage.removeUserInfo()
      await storage.removeWalletAddress()
      setUser(null)
      setIsLoading(false)
      router.replace(ROUTES.AUTH.LOGIN)
    }
  }, [router])

  // 刷新用户信息
  const refreshUser = useCallback(async () => {
    // TODO: 实现刷新用户信息逻辑
    const userInfo = await storage.getUserInfo<User>()
    if (userInfo) {
      setUser(userInfo)
    }
  }, [])

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  }
}
