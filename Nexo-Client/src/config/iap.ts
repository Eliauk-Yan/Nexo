export const IAP_PRODUCT_PREFIX =
  process.env.EXPO_PUBLIC_IAP_PRODUCT_PREFIX?.trim() || 'com.shijieyan.nexo.nft'

export const getNftIapProductId = (nftId: string | number) =>
  `${IAP_PRODUCT_PREFIX}.${String(nftId)}`

export const getNftIapProductIds = (nftIds: (string | number)[]) =>
  Array.from(new Set(nftIds.map((nftId) => getNftIapProductId(nftId))))
