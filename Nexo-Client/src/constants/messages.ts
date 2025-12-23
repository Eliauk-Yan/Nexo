/**
 * 消息常量
 * 统一管理应用中的提示消息、错误信息等
 */

export const MESSAGES = {
  // 通用消息
  SUCCESS: {
    SAVE: '保存成功',
    DELETE: '删除成功',
    UPDATE: '更新成功',
    CREATE: '创建成功',
    UPLOAD: '上传成功',
    COPY: '复制成功',
  },
  
  ERROR: {
    NETWORK: '网络连接失败，请检查网络设置',
    TIMEOUT: '请求超时，请稍后重试',
    UNKNOWN: '发生未知错误，请稍后重试',
    UNAUTHORIZED: '未授权，请重新登录',
    FORBIDDEN: '没有权限访问',
    NOT_FOUND: '资源不存在',
    SERVER_ERROR: '服务器错误，请稍后重试',
    VALIDATION: '输入信息有误，请检查后重试',
  },
  
  // 认证相关
  AUTH: {
    LOGIN_SUCCESS: '登录成功',
    LOGIN_FAILED: '登录失败，请检查账号密码',
    LOGOUT_SUCCESS: '已退出登录',
    CODE_SENT: '验证码已发送',
    CODE_INVALID: '验证码无效或已过期',
    PASSWORD_RESET: '密码重置成功',
    WALLET_CONNECTED: '钱包连接成功',
    WALLET_DISCONNECTED: '钱包已断开连接',
  },
  
  // NFT 相关
  NFT: {
    MINT_SUCCESS: 'NFT 铸造成功',
    MINT_FAILED: 'NFT 铸造失败',
    TRANSFER_SUCCESS: 'NFT 转移成功',
    TRANSFER_FAILED: 'NFT 转移失败',
    LIKE_SUCCESS: '已添加到收藏',
    UNLIKE_SUCCESS: '已取消收藏',
    LIST_SUCCESS: 'NFT 上架成功',
    LIST_FAILED: 'NFT 上架失败',
    DELETE_SUCCESS: 'NFT 删除成功',
  },
  
  // 交易相关
  TRANSACTION: {
    PENDING: '交易处理中...',
    SUCCESS: '交易成功',
    FAILED: '交易失败',
    CANCELLED: '交易已取消',
  },
  
  // 表单验证
  VALIDATION: {
    REQUIRED: '此字段为必填项',
    EMAIL_INVALID: '请输入有效的邮箱地址',
    PHONE_INVALID: '请输入有效的手机号码',
    PASSWORD_TOO_SHORT: '密码长度至少为 8 位',
    PASSWORD_MISMATCH: '两次输入的密码不一致',
    CODE_REQUIRED: '请输入验证码',
    CODE_INVALID: '验证码格式不正确',
  },
  
  // 确认消息
  CONFIRM: {
    DELETE: '确定要删除吗？此操作不可恢复',
    LOGOUT: '确定要退出登录吗？',
    DISCONNECT_WALLET: '确定要断开钱包连接吗？',
    CANCEL_TRANSACTION: '确定要取消交易吗？',
  },
} as const

