/**
 * 日志工具
 * 统一管理应用的日志输出
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private isDevelopment = __DEV__

  private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`
    return `${prefix} ${message}`
  }

  debug(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage('debug', message), ...args)
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.info(this.formatMessage('info', message), ...args)
    }
  }

  warn(message: string, ...args: any[]): void {
    console.warn(this.formatMessage('warn', message), ...args)
  }

  error(message: string, error?: Error | any, ...args: any[]): void {
    console.error(this.formatMessage('error', message), error, ...args)
    
    // 在生产环境可以将错误上报到服务器
    if (!this.isDevelopment && error) {
      // 这里可以集成错误上报服务，如 Sentry
      // errorReportingService.captureException(error)
    }
  }

  // API 请求日志
  apiRequest(method: string, url: string, data?: any): void {
    this.debug(`API Request: ${method} ${url}`, data)
  }

  apiResponse(method: string, url: string, response: any): void {
    this.debug(`API Response: ${method} ${url}`, response)
  }

  apiError(method: string, url: string, error: any): void {
    this.error(`API Error: ${method} ${url}`, error)
  }
}

export const logger = new Logger()

