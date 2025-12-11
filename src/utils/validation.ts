/**
 * 表单验证工具
 * 提供常用的验证函数
 */

/**
 * 验证邮箱格式
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证手机号格式（中国大陆）
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 验证密码强度
 * 至少8位，包含字母和数字
 */
export const validatePassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/
  return passwordRegex.test(password)
}

/**
 * 验证钱包地址格式（以太坊地址）
 */
export const validateWalletAddress = (address: string): boolean => {
  const addressRegex = /^0x[a-fA-F0-9]{40}$/
  return addressRegex.test(address)
}

/**
 * 验证验证码格式（6位数字）
 */
export const validateCode = (code: string): boolean => {
  const codeRegex = /^\d{6}$/
  return codeRegex.test(code)
}

/**
 * 验证 URL 格式
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 验证是否为空
 */
export const validateRequired = (value: string | null | undefined): boolean => {
  return value != null && value.trim().length > 0
}

/**
 * 验证字符串长度
 */
export const validateLength = (
  value: string,
  min?: number,
  max?: number
): boolean => {
  const length = value.length
  if (min != null && length < min) return false
  if (max != null && length > max) return false
  return true
}

/**
 * 验证数字范围
 */
export const validateNumberRange = (
  value: number,
  min?: number,
  max?: number
): boolean => {
  if (min != null && value < min) return false
  if (max != null && value > max) return false
  return true
}

/**
 * 格式化手机号（显示中间4位为*）
 */
export const formatPhone = (phone: string): string => {
  if (!phone || phone.length !== 11) return phone
  return `${phone.slice(0, 3)}****${phone.slice(7)}`
}

/**
 * 格式化钱包地址（显示前6位和后4位）
 */
export const formatWalletAddress = (address: string, length = 10): string => {
  if (!address || address.length < length) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * 格式化价格
 */
export const formatPrice = (price: string | number, decimals = 4): string => {
  const num = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(num)) return '0'
  return num.toFixed(decimals)
}

/**
 * 格式化大数字（如：1.2K, 1.5M）
 */
export const formatLargeNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

/**
 * 格式化日期
 */
export const formatDate = (date: string | Date, format = 'YYYY-MM-DD'): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化相对时间（如：刚刚、5分钟前）
 */
export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date()
  const target = typeof date === 'string' ? new Date(date) : date
  const diff = now.getTime() - target.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return formatDate(target)
}

