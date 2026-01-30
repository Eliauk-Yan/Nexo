// @ts-ignore
import urlcat from 'urlcat'
import * as SecureStore from 'expo-secure-store'

/**
 * 请求配置项接口
 */
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  params?: Record<string, any>
  body?: any
  headers?: Record<string, string>
}

/**
 * 自定义错误类型，包含后端返回的业务错误
 */
export interface ApiError extends Error {
  status?: number
  code?: string | number
  errors?: any
}

const STORAGE_KEYS = {
  TOKEN: 'satoken',
}

/**
 * 基础请求函数
 */
const baseRequest = async <T = any>(
  url: string,
  { method = 'GET', params, body, headers: customHeaders }: RequestOptions = {},
): Promise<T> => {
  // 完整的接口地址
  const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL || ''
  const requestUrl = urlcat(apiUrl, url, params || {})

  // 从存储中获取 token
  let token = null
  try {
    token = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN)
  } catch (e) {
    console.error('Failed to get token from SecureStore', e)
  }

  // 请求头
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...customHeaders,
  }

  if (token) {
    headers['satoken'] = token // 根据后端要求可能叫 Authorization 或 satoken
  }

  const config: RequestInit = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  }

  const response = await fetch(requestUrl, config)

  if (!response.ok) {
    if (response.status === 401) {
      // 处理未授权/登录超时
      // TODO: 可以触发全局退出逻辑或跳转
      console.warn('Unauthorized request - 401')
    }

    const errorData = await response.json().catch(() => ({}))
    const error = new Error(errorData.message || '请求失败') as ApiError
    error.status = response.status
    error.errors = errorData.errors
    throw error
  }

  const json = await response.json()

  // Business logic error handling (backend returns 200 but success is false)
  if (json && typeof json === 'object' && 'success' in json) {
    if (json.success === false) {
      const error = new Error(json.message || 'API request failed') as ApiError
      error.status = response.status
      error.code = json.code
      throw error
    }
    // Return the data field if it exists, otherwise return the whole json
    return (json.data !== undefined ? json.data : json) as T
  }

  return json as T
}

/**
 * 导出的请求对象，适配现有调用方式
 */
export const request = {
  get: <T = any>(url: string, params?: Record<string, any>) =>
    baseRequest<T>(url, { method: 'GET', params }),

  post: <T = any>(url: string, body?: any) =>
    baseRequest<T>(url, { method: 'POST', body }),

  put: <T = any>(url: string, body?: any) =>
    baseRequest<T>(url, { method: 'PUT', body }),

  patch: <T = any>(url: string, body?: any) =>
    baseRequest<T>(url, { method: 'PATCH', body }),

  delete: <T = any>(url: string) =>
    baseRequest<T>(url, { method: 'DELETE' }),
}

export default request
