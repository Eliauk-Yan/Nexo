/**
 * 通知相关类型定义
 */

/**
 * 通知类型
 */
export type NotificationType =
  | 'like'
  | 'comment'
  | 'sale'
  | 'offer'
  | 'transfer'
  | 'system'

/**
 * 通知信息
 */
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: string
}








