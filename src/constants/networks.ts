/**
 * Network Configuration Constants
 * 
 * Contains configuration for BlockDAG Testnet and related network utilities
 */

// BlockDAG Testnet Configuration
export const BLOCKDAG_TESTNET_CONFIG = {
  chainId: '0x413', // 1043 in decimal
  chainName: 'BlockDAG Testnet',
  nativeCurrency: {
    name: 'BDAG',
    symbol: 'BDAG',
    decimals: 18
  },
  rpcUrls: ['https://rpc.primordial.bdagscan.com/'],
  blockExplorerUrls: ['https://primordial.bdagscan.com/']
};

// Primary chain ID for the application
export const BLOCKDAG_CHAIN_ID = BLOCKDAG_TESTNET_CONFIG.chainId;

// Chain ID in decimal format for comparisons
export const BLOCKDAG_CHAIN_ID_DECIMAL = 1043;

// Network display name
export const NETWORK_NAME = 'BlockDAG Testnet';

// Block explorer URL for transactions
export const BLOCK_EXPLORER_URL = 'https://primordial.bdagscan.com';

// RPC URL for direct provider connections
export const RPC_URL = 'https://rpc.primordial.bdagscan.com/';

/**
 * Gets the complete network configuration for wallet_addEthereumChain
 */
export const getNetworkConfig = () => BLOCKDAG_TESTNET_CONFIG;

/**
 * Formats a transaction hash for block explorer viewing
 */
export const getTransactionUrl = (txHash: string): string => {
  return `${BLOCK_EXPLORER_URL}/tx/${txHash}`;
};

/**
 * Formats an address for block explorer viewing
 */
export const getAddressUrl = (address: string): string => {
  return `${BLOCK_EXPLORER_URL}/address/${address}`;
};