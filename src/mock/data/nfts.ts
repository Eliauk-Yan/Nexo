/**
 * Mock NFT 数据
 */

import { NFT, NFTAttribute } from '@/types'

const generateAttributes = (): NFTAttribute[] => {
  const traits = ['Background', 'Eyes', 'Mouth', 'Hat', 'Clothes', 'Accessory']
  const values = [
    ['Blue', 'Red', 'Green', 'Purple', 'Yellow'],
    ['Happy', 'Sad', 'Angry', 'Surprised', 'Wink'],
    ['Smile', 'Frown', 'Open', 'Closed'],
    ['Cap', 'Hat', 'Crown', 'None'],
    ['T-Shirt', 'Jacket', 'Suit', 'Hoodie'],
    ['Necklace', 'Watch', 'Ring', 'None'],
  ]

  return traits.map((trait, index) => ({
    traitType: trait,
    value: values[index][Math.floor(Math.random() * values[index].length)],
  }))
}

const generateNFT = (id: number, collectionName?: string): NFT => {
  const collections = ['CyberPunk', 'Bored Ape', 'Azuki', 'Doodle', 'Cool Cats']
  const statuses: NFT['status'][] = ['listed', 'sold', 'unlisted']
  const prices = ['0.5', '1.2', '2.5', '5.0', '10.8', '25.5', '50.0', '100.0']

  const collection = collectionName || collections[Math.floor(Math.random() * collections.length)]
  const num = Math.floor(Math.random() * 10000)
  const name = `${collection} #${num}`
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  const price = status === 'listed' ? prices[Math.floor(Math.random() * prices.length)] : undefined

  return {
    id: String(id),
    tokenId: String(id),
    name,
    description: `A unique ${collection} digital collectible. This NFT represents ownership of a one-of-a-kind piece of digital art in the ${collection} collection.`,
    image: `https://picsum.photos/400/400?random=${id}`,
    animationUrl: Math.random() > 0.7 ? `https://example.com/animations/${id}.mp4` : undefined,
    collectionId: String(Math.floor(id / 10) + 1),
    collectionName: collection,
    owner: '0x1234567890123456789012345678901234567890',
    creator: '0x1234567890123456789012345678901234567890',
    price,
    currency: 'ETH',
    status,
    attributes: generateAttributes(),
    likes: Math.floor(Math.random() * 1000) + 10,
    isLiked: Math.random() > 0.5,
    views: Math.floor(Math.random() * 5000) + 100,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export const mockNFTs: NFT[] = Array.from({ length: 100 }, (_, i) => generateNFT(i + 1))

export const getMockNFT = (id: string | number): NFT | undefined => {
  return mockNFTs.find((nft) => nft.id === String(id))
}

export const getMockNFTsByCollection = (collectionId: string): NFT[] => {
  return mockNFTs.filter((nft) => nft.collectionId === collectionId)
}

export const getMockNFTsByOwner = (owner: string): NFT[] => {
  return mockNFTs.filter((nft) => nft.owner === owner)
}

export const getMockNFTsByCreator = (creator: string): NFT[] => {
  return mockNFTs.filter((nft) => nft.creator === creator)
}

