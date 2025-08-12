import { StarknetConfig, publicProvider } from '@starknet-react/core'
import { argent, braavos } from '@starknet-react/core'
import { mainnet, sepolia } from '@starknet-react/chains'
import { Chain } from '@starknet-react/chains'

// Contract addresses - Update these with actual deployed contract addresses
export const CONTRACT_ADDRESS = '0x...' // Replace with actual contract address

// Dataset interface matching Cairo contract
export interface Dataset {
  owner: string;
  name: string;
  ipfs_hash: string;
  price: bigint;
  id: bigint;
  category: string;
}

export interface UserStats {
  uploads: number;
  downloads: number;
  address: string;
}

// Available connectors
export const connectors = [
  argent(),
  braavos(),
]

// Chains configuration
export const chains: Chain[] = [
  mainnet,
  sepolia,
]

// Provider configuration
export const provider = publicProvider()

// Dataset categories
export const DATASET_CATEGORIES = [
  'Computer Vision',
  'Natural Language Processing',
  'Audio Processing', 
  'Time Series',
  'Reinforcement Learning',
  'Medical Data',
  'Financial Data',
  'IoT Sensor Data',
  'Social Media',
  'Other'
] as const

export type DatasetCategory = typeof DATASET_CATEGORIES[number]