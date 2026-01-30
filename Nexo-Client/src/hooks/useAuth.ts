import { authApi } from '@/api'
import { ROUTES } from '@/constants/routes'
import { LoginForm, UserInfo } from '@/api/auth'
import { useSession } from '@/utils/ctx'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'

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
  const { session, user, isLoading: isSessionLoading, signIn, signOut } = useSession()
  const [isActionLoading, setIsActionLoading] = useState(false)

  // 综合加载状态
  const isLoading = isSessionLoading || isActionLoading

  const login = useCallback(
    async (data: LoginForm) => {
      setIsActionLoading(true)
      try {
        const response = await authApi.login(data)
        // 使用 Session 系统管理 Token 和用户信息
        signIn(response.token, response.userInfo)
        router.replace(ROUTES.TABS.HOME)
      } finally {
        setIsActionLoading(false)
      }
    },
    [router, signIn],
  )

  const logout = useCallback(async () => {
    setIsActionLoading(true)
    try {
      await authApi.logout().catch(() => { }) // 忽略登出请求失败
      // 清除 Session
      signOut()
      router.replace(ROUTES.AUTH.LOGIN)
    } finally {
      setIsActionLoading(false)
    }
  }, [router, signOut])

  const refreshUser = useCallback(async () => {
    // 可以在这里重新请求用户信息并更新 session 中的 user
    // 目前暂不实现，因为 ctx 本身已经持久化了
    console.log('refreshUser called')
  }, [])

  return {
    user: user ?? null,
    isLogin: !!session, // 以 session 是否存在作为登录判断标准
    isLoading,
    login,
    logout,
    refreshUser,
  }
}
