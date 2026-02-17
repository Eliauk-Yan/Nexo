import { API_ENDPOINTS } from '@/constants/api'
import { post } from '@/utils/request'

/**
 * 购买请求参数
 */
export interface BuyRequest {
  /** 商品ID */
  productId: string
  /** 商品类型：ARTWORK-藏品, BLIND_BOX-盲盒 */
  productType: string
  /** 商品数量 */
  itemCount: number
}

export const tradeApi = {
  /**
   * 立即购买
   * @param data 购买请求参数
   * @param token
   * @padata: BuyRequest, token: string入 Authorization 请求头
   */
  buy: (data: BuyRequest, token: string) => {
    return post<string>(API_ENDPOINTS.TRADE.BUY, data, {
      Authorization: token,
    })
  },
}
