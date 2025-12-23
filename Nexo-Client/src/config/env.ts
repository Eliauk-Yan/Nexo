/**
 * 环境变量配置
 * 根据不同的环境（开发、测试、生产）加载不同的配置
 */

export type EnvType = 'development' | 'staging' | 'production'

const getEnv = (): EnvType => {
  if (__DEV__) {
    return 'development'
  }
  // 可以根据需要添加 staging 环境判断
  return 'production'
}

export const ENV = getEnv()

// API 配置
export const API_CONFIG = {
  development: {
    baseURL: 'http://172.20.10.3:8080',
    timeout: 10000,
  },
  staging: {
    baseURL: 'https://staging-api.nexo.com/api',
    timeout: 15000,
  },
  production: {
    baseURL: 'https://api.nexo.com/api',
    timeout: 15000,
  },
}

export const API_BASE_URL = API_CONFIG[ENV].baseURL
export const API_TIMEOUT = API_CONFIG[ENV].timeout
