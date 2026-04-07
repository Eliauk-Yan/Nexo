import { post } from '@/utils/request'

/**
 * 支付方式枚举（与后端 PaymentType 对应�?
 */
export type PaymentType = 'WECHAT' | 'MOCK'

/**
 * 购买请求参数
 */
export interface BuyRequest {
  /** 商品ID */
  productId: string
  /** 商品类型：与后端 NFTType 枚举保持一�?*/
  nftType: 'NFT'
  /** 商品数量 */
  itemCount: number
}

/**
 * 支付请求参数
 */
export interface PayRequest {
  /** 订单�?*/
  orderId: string
  /** 支付方式 */
  paymentType: PaymentType
}

/**
 * 支付响应
 */
export interface PayVO {
  /** 支付单号 */
  payOrderId: string
  /** 支付链接 */
  payUrl: string
  /** 支付状�?*/
  payState: string
}

export const tradeApi = {
  /**
   * 立即购买
   * @param data 购买请求参数
   * @param token
   */
  buy: (data: BuyRequest, token: string) => {
    return post<string>('/trade/buy', data, {
      Authorization: token,
    })
  },

  /**
   * 发起支付
   * @param data 支付请求参数
   */
  pay: (data: PayRequest) => {
    return post<PayVO>('/trade/pay', data)
  },
}


