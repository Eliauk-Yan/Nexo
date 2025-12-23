/**
 * 通用类型定义
 * 所有模块共享的基础类型
 */

/**
 * 后端统一返回格式
 */
export interface BaseResponse<T = any> {
  code: string
  success: boolean
  message: string
  data: T
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number
  pageSize: number
}

/**
 * 分页响应
 */
export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * API 错误
 */
export interface ApiError {
  code: number
  message: string
  details?: any
}








