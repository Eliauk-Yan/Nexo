import { post } from '@/utils/request'

export type PaymentType = 'MOCK'

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
  payUrl?: string
  payState?: string
}

export const tradeApi = {
  buy: (data: BuyRequest, token: string) => {
    return post<string>('/trade/buy', data, {
      Authorization: token,
    })
  },

  pay: (data: PayRequest) => {
    return post<PayVO>('/trade/pay', data)
  },

  cancel: (data: CancelRequest) => {
    return post<boolean>('/trade/cancel', data)
  },
}
