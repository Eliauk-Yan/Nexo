import React, { useCallback, useEffect, useReducer, useRef } from 'react'

// 1. 定义泛型状态接口
interface State<T> {
  data?: T
  loading: boolean
  error: boolean
}

// 2. 定义 Action 类型
type Action<T> =
  | { type: 'FETCH_SUCCESS'; payload: T }
  | { type: 'FETCH_ERROR'; error?: any }
  | { type: 'SET_DATA'; payload: T }
  | { type: 'RELOAD_START' }

// 定义常量以防止字符串拼写错误
const FETCH_SUCCESS = 'FETCH_SUCCESS'
const FETCH_ERROR = 'FETCH_ERROR'
const SET_DATA = 'SET_DATA'
const RELOAD_START = 'RELOAD_START'

// 定义 Reducer：纯函数处理状态流转
const reducer = <T>(state: State<T>, action: Action<T>): State<T> => {
  switch (action.type) {
    case FETCH_SUCCESS:
      return { ...state, data: action.payload, loading: false, error: false }
    case FETCH_ERROR:
      return { ...state, loading: false, error: true }
    case SET_DATA:
      return { ...state, data: action.payload }
    case RELOAD_START:
      return { ...state, loading: true, error: false }
    default:
      return state
  }
}

/**
 * 4. 自定义 Hook：useFetchData
 * @param fetcher 异步请求函数（返回 Promise）
 * @param deps 依赖数组，用于触发重新请求
 */
export function useFetchData<T>(fetcher: () => Promise<T>, deps: any[] = []) {
  // 5. 使用 useReducer 管理复杂状态
  const [state, dispatch] = useReducer(reducer, {
    data: undefined,
    loading: true,
    error: false,
  }) as [State<T>, React.Dispatch<Action<T>>]

  // 6. 核心技巧：使用 useRef 存储 fetcher
  // 目的：即使 fetcher 函数在外部是匿名函数（每次渲染都变），也不会导致此 Hook 内部频繁触发
  const fetcherRef = useRef(fetcher)

  //  7. 同步 Ref：每次渲染后将最新的 fetcher 函数存入 Ref
  // 这样在 fetchData 异步闭包中执行的永远是当前最新的 fetcher 逻辑
  useEffect(() => {
    fetcherRef.current = fetcher
  })

  // 8. 使用 useCallback 持久化请求逻辑
  // 依赖项只追踪外部传入的 deps，确保只有在业务参数变化时才更新 fetchData 的引用
  const fetchData = useCallback(async () => {
    try {
      const data = await fetcherRef.current()
      dispatch({ type: FETCH_SUCCESS, payload: data })
    } catch (err) {
      console.error('Fetch error:', err)
      dispatch({ type: FETCH_ERROR, error: err })
    }
  }, [deps])

  // 9. 重新加载方法
  const onReload = useCallback(async () => {
    dispatch({ type: RELOAD_START })
    await fetchData()
  }, [fetchData])

  // 10. 手动更新数据方法
  const setData = useCallback((data: T) => {
    dispatch({ type: SET_DATA, payload: data })
  }, [])

  // 11. 副作用监听：当依赖数组 deps 变化时，自动执行 fetchData
  useEffect(() => {
    fetchData().catch((err) => console.error('Fetch error:', err))
  }, [...deps])

  return {
    ...state,
    setData,
    reload: onReload,
  }
}

export default useFetchData
