import { get } from '@/utils/request'

/**
 * 订单状态枚举
 */
export type OrderState = 'CREATE' | 'CONFIRM' | 'PAID' | 'FINISH' | 'CLOSED' | 'DISCARD'

/**
 * 订单VO（字段名与后端返回 JSON 一致）
 */
export interface OrderVO {
  /** 订单id */
  orderId: string
  /** 买家id */
  buyerId: string
  /** 买家名称 */
  buyerName: string | null
  /** 买家类型 */
  buyerType: string
  /** 卖家id */
  sellerId: string
  /** 卖家名称 */
  sellerName: string | null
  /** 卖家类型 */
  sellerType: string
  /** 商品Id */
  productId: string
  /** 商品类型 */
  productType: string
  /** 商品封面图片地址 */
  productCoverUrl: string | null
  /** 商品名称 */
  productName: string | null
  /** 商品单价 */
  unitPrice: number
  /** 商品数量 */
  quantity: number
  /** 总价 */
  totalPrice: number
  /** 订单状态 */
  orderState: OrderState
  /** 已支付金额 */
  paymentAmount: number
  /** 支付成功时间 */
  paymentTime: string | null
  /** 确认时间 */
  confirmTime: string | null
  /** 完成时间 */
  completionTime: string | null
  /** 关单时间 */
  closingTime: string | null
  /** 支付方式 */
  paymentMethod: string | null
  /** 支付流水号 */
  paymentStreamId: string | null
  /** 是否超时 */
  timeout: boolean | null
}

/**
 * 查询订单列表请求参数
 */
export interface QueryOrderRequest {
  /** 订单状态（null 则查全部） */
  state?: OrderState
  /** 当前页码 */
  current: number
  /** 页大小 */
  size: number
}

export const orderApi = {
  /**
   * 获取订单列表
   */
  list: (params: QueryOrderRequest) => {
    return get<OrderVO[]>('/order/list', params)
  },
}
