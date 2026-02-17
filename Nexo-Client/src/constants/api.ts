/**
 * API 端点常量
 * 统一管理所有 API 接口路径
 */

export const API_ENDPOINTS = {
  // 藏品相关
  ARTWORK: {
    LIST: `/artwork/list`,
    DETAIL: `/artwork`, // Base path for detail, id will be appended
  },
  // 交易相关
  TRADE: {
    BUY: `/trade/buy`,
  },
} as const
