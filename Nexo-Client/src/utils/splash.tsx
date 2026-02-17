import * as ExpoSplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { useSession } from './ctx'

// 标记 preventAutoHideAsync 是否成功
let splashScreenReady = false

// 阻止启动屏自动隐藏（安全调用，忽略所有错误）
try {
  ExpoSplashScreen.preventAutoHideAsync()
    .then(() => {
      splashScreenReady = true
    })
    .catch(() => {
      splashScreenReady = false
    })
} catch {
  // ignore - splash screen may not be available in this environment
  splashScreenReady = false
}

export function SplashScreenController() {
  // 获取到session的加载状态
  const { isLoading } = useSession()

  useEffect(() => {
    if (!isLoading) {
      // 只在 splash screen 成功注册后才调用 hideAsync
      if (splashScreenReady) {
        try {
          ExpoSplashScreen.hideAsync().catch(() => {
            // Ignore error - splash screen may already be hidden
          })
        } catch {
          // ignore synchronous errors
        }
      }
    }
  }, [isLoading])

  return null
}
