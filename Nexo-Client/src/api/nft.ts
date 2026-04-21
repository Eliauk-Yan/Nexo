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

export type AssetState = 'INIT' | 'ACTIVE' | 'DESTROYING' | 'DESTROYED'

export interface QueryAssetListRequest {
  currentPage: number
  pageSize: number
  keyword?: string
  state?: AssetState
}

export interface Asset {
  id: number
  nftId?: number
  nftName?: string
  nftCover?: string
  artworkId: number
  artworkName: string
  artworkCover: string
  purchasePrice: number
  serialNumber: string
  state: string
  transactionHash: string
  createdAt: string
}

export interface TransferAssetRequest {
  assetId: string
  recipeId: string
}

export const nftApi = {
  /**
   * 获取藏品列表
   */
  list: (param: QueryNFTRequest) => {
    return get<NFT[]>('/artwork/list', {
      keyword: param.keyword,
      currentPage: param.currentPage,
      pageSize: param.pageSize,
    })
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
  getMyAssets: (param: QueryAssetListRequest) => {
    return get<Asset[]>('/artwork/asset/list', {
      keyword: param.keyword,
      state: param.state,
      currentPage: param.currentPage,
      pageSize: param.pageSize,
    }).then((assets) =>
      (assets || []).map((asset) => ({
        ...asset,
        artworkId: asset.artworkId ?? asset.nftId ?? 0,
        artworkName: asset.artworkName ?? asset.nftName ?? '',
        artworkCover: asset.artworkCover ?? asset.nftCover ?? '',
      })),
    )
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

  /**
   * 转增我的数字资产
   */
  transferAsset: (data: TransferAssetRequest) => {
    return request('/artwork/transfer', {
      method: 'POST',
      body: data,
    }) as Promise<boolean>
  },
}
