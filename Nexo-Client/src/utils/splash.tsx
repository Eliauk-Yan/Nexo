import { SplashScreen } from 'expo-router'
import { useSession } from './ctx'

// 阻止启动屏自动隐藏
SplashScreen.preventAutoHideAsync()

export function SplashScreenController() {
  // 获取到session的加载状态
  const { isLoading } = useSession()
  // 如果session加载完成，则隐藏启动屏
  if (!isLoading) {
    SplashScreen.hide()
  }

  return null
}
