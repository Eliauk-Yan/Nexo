/**
 * Mock 收藏集数据
 */

import { Collection } from '@/types'

export const mockCollections: Collection[] = [
  {
    id: '1',
    name: 'CyberPunk',
    description: 'A collection of futuristic cyberpunk-themed NFTs',
    coverImage: 'https://picsum.photos/800/400?random=1',
    logoImage: 'https://picsum.photos/200/200?random=1',
    creator: '0x1234567890123456789012345678901234567890',
    creatorName: 'CryptoArtist',
    totalItems: 10000,
    floorPrice: '0.5',
    totalVolume: '12500.5',
    verified: true,
    createdAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '2',
    name: 'Bored Ape',
    description: 'Unique apes living on the Ethereum blockchain',
    coverImage: 'https://picsum.photos/800/400?random=2',
    logoImage: 'https://picsum.photos/200/200?random=2',
    creator: '0x2345678901234567890123456789012345678901',
    creatorName: 'NFTMaster',
    totalItems: 5000,
    floorPrice: '10.0',
    totalVolume: '50000.0',
    verified: true,
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    id: '3',
    name: 'Azuki',
    description: 'A collection of 10,000 avatars that give you membership access',
    coverImage: 'https://picsum.photos/800/400?random=3',
    logoImage: 'https://picsum.photos/200/200?random=3',
    creator: '0x3456789012345678901234567890123456789012',
    creatorName: 'DigitalCreator',
    totalItems: 10000,
    floorPrice: '5.2',
    totalVolume: '25000.8',
    verified: true,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '4',
    name: 'Doodle',
    description: 'A collection of 10,000 unique Doodles',
    coverImage: 'https://picsum.photos/800/400?random=4',
    logoImage: 'https://picsum.photos/200/200?random=4',
    creator: '0x1234567890123456789012345678901234567890',
    creatorName: 'CryptoArtist',
    totalItems: 10000,
    floorPrice: '1.1',
    totalVolume: '15000.2',
    verified: false,
    createdAt: '2024-02-01T10:00:00Z',
  },
  {
    id: '5',
    name: 'Cool Cats',
    description: 'Cool Cats is a collection of 9,999 randomly generated NFTs',
    coverImage: 'https://picsum.photos/800/400?random=5',
    logoImage: 'https://picsum.photos/200/200?random=5',
    creator: '0x2345678901234567890123456789012345678901',
    creatorName: 'NFTMaster',
    totalItems: 9999,
    floorPrice: '2.5',
    totalVolume: '18000.5',
    verified: true,
    createdAt: '2024-02-10T10:00:00Z',
  },
]

export const getMockCollection = (id: string | number): Collection | undefined => {
  return mockCollections.find((collection) => collection.id === String(id))
}

