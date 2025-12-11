/**
 * 本地存储工具
 * 封装 AsyncStorage 提供类型安全的存储方法
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS } from '@/config/env'

class Storage {
  /**
   * 存储数据
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem(key, jsonValue)
    } catch (error) {
      console.error(`Storage setItem error for key ${key}:`, error)
      throw error
    }
  }

  /**
   * 获取数据
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key)
      return jsonValue != null ? (JSON.parse(jsonValue) as T) : null
    } catch (error) {
      console.error(`Storage getItem error for key ${key}:`, error)
      return null
    }
  }

  /**
   * 删除数据
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key)
    } catch (error) {
      console.error(`Storage removeItem error for key ${key}:`, error)
      throw error
    }
  }

  /**
   * 清空所有数据
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear()
    } catch (error) {
      console.error('Storage clear error:', error)
      throw error
    }
  }

  /**
   * 获取所有键
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys()
    } catch (error) {
      console.error('Storage getAllKeys error:', error)
      return []
    }
  }

  // Token 相关方法
  async setToken(token: string): Promise<void> {
    return this.setItem(STORAGE_KEYS.TOKEN, token)
  }

  async getToken(): Promise<string | null> {
    return this.getItem<string>(STORAGE_KEYS.TOKEN)
  }

  async removeToken(): Promise<void> {
    return this.removeItem(STORAGE_KEYS.TOKEN)
  }

  // 用户信息相关方法
  async setUserInfo<T>(userInfo: T): Promise<void> {
    return this.setItem(STORAGE_KEYS.USER_INFO, userInfo)
  }

  async getUserInfo<T>(): Promise<T | null> {
    return this.getItem<T>(STORAGE_KEYS.USER_INFO)
  }

  async removeUserInfo(): Promise<void> {
    return this.removeItem(STORAGE_KEYS.USER_INFO)
  }

  // 钱包地址相关方法
  async setWalletAddress(address: string): Promise<void> {
    return this.setItem(STORAGE_KEYS.WALLET_ADDRESS, address)
  }

  async getWalletAddress(): Promise<string | null> {
    return this.getItem<string>(STORAGE_KEYS.WALLET_ADDRESS)
  }

  async removeWalletAddress(): Promise<void> {
    return this.removeItem(STORAGE_KEYS.WALLET_ADDRESS)
  }
}

export const storage = new Storage()

