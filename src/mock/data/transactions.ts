/**
 * Mock 交易数据
 */

import { Transaction } from '@/types'

const generateTransaction = (id: number): Transaction => {
  const types: Transaction['type'][] = ['mint', 'transfer', 'sale', 'list', 'cancel']
  const statuses: Transaction['status'][] = ['pending', 'success', 'failed', 'cancelled']
  const prices = ['0.5', '1.2', '2.5', '5.0', '10.8', '25.5', '50.0']

  const type = types[Math.floor(Math.random() * types.length)]
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  const price = type === 'sale' || type === 'list' ? prices[Math.floor(Math.random() * prices.length)] : '0'

  return {
    id: String(id),
    nftId: String(Math.floor(Math.random() * 100) + 1),
    nftName: `NFT #${Math.floor(Math.random() * 10000)}`,
    nftImage: `https://picsum.photos/200/200?random=${id}`,
    type,
    from: '0x1234567890123456789012345678901234567890',
    to: '0x2345678901234567890123456789012345678901',
    price,
    currency: 'ETH',
    status,
    txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }
}

export const mockTransactions: Transaction[] = Array.from({ length: 50 }, (_, i) =>
  generateTransaction(i + 1)
)

export const getMockTransaction = (id: string | number): Transaction | undefined => {
  return mockTransactions.find((tx) => tx.id === String(id))
}

export const getMockTransactionsByNFT = (nftId: string): Transaction[] => {
  return mockTransactions.filter((tx) => tx.nftId === nftId)
}

export const getMockTransactionsByUser = (address: string): Transaction[] => {
  return mockTransactions.filter((tx) => tx.from === address || tx.to === address)
}

