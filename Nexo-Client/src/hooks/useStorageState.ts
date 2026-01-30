// 路由认证(官网): https://docs.expo.dev/router/advanced/authentication/
import { useEffect, useCallback, useReducer } from 'react'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void]

function useAsyncState<T>(initialValue: [boolean, T | null] = [true, null]): UseStateHook<T> {
  return useReducer(
    (state: [boolean, T | null], action: T | null = null): [boolean, T | null] => [false, action],
    initialValue,
  ) as UseStateHook<T>
}

export async function setStorageItemAsync(key: string, value: any | null) {
  if (Platform.OS === 'web') {
    try {
      if (value === null) {
        localStorage.removeItem(key)
      } else {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
        localStorage.setItem(key, stringValue)
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e)
    }
  } else {
    if (value == null) {
      await SecureStore.deleteItemAsync(key)
    } else {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
      await SecureStore.setItemAsync(key, stringValue)
    }
  }
}

export function useStorageState<T = string>(key: string): UseStateHook<T> {
  // Public
  const [state, setState] = useAsyncState<T>()

  // Get
  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          const value = localStorage.getItem(key)
          try {
            setState(value ? JSON.parse(value) : null)
          } catch {
            setState(value as any)
          }
        }
      } catch (e) {
        console.error('Local storage is unavailable:', e)
      }
    } else {
      SecureStore.getItemAsync(key).then((value: string | null) => {
        try {
          setState(value ? JSON.parse(value) : null)
        } catch {
          setState(value as any)
        }
      })
    }
  }, [key])

  // Set
  const setValue = useCallback(
    (value: T | null) => {
      setState(value)
      setStorageItemAsync(key, value)
    },
    [key],
  )

  return [state, setValue]
}
