/**
 * Mock 工具函数
 */

/**
 * 模拟网络延迟
 */
export const delay = (ms: number = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 模拟随机延迟（500-2000ms）
 */
export const randomDelay = (): Promise<void> => {
  const ms = Math.floor(Math.random() * 1500) + 500
  return delay(ms)
}

/**
 * 模拟分页响应
 */
export const paginate = <T>(
  data: T[],
  page: number = 1,
  pageSize: number = 20
): {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
} => {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = data.slice(start, end)
  const total = data.length
  const totalPages = Math.ceil(total / pageSize)

  return {
    list,
    total,
    page,
    pageSize,
    totalPages,
  }
}

/**
 * 模拟搜索过滤
 */
export const searchFilter = <T>(
  data: T[],
  keyword: string,
  searchFields: (keyof T)[]
): T[] => {
  if (!keyword.trim()) return data

  const lowerKeyword = keyword.toLowerCase()
  return data.filter((item) =>
    searchFields.some((field) => {
      const value = item[field]
      return value && String(value).toLowerCase().includes(lowerKeyword)
    })
  )
}

/**
 * 模拟排序
 */
export const sortData = <T>(
  data: T[],
  sortBy?: string,
  sortOrder: 'asc' | 'desc' = 'desc'
): T[] => {
  if (!sortBy) return data

  return [...data].sort((a, b) => {
    const aValue = (a as any)[sortBy]
    const bValue = (b as any)[sortBy]

    if (aValue == null && bValue == null) return 0
    if (aValue == null) return 1
    if (bValue == null) return -1

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    }

    const aStr = String(aValue).toLowerCase()
    const bStr = String(bValue).toLowerCase()

    if (sortOrder === 'asc') {
      return aStr.localeCompare(bStr)
    } else {
      return bStr.localeCompare(aStr)
    }
  })
}

/**
 * 模拟过滤
 */
export const filterData = <T>(
  data: T[],
  filters: Record<string, any>
): T[] => {
  return data.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      if (value == null || value === '') return true

      const itemValue = (item as any)[key]

      if (key.includes('Min')) {
        const minKey = key.replace('Min', '')
        return itemValue >= value
      }

      if (key.includes('Max')) {
        const maxKey = key.replace('Max', '')
        return itemValue <= value
      }

      if (Array.isArray(value)) {
        return value.includes(itemValue)
      }

      return itemValue === value || String(itemValue).includes(String(value))
    })
  })
}

/**
 * 生成模拟响应
 */
export const createMockResponse = <T>(data: T, success = true) => {
  return {
    code: success ? 200 : 400,
    message: success ? 'Success' : 'Error',
    data,
  }
}

