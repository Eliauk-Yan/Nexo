import { post } from '@/utils/request'

export interface BuyRequest {
  productId: string
  nftType: 'NFT'
  itemCount: number
}

export interface PayRequest {
  orderId: string
  iapProductId?: string
  iapTransactionId?: string
  iapPurchaseToken?: string
}

export interface CancelRequest {
  orderId: string
}

export interface PayVO {
  payOrderId?: string
  payState?: string
}

interface PayOptions {
  suppressErrorAlert?: boolean
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

  pay: (data: PayRequest, options?: PayOptions) => {
    return post<PayVO>('/trade/pay', data, undefined, options)
  },

  cancel: (data: CancelRequest) => {
    return post<boolean>('/trade/cancel', data)
  },
}
