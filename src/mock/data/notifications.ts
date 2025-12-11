/**
 * Mock 通知数据
 */

import { Notification } from '@/types'

const generateNotification = (id: number): Notification => {
  const types: Notification['type'][] = ['like', 'comment', 'sale', 'offer', 'transfer', 'system']
  
  const type = types[Math.floor(Math.random() * types.length)]
  const read = Math.random() > 0.3

  const messages = {
    like: {
      title: '有人点赞了您的 NFT',
      message: 'CryptoArtist 点赞了您的 NFT "CyberPunk #8821"',
    },
    comment: {
      title: '新的评论',
      message: 'NFTMaster 评论了您的 NFT "Bored Ape #120"',
    },
    sale: {
      title: 'NFT 已售出',
      message: '您的 NFT "Azuki #999" 已成功售出，价格为 5.2 ETH',
    },
    offer: {
      title: '收到新的出价',
      message: '有人为您的 NFT "Doodle #45" 出价 2.5 ETH',
    },
    transfer: {
      title: 'NFT 转移',
      message: '您收到了一个新的 NFT "Cool Cats #123"',
    },
    system: {
      title: '系统通知',
      message: '您的账户验证已通过',
    },
  }

  const { title, message } = messages[type]

  return {
    id: String(id),
    type,
    title,
    message,
    data: {
      nftId: String(Math.floor(Math.random() * 100) + 1),
      userId: String(Math.floor(Math.random() * 3) + 1),
    },
    read,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }
}

export const mockNotifications: Notification[] = Array.from({ length: 20 }, (_, i) =>
  generateNotification(i + 1)
)

export const getMockUnreadCount = (): number => {
  return mockNotifications.filter((n) => !n.read).length
}

