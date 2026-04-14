// @ts-ignore
import urlcat from 'urlcat'
import * as SecureStore from 'expo-secure-store'
import { Alert } from 'react-native'
import { router } from 'expo-router'

// 定义请求选项接口
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  params?: any
  body?: any
  headers?: Record<string, string>
  /** 登录后立即请求用户信息时传入，避免依赖尚未写入存储的 token */
  token?: string
  /** 已在请求层提示错误时，是否继续向上抛出异常 */
  throwOnError?: boolean
  /** 是否抑制请求层的全局错误弹窗 */
  suppressErrorAlert?: boolean
}
// 定义 API 错误接口
interface ApiError extends Error {
  status?: number
  errors?: any
}
// 定义存储键
const STORAGE_KEYS = {
  TOKEN: 'satoken',
}

const request = async (url: string, opts: RequestOptions = {}) => {
  const {
    method = 'GET',
    params,
    body,
    headers: customHeaders,
    token: tokenOverride,
    throwOnError = true,
    suppressErrorAlert = false,
  } = opts
  // 1. 从环境变量中获取基础 API 地址
  const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL
  // 2. 构建完整的请求 URL
  const requestUrl = urlcat(apiUrl, url, params)
  // 3. 设置请求头
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  // 如果不是 FormData，则设置 Content-Type 为 application/json
  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  // 4. 从选项或安全存储中获取 token（登录后立即拉取用户信息时可传入 token 覆盖）
  const token =
    tokenOverride ??
    (await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN).catch((e) => {
      console.error('从安全存储中获取token失败', e)
      return null
    }))
  if (token) {
    headers['satoken'] = token
  }
  // 5. 合并自定义请求头
  if (customHeaders) {
    Object.assign(headers, customHeaders)
  }
  // 7. 设置请求配置
  const config: RequestInit = {
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  }
  // 7. 发送请求
  const response = await fetch(requestUrl, config)
  const res = await response.json()
  // 8. 处理响应
  const isSaTokenError = typeof res.code === 'number' && res.code !== 200
  if (!response.ok || res.success === false || isSaTokenError) {
    // 9. 处理错误响应
    const errMsg = res.msg || res.message || '未知错误'
    // 未登录：不弹窗，直接跳转到登录页
    if (errMsg === '未登录' || response.status === 401) {
      // 清理本地 token，避免后续请求继续携带无效凭证
      await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN).catch((e) => {
        console.error('清理token失败', e)
      })
      // 跳转到登录页
      router.replace('/(auth)/sign-in')
    } else {
      if (!suppressErrorAlert) {
        Alert.alert('提示', errMsg)
      }
    }
    const error = new Error(errMsg) as ApiError
    error.status = response.status
    error.errors = res.errors
    if (throwOnError) {
      throw error
    }
    return undefined
  }
  // 10. 处理成功响应
  return res.data
}

export const get = <T = any>(
  url: string,
  params?: any,
  options?: Pick<RequestOptions, 'token' | 'suppressErrorAlert'>,
): Promise<T> => request(url, { method: 'GET', params, ...options })

export function post<T = any>(
  url: string,
  body?: any,
  headers?: Record<string, string>,
): Promise<T>
export function post<T = any>(
  url: string,
  body: any,
  headers: Record<string, string> | undefined,
  options: { throwOnError: false },
): Promise<T | undefined>
export function post<T = any>(
  url: string,
  body?: any,
  headers?: Record<string, string>,
  options?: Pick<RequestOptions, 'throwOnError'>,
): Promise<T | undefined> {
  return request(url, { method: 'POST', body, headers, ...options })
}

export const put = <T = any>(url: string, body?: any): Promise<T> =>
  request(url, { method: 'PUT', body })

export const patch = <T = any>(url: string, body?: any): Promise<T> =>
  request(url, { method: 'PATCH', body })

export const del = <T = any>(url: string): Promise<T> => request(url, { method: 'DELETE' })

export default request
