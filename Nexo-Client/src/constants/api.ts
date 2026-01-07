/**
 * API 端点常量
 * 统一管理所有 API 接口路径
 */

export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: `/auth/login`,
    LOGOUT: `/auth/logout`,
    SEND_VERIFICATION_CODE: `/auth/verifyCode`,
  },

  // 用户相关
  USER: {
    PROFILE: `/user/profile`,
    UPDATE_NICK_NAME: `/user/nickName`,
    REAL_NAME_AUTH: `/user/realNameAuth`,
  },

  // 藏品相关
  ARTWORK: {
    LIST: `/artwork/list`,
    DETAIL: `/artwork`, // Base path for detail, id will be appended
  },
} as const
