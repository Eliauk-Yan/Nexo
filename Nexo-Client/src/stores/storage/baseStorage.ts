import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * 统一封装 AsyncStorage 基础能力
 * 仅处理 JSON 序列化/反序列化和通用错误兜底
 */
export const storageClient = {
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      if (value == null) {
        await AsyncStorage.removeItem(key)
        return
      }
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem(key, jsonValue)
    } catch (error) {
      console.error(`存储写入失败，key=${key}：`, error)
      throw error
    }
  },

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key)
      return jsonValue != null ? (JSON.parse(jsonValue) as T) : null
    } catch (error) {
      console.error(`存储读取失败，key=${key}：`, error)
      return null
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key)
    } catch (error) {
      console.error(`存储删除失败，key=${key}：`, error)
      throw error
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear()
    } catch (error) {
      console.error('清空所有本地存储失败：', error)
      throw error
    }
  },

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys()
      return Array.from(keys)
    } catch (error) {
      console.error('获取所有本地存储 key 失败：', error)
      return []
    }
  },
}

