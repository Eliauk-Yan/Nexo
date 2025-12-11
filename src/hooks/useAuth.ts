/**
 * 认证相关 Hook
 * 管理用户登录、注册、登出等状态
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'expo-router'
import { authApi, userApi } from '@/services/api'
import { storage } from '@/utils/storage'
import { User, LoginForm, RegisterForm } from '@/types'
import { ROUTES } from '@/constants/routes'
import { MESSAGES } from '@/constants/messages'

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
            // 可以在这里刷新用户信息
            try {
              const freshUser = await userApi.getProfile()
              setUser(freshUser)
              await storage.setUserInfo(freshUser)
            } catch (error) {
              console.error('Failed to refresh user info:', error)
            }
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
    [router]
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
    [router]
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
    try {
      const freshUser = await userApi.getProfile()
      setUser(freshUser)
      await storage.setUserInfo(freshUser)
    } catch (error) {
      console.error('Refresh user error:', error)
      throw error
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

