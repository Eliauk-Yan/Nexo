/**
 * Mock 用户数据
 */

import { User, UserProfile } from '@/types'

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'CryptoArtist',
    email: 'artist@nexo.com',
    phone: '13800138000',
    avatar: 'https://i.pravatar.cc/150?img=1',
    bio: 'Digital artist & NFT collector. Exploring the metaverse one block at a time. 🚀',
    walletAddress: '0x1234567890123456789012345678901234567890',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    username: 'NFTMaster',
    email: 'master@nexo.com',
    phone: '13800138001',
    avatar: 'https://i.pravatar.cc/150?img=2',
    bio: 'Passionate about blockchain and digital art.',
    walletAddress: '0x2345678901234567890123456789012345678901',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '3',
    username: 'DigitalCreator',
    email: 'creator@nexo.com',
    phone: '13800138002',
    avatar: 'https://i.pravatar.cc/150?img=3',
    bio: 'Creating unique digital experiences.',
    walletAddress: '0x3456789012345678901234567890123456789012',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
  },
]

export const mockUserProfiles: UserProfile[] = mockUsers.map((user) => ({
  ...user,
  followers: Math.floor(Math.random() * 50000) + 1000,
  following: Math.floor(Math.random() * 1000) + 100,
  totalVolume: (Math.random() * 1000 + 10).toFixed(2),
  totalNFTs: Math.floor(Math.random() * 500) + 10,
  collections: Math.floor(Math.random() * 20) + 1,
}))

export const mockCurrentUser: UserProfile = mockUserProfiles[0]

