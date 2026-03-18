/**
 * Network Configuration Constants
 * 
 * Allows configuring the target network via environment variables with sensible defaults.
 */

type WalletNetworkConfig = {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
};

type ResolvedNetworkConfig = WalletNetworkConfig & {
  chainIdDecimal: number;
};

const DEFAULT_NETWORK: ResolvedNetworkConfig = {
  chainId: '0x13882', // 80002 in decimal
  chainIdDecimal: 80002,
  chainName: 'Polygon Amoy',
  nativeCurrency: {
    name: 'POL',
    symbol: 'POL',
    decimals: 18
  },
  rpcUrls: ['https://rpc-amoy.polygon.technology/'],
  blockExplorerUrls: ['https://amoy.polygonscan.com/']
};

const parseNumber = (value?: string) => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeHexChainId = (value?: string) => {
  if (!value) return null;
  return value.startsWith('0x') ? value : `0x${value}`;
};

const envChainIdDecimal = parseNumber(process.env.REACT_APP_NETWORK_CHAIN_ID);
const envChainIdHex = normalizeHexChainId(process.env.REACT_APP_NETWORK_CHAIN_ID_HEX);
const chainIdDecimal = envChainIdDecimal ?? (envChainIdHex ? parseInt(envChainIdHex, 16) : DEFAULT_NETWORK.chainIdDecimal);
const chainIdHex = envChainIdHex ?? `0x${chainIdDecimal.toString(16)}`;

const NETWORK_CONFIG: ResolvedNetworkConfig = {
  chainId: chainIdHex,
  chainIdDecimal,
  chainName: process.env.REACT_APP_NETWORK_NAME || DEFAULT_NETWORK.chainName,
  nativeCurrency: {
    name: process.env.REACT_APP_NETWORK_CURRENCY_NAME || DEFAULT_NETWORK.nativeCurrency.name,
    symbol: process.env.REACT_APP_NETWORK_CURRENCY_SYMBOL || DEFAULT_NETWORK.nativeCurrency.symbol,
    decimals: parseNumber(process.env.REACT_APP_NETWORK_CURRENCY_DECIMALS) ?? DEFAULT_NETWORK.nativeCurrency.decimals
  },
  rpcUrls: [process.env.REACT_APP_NETWORK_RPC_URL || DEFAULT_NETWORK.rpcUrls[0]],
  blockExplorerUrls: [process.env.REACT_APP_NETWORK_EXPLORER_URL || DEFAULT_NETWORK.blockExplorerUrls[0]]
};

// Primary chain ID for the application
export const TARGET_CHAIN_ID = NETWORK_CONFIG.chainId;

// Chain ID in decimal format for comparisons
export const TARGET_CHAIN_ID_DECIMAL = NETWORK_CONFIG.chainIdDecimal;

// Network display name
export const NETWORK_NAME = NETWORK_CONFIG.chainName;

// Block explorer URL for transactions
export const BLOCK_EXPLORER_URL = NETWORK_CONFIG.blockExplorerUrls[0];

// RPC URL for direct provider connections
export const RPC_URL = NETWORK_CONFIG.rpcUrls[0];

/**
 * Gets the complete network configuration for wallet_addEthereumChain
 */
export const getNetworkConfig = (): WalletNetworkConfig => ({
  chainId: NETWORK_CONFIG.chainId,
  chainName: NETWORK_CONFIG.chainName,
  nativeCurrency: NETWORK_CONFIG.nativeCurrency,
  rpcUrls: NETWORK_CONFIG.rpcUrls,
  blockExplorerUrls: NETWORK_CONFIG.blockExplorerUrls
});

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
