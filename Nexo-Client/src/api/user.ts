import { get, put, post } from '@/utils/request'

/** 与后端 UserInfo 一致，/user/profile 返回此类型 */
export interface UserInfo {
  id: string | number
  nickName?: string
  avatarUrl?: string
  role?: string
  state?: string
  phone?: string
  email?: string
  /** 链地址/钱包地址 */
  account?: string
  /** 后端返回的链地址字段 */
  address?: string
  /** 我的邀请码 */
  inviteCode?: string
  /** 实名认证状态 */
  certification?: boolean
  /** 是否绑定了苹果账号 */
  hasAppleBound?: boolean
}

export interface UpdateUserRequest {
  nickName?: string
  phone?: string
  password?: string
}

export interface RealNameAuthDTO {
  realName: string
  idCardNo: string
}

export interface InviteRankInfo {
  nickName?: string
  inviteScore?: number
  avatar?: string
}

/** 简要用户信息，/user/info/phone 返回此类型 */
export interface SimpleUserInfo {
  id: number
  nickName?: string
  avatarUrl?: string
}

export const userApi = {
  /**
   * 获取用户信息（与后端 Result&lt;UserInfo&gt; 一致）
   */
  getUserProfile: () => {
    return get<UserInfo>('/user/profile').then(normalizeUserInfo)
  },

  /**
   * 更新用户昵称
   * @param data 更新数据
   * @returns 更新结果
   */
  updateNickName: (data: UpdateUserRequest) => {
    return put<boolean>('/user/nickName', data)
  },

  /**
   * 用户实名认证
   * @param data
   */
  realNameAuthentication: (data: RealNameAuthDTO) => {
    return post<boolean>('/user/realNameAuth', data)
  },

  /**
   * 更新用户头像
   * @param data
   */
  updateAvatar: (data: FormData) => {
    return put<string>('/user/avatar', data)
  },

  /**
   * 获取邀请积分排行榜
   */
  getInviteTopN: (topN = 100) => {
    return get<InviteRankInfo[]>('/user/invite/getTopN', { topN })
  },

  /**
   * 获取当前用户邀请积分排名
   */
  getMyInviteRank: () => {
    return get<number | null>('/user/invite/getMyRank')
  },

  /**
   * 根据手机号查询用户简要信息（用于转赠查询受赠人）
   */
  getUserByPhone: (phone: string) => {
    return get<SimpleUserInfo>('/user/info/phone', { phone }, { suppressErrorAlert: true })
  },
}

export function normalizeUserInfo(data?: UserInfo | null): UserInfo {
  return {
    id: data?.id ?? '',
    nickName: data?.nickName,
    avatarUrl: data?.avatarUrl,
    role: data?.role,
    state: data?.state,
    phone: data?.phone,
    email: data?.email,
    address: data?.address,
    account: data?.address ?? data?.account,
    inviteCode: data?.inviteCode,
    certification: data?.certification,
    hasAppleBound: data?.hasAppleBound,
  }
}
