import { SplashScreen } from 'expo-router'
import { useEffect } from 'react'
import { useSession } from './ctx'

// 阻止启动屏自动隐藏
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error */
})

export function SplashScreenController() {
  // 获取到session的加载状态
  const { isLoading } = useSession()

  useEffect(() => {
    // 如果session加载完成，则隐藏启动屏
    if (!isLoading) {
      SplashScreen.hideAsync().catch(() => {
        // Ignore error if splash screen is already hidden or failed to hide
      })
    }
  }, [isLoading])

  return null
}
