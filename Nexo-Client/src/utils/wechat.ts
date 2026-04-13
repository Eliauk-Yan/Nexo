import ExpoWeChat from 'expo-wechat'

const wechatAppId = process.env.EXPO_PUBLIC_WECHAT_APP_ID?.trim() ?? ''
const wechatUniversalLink = process.env.EXPO_PUBLIC_WECHAT_UNIVERSAL_LINK?.trim() ?? ''

let registerPromise: Promise<boolean> | null = null

export const isWeChatConfigured = () => Boolean(wechatAppId && wechatUniversalLink)

export const getWeChatConfigError = () => {
  if (!wechatAppId) {
    return '微信支付 AppID 尚未配置。'
  }
  if (!wechatUniversalLink) {
    return '微信支付 Universal Link 尚未配置。'
  }
  return ''
}

export const ensureWeChatRegistered = async () => {
  if (!isWeChatConfigured()) {
    throw new Error(getWeChatConfigError() || '微信支付配置未完成。')
  }

  if (ExpoWeChat.isRegistered) {
    return true
  }

  if (!registerPromise) {
    registerPromise = ExpoWeChat.registerApp(wechatAppId, wechatUniversalLink).finally(() => {
      registerPromise = null
    })
  }

  const registered = await registerPromise
  if (!registered) {
    throw new Error('微信 SDK 初始化失败，请检查 AppID、Universal Link 和构建配置。')
  }
  return registered
}
