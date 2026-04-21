import { Alert } from 'react-native'

const ALERT_SHOWN_KEY = '__alertShown'

export interface AlertedError extends Error {
  [ALERT_SHOWN_KEY]?: boolean
}

export function getErrorMessage(error: unknown, fallback = '操作失败，请稍后重试。') {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string' && error.trim()) return error
  return fallback
}

export function markErrorAlertShown(error: unknown) {
  if (error && typeof error === 'object') {
    ;(error as AlertedError)[ALERT_SHOWN_KEY] = true
  }
}

export function isErrorAlertShown(error: unknown) {
  return Boolean(error && typeof error === 'object' && (error as AlertedError)[ALERT_SHOWN_KEY])
}

export function showErrorAlert(error: unknown, fallback = '操作失败，请稍后重试。') {
  if (isErrorAlertShown(error)) return
  Alert.alert('提示', getErrorMessage(error, fallback))
  markErrorAlertShown(error)
}
