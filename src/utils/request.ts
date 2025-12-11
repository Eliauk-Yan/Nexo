/**
 * HTTP 请求工具
 * 基于 fetch 封装，提供统一的请求接口
 */

import { API_BASE_URL, API_TIMEOUT, STORAGE_KEYS } from '@/config/env'
import { storage } from './storage'
import { BaseResponse, ApiError } from '@/types'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface RequestOptions extends RequestInit {
  timeout?: number
  showError?: boolean
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
  private async getHeaders(customHeaders?: HeadersInit): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...customHeaders,
    }

    // 添加 token
    const token = await storage.getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
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

      // 处理 401 未授权
      if (response.status === 401) {
        await storage.removeToken()
        await storage.removeUserInfo()
        // 可以在这里触发登出逻辑
      }

      throw error
    }

    if (isJson) {
      const data: BaseResponse<T> = await response.json()
      if (data.code === 0 || data.code === 200) {
        return data.data
      } else {
        throw {
          code: data.code,
          message: data.message,
        } as ApiError
      }
    }

    return (await response.text()) as unknown as T
  }

  /**
   * 创建带超时的请求
   */
  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject({
          code: 408,
          message: '请求超时',
        } as ApiError)
      }, timeout)
    })
  }

  /**
   * 发送请求
   */
  private async request<T>(
    url: string,
    method: RequestMethod,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    const {
      timeout = this.timeout,
      showError = true,
      headers: customHeaders,
      ...restOptions
    } = options || {}

    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`
    const headers = await this.getHeaders(customHeaders)

    const config: RequestInit = {
      method,
      headers,
      ...restOptions,
    }

    // 添加请求体
    if (data && method !== 'GET') {
      if (data instanceof FormData) {
        // FormData 不需要设置 Content-Type，浏览器会自动设置
        config.body = data
        // 删除 Content-Type，让浏览器自动设置（包含 boundary）
        delete (headers as any)['Content-Type']
      } else {
        config.body = JSON.stringify(data)
      }
    } else if (data && method === 'GET') {
      // GET 请求将参数拼接到 URL
      const params = new URLSearchParams(data).toString()
      if (params) {
        url += (url.includes('?') ? '&' : '?') + params
      }
    }

    try {
      const response = await Promise.race([
        fetch(fullUrl, config),
        this.createTimeoutPromise(timeout),
      ])

      return await this.handleResponse<T>(response)
    } catch (error) {
      if (showError) {
        // 这里可以集成 toast 或 alert 来显示错误
        console.error('Request error:', error)
      }
      throw error
    }
  }

  /**
   * GET 请求
   */
  get<T>(url: string, params?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, 'GET', params, options)
  }

  /**
   * POST 请求
   */
  post<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, 'POST', data, options)
  }

  /**
   * PUT 请求
   */
  put<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, 'PUT', data, options)
  }

  /**
   * PATCH 请求
   */
  patch<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, 'PATCH', data, options)
  }

  /**
   * DELETE 请求
   */
  delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, 'DELETE', undefined, options)
  }

  /**
   * 上传文件
   */
  async upload<T>(
    url: string,
    file: { uri: string; type: string; name: string },
    options?: RequestOptions
  ): Promise<T> {
    const formData = new FormData()
    formData.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any)

    return this.post<T>(url, formData, {
      ...options,
      headers: {
        // 不设置 Content-Type，让 fetch 自动设置
      },
    })
  }
}

export const request = new Request()

