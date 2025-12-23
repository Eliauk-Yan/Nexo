/**
 * 用户相关工具函数
 */

/**
 * 根据钱包地址获取用户昵称
 * 如果无昵称数据，返回简化地址（前6位...后4位）
 */
export const getCreatorNickname = (walletAddress: string): string => {
  if (walletAddress.length > 10) {
    return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
  }
  return walletAddress
}

