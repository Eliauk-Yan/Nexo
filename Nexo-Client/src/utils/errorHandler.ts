/**
 * 错误处理工具
 * 统一处理应用中的错误
 */

import { ApiError } from '@/types'
import { MESSAGES } from '@/constants/messages'
import { logger } from './logger'

export class AppError extends Error {
  code: number
  details?: any

  constructor(message: string, code = 500, details?: any) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
  }
}

/**
 * 处理 API 错误
 */
export const handleApiError = (error: ApiError | Error): string => {
  logger.error('API Error:', error)

  if ('code' in error) {
    const apiError = error as ApiError
    
    // 优先返回后端返回的错误消息
    if (apiError.message) {
      return apiError.message
    }
    
    // 根据 HTTP 状态码返回对应的错误消息
    switch (apiError.code) {
      case 400:
        return MESSAGES.ERROR.VALIDATION
      case 401:
        return MESSAGES.ERROR.UNAUTHORIZED
      case 403:
        return MESSAGES.ERROR.FORBIDDEN
      case 404:
        return MESSAGES.ERROR.NOT_FOUND
      case 408:
        return MESSAGES.ERROR.TIMEOUT
      case 500:
      case 502:
      case 503:
        return MESSAGES.ERROR.SERVER_ERROR
      default:
        // 业务错误码（如 100001）直接返回消息，如果没有消息则返回未知错误
        return MESSAGES.ERROR.UNKNOWN
    }
  }

  // 网络错误
  if (error.message.includes('Network')) {
    return MESSAGES.ERROR.NETWORK
  }

  // 超时错误
  if (error.message.includes('timeout')) {
    return MESSAGES.ERROR.TIMEOUT
  }

  return error.message || MESSAGES.ERROR.UNKNOWN
}

/**
 * 处理表单验证错误
 */
export const handleValidationError = (field: string, value: any): string | null => {
  // 必填验证
  if (!value || (typeof value === 'string' && !value.trim())) {
    return MESSAGES.VALIDATION.REQUIRED
  }

  // 邮箱验证
  if (field === 'email' && typeof value === 'string') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return MESSAGES.VALIDATION.EMAIL_INVALID
    }
  }

  // 手机号验证
  if (field === 'phone' && typeof value === 'string') {
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(value)) {
      return MESSAGES.VALIDATION.PHONE_INVALID
    }
  }

  // 密码验证
  if (field === 'password' && typeof value === 'string') {
    if (value.length < 8) {
      return MESSAGES.VALIDATION.PASSWORD_TOO_SHORT
    }
  }

  // 验证码验证
  if (field === 'code' && typeof value === 'string') {
    const codeRegex = /^\d{6}$/
    if (!codeRegex.test(value)) {
      return MESSAGES.VALIDATION.CODE_INVALID
    }
  }

  return null
}

/**
 * 错误边界组件使用的错误处理
 */
export const handleErrorBoundary = (error: Error, errorInfo: any): void => {
  logger.error('Error Boundary:', error, errorInfo)
  
  // 可以在这里上报错误到监控服务
  // errorReportingService.captureException(error, { extra: errorInfo })
}

