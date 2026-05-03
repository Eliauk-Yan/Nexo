import { getNftIapProductId } from '@/config/iap'
import {
  fetchProducts,
  finishTransaction,
  requestPurchase,
  type Purchase,
} from 'expo-iap'
import { Platform } from 'react-native'

export interface NftIapPurchaseResult {
  productId: string
  purchase: Purchase
}

const normalizePurchase = (result: Purchase | Purchase[] | null | undefined) => {
  if (Array.isArray(result)) {
    return result[0]
  }
  return result ?? undefined
}

export const createAppleAppAccountToken = () => {
  const randomUUID = globalThis.crypto?.randomUUID

  if (typeof randomUUID === 'function') {
    return randomUUID()
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const value = Math.floor(Math.random() * 16)
    const nextValue = char === 'x' ? value : (value & 0x3) | 0x8
    return nextValue.toString(16)
  })
}

export const purchaseNftProduct = async (
  nftId: string | number,
  orderId: string,
): Promise<NftIapPurchaseResult> => {
  const productId = getNftIapProductId(nftId)

  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    throw new Error('当前平台不支持应用内购买。')
  }

  const products = await fetchProducts({
    skus: [productId],
    type: 'in-app',
  })
  const product = products?.find((item) => item.id === productId)

  if (!product) {
    throw new Error(`未找到应用内购买商品：${productId}`)
  }

  const purchase = normalizePurchase(
    await requestPurchase({
      request: {
        apple: {
          sku: productId,
          appAccountToken: createAppleAppAccountToken(),
        },
        google: {
          skus: [productId],
        },
      },
      type: 'in-app',
    }),
  )

  if (!purchase) {
    throw new Error('应用内购买未完成。')
  }

  return {
    productId,
    purchase,
  }
}

export const finishNftPurchase = async (purchase?: Purchase) => {
  if (!purchase) {
    return
  }

  await finishTransaction({
    purchase,
    isConsumable: true,
  })
}

export const isIapTransactionReusedError = (error: unknown) => {
  if (error && typeof error === 'object' && 'code' in error && error.code === 'IAP_TRANSACTION_REUSED') {
    return true
  }
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : ''
  return message.includes('IAP_TRANSACTION_REUSED') || message.includes('应用内购买交易已被其他订单使用')
}

export const getPurchaseTransactionId = (purchase: Purchase) => {
  if ('transactionId' in purchase && typeof purchase.transactionId === 'string') {
    return purchase.transactionId
  }

  return purchase.id
}

export const getPurchaseToken = (purchase: Purchase) => purchase.purchaseToken ?? getPurchaseTransactionId(purchase)
