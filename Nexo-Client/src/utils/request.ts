/**
 * HTTP 请求工具
 * 基于 fetch 封装，提供统一的请求接口
 */

import { API_BASE_URL, API_TIMEOUT } from '@/config/env'
import { authStore } from '@/stores/authStore'
import { ApiError, BaseResponse } from '@/types'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface RequestOptions extends RequestInit {
  timeout?: number
}

class Request {
  private baseURL: string
  private timeout: number

  constructor() {
    this.baseURL = API_BASE_URL
    this.timeout = API_TIMEOUT
  }

  /**
   * 获取请求头
   */
  private async getHeaders(customHeaders?: HeadersInit, isFormData = false): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(customHeaders as Record<string, string>),
    }

    const token = await authStore.getToken()
    if (token) {
      headers['satoken'] = token
    }

    return headers
  }

  /**
   * 处理响应
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type')
    const isJson = contentType?.includes('application/json')

    if (!response.ok) {
      const error: ApiError = {
        code: response.status,
        message: response.statusText,
      }

      if (isJson) {
        const data = await response.json()
        error.message = data.message || error.message
        error.details = data
      }

      if (response.status === 401) {
        await authStore.removeToken()
        await authStore.removeUserInfo()
      }

      throw error
    }

    if (isJson) {
      const data: BaseResponse<T> = await response.json()
      if (data.success) {
        return data.data
      }
      throw {
        code: parseInt(data.code) || 500,
        message: data.message,
      } as ApiError
    }

    return (await response.text()) as T
  }

  /**
   * 发送请求
   */
  private async request<T>(
    url: string,
    method: RequestMethod,
    data?: any,
    options?: RequestOptions,
  ): Promise<T> {
    const { timeout = this.timeout, headers: customHeaders, ...restOptions } = options || {}

    let fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`
    const isFormData = data instanceof FormData
    const headers = await this.getHeaders(customHeaders, isFormData)

    const config: RequestInit = {
      method,
      headers,
      ...restOptions,
    }

    if (data) {
      if (method === 'GET') {
        const params = new URLSearchParams(data).toString()
        if (params) {
          fullUrl += (fullUrl.includes('?') ? '&' : '?') + params
        }
      } else {
        config.body = isFormData ? data : JSON.stringify(data)
      }
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(fullUrl, { ...config, signal: controller.signal })
      clearTimeout(timeoutId)

      return await this.handleResponse<T>(response)
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw { code: 408, message: '请求超时' } as ApiError
      }
      throw error
    }
  }

  get<T>(url: string, params?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, 'GET', params, options)
  }

  post<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, 'POST', data, options)
  }

  put<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, 'PUT', data, options)
  }

  patch<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, 'PATCH', data, options)
  }

  delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, 'DELETE', undefined, options)
  }

  async upload<T>(
    url: string,
    file: { uri: string; type: string; name: string },
    options?: RequestOptions,
  ): Promise<T> {
    const formData = new FormData()
    formData.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any)

    return this.post<T>(url, formData, options)
  }
}

export const request = new Request()
