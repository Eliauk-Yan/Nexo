// 路由认证(参考官网): https://docs.expo.dev/router/advanced/authentication/
import { use, createContext, type PropsWithChildren } from 'react'

// 用于将认证状态（如 Token）持久化到手机本地存储中，防止重启 App 后登录失效
import { useStorageState } from '@/hooks/useStorageState'

/**
 * 创建认证上下文（AuthContext）
 * 用于在整个 App 组件树中共享用户的登录状态和操作方法
 */
const AuthContext = createContext<{
  signIn: (token: string) => void // 登录方法：接受一个 token 并保存
  signOut: () => void // 登出方法：清除本地存储的 token
  session?: string | null // 当前会话状态：存储 Token 字符串或 null
  isLoading: boolean // 加载状态：从本地存储读取数据时为 true
}>({
  // 定义初始值（兜底数据）
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
})

/**
 * 自定义 Hook: useSession
 * 方便其他组件快速获取认证状态和方法
 * @example const { signIn, session } = useSession();
 */
export function useSession() {
  // 使用 React 19 的 use() Hook 获取 Context 内容
  const value = use(AuthContext)

  // 安全检查：确保该 Hook 在 SessionProvider 内部使用
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />')
  }

  return value
}

/**
 * 认证状态提供者组件 (SessionProvider)
 * 应该在 App 的根布局（如 app/_layout.tsx）中包裹整个应用
 */
export function SessionProvider({ children }: PropsWithChildren) {
  /**
   * 使用自定义存储 Hook
   * 'satoken' 是存储在本地磁盘上的键名（Key）
   * isLoading: 表示是否正在从磁盘读取数据
   * session: 当前读取到的 token 值
   * setSession: 用于更新本地存储并同步更新状态的函数
   */
  const [[isLoading, session], setSession] = useStorageState('satoken')

  return (
    <AuthContext.Provider
      value={{
        // 执行登录：调用 setSession 将 token 写入本地存储
        signIn: (token: string) => {
          // 这里可以扩展逻辑，比如调用后端接口确认 token 有效性
          setSession(token)
        },
        // 执行登出：将本地存储的 token 设为 null
        signOut: () => {
          setSession(null)
        },
        session, // 当前 Token 内容
        isLoading, // 初始化加载状态
      }}
    >
      {/* 渲染子组件，通常是整个应用的路由系统 */}
      {children}
    </AuthContext.Provider>
  )
}
