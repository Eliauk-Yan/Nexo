import { post } from '@/utils/request'

export type PaymentType = 'MOCK' | 'WECHAT'

export interface WechatPayParams {
  partnerId?: string
  prepayId?: string
  nonceStr?: string
  timeStamp?: number
  packageValue?: string
  sign?: string
  extraData?: string
}

export interface BuyRequest {
  productId: string
  nftType: 'NFT'
  itemCount: number
}

export interface PayRequest {
  orderId: string
  paymentType: PaymentType
}

export interface CancelRequest {
  orderId: string
}

export interface PayVO {
  payOrderId?: string
  payState?: string
  wechatPayParams?: WechatPayParams
}

export const tradeApi = {
  buy: (data: BuyRequest, token: string) => {
    return post<string>(
      '/trade/buy',
      data,
      {
        Authorization: token,
      },
      {
        throwOnError: false,
      },
    )
  },

  pay: (data: PayRequest) => {
    return post<PayVO>('/trade/pay', data)
  },

  cancel: (data: CancelRequest) => {
    return post<boolean>('/trade/cancel', data)
  },
}
