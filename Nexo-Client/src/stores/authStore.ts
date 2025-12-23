import * as SecureStore from 'expo-secure-store'
import { storageClient } from './storage/baseStorage'

const STORAGE_KEYS = {
  TOKEN: 'satoken',
  USER_STORE_KEY: 'user-store-key',
}
/**
 * 认证/用户相关的持久化存储
 * - Token 使用 expo-secure-store
 * - 其他信息走 AsyncStorage
 */
export const authStore = {

  async setToken(token: string): Promise<void> {
    return SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, token)
  },

  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(STORAGE_KEYS.TOKEN)
  },

  async removeToken(): Promise<void> {
    return SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN)
  },

  async setUserInfo<T>(userInfo: T): Promise<void> {
    return storageClient.setItem(STORAGE_KEYS.USER_STORE_KEY, userInfo)
  },

  async getUserInfo<T>(): Promise<T | null> {
    return storageClient.getItem<T>(STORAGE_KEYS.USER_STORE_KEY)
  },

  async removeUserInfo(): Promise<void> {
    return storageClient.removeItem(STORAGE_KEYS.USER_STORE_KEY)
  }
}

