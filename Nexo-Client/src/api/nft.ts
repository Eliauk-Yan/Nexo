import request, { get } from '@/utils/request'

export interface NFT {
  id: number
  name: string
  cover: string
  price: number
  quantity: number
  inventory: number | null
  saleTime: string | null
  bookStartTime: string | null
  bookEndTime: string | null
  canBook: boolean
  hasBooked: boolean | null
  productState: 'NOT_FOR_SALE' | 'SELLING' | 'SOLD_OUT' | 'COMING_SOON' | 'WAIT_FOR_SALE'
}

export interface NFTDetail {
  id: number
  name: string
  cover: string
  price: number
  quantity: number
  inventory: number | null
  saleTime: string | null
  description: string | null
  productState: 'NOT_FOR_SALE' | 'SELLING' | 'SOLD_OUT' | 'COMING_SOON' | 'WAIT_FOR_SALE'
}

export interface QueryNFTRequest {
  currentPage: number
  pageSize: number
  keyword?: string
}

export interface Asset {
  id: number
  artworkId: number
  artworkName: string
  artworkCover: string
  purchasePrice: number
  serialNumber: string
  state: string
  transactionHash: string
  createdAt: string
}

export interface PageAssetResponse {
  records: Asset[]
  total: number
  size: number
  current: number
  pages: number
}

export const nftApi = {
  /**
   * 获取藏品列表
   */
  list: (param: QueryNFTRequest) => {
    return get<NFT[]>('/artwork/list', param)
  },

  /**
   * 获取藏品详情
   */
  getDetail: (id: number) => {
    return get<NFTDetail>(`/artwork/${id}`)
  },

  /**
   * 获取我的数字资产列表
   */
  getMyAssets: (currentPage: number, pageSize: number) => {
    return get<Asset[]>('/artwork/myAssets', { current: currentPage, size: pageSize })
  },

  /**
   * 销毁我的数字资产
   */
  destroyAsset: (assetId: number) => {
    const id = String(assetId)
    return request('/artwork/destroy', {
      method: 'POST',
      params: { assetId: id },
      body: { assetId: id },
    }) as Promise<boolean>
  },
}
