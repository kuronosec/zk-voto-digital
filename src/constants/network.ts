import type { Chain } from 'viem';

const env = (key: string, fallback: string = ''): string =>
  (process.env[key] ?? '').toString() || fallback;

const parseIntSafe = (value: string, fallback: number): number => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
};

// Defaults to Polygon Amoy values to keep current behavior if envs are missing
const DEFAULTS = {
  CHAIN_ID_DEC: 80002,
  CHAIN_ID_HEX: '0x13882',
  CHAIN_NAME: 'Polygon Amoy',
  CURRENCY_NAME: 'MATIC',
  CURRENCY_SYMBOL: 'MATIC',
  CURRENCY_DECIMALS: 18,
  RPC_HTTP: 'https://rpc-amoy.polygon.technology/',
  EXPLORER_URL: 'https://amoy.polygonscan.com/'
};

export const NETWORK = {
  idDec: parseIntSafe(env('REACT_APP_CHAIN_ID_DEC'), DEFAULTS.CHAIN_ID_DEC),
  idHex: env('REACT_APP_CHAIN_ID_HEX', DEFAULTS.CHAIN_ID_HEX),
  name: env('REACT_APP_CHAIN_NAME', DEFAULTS.CHAIN_NAME),
  currencyName: env('REACT_APP_CURRENCY_NAME', DEFAULTS.CURRENCY_NAME),
  currencySymbol: env('REACT_APP_CURRENCY_SYMBOL', DEFAULTS.CURRENCY_SYMBOL),
  currencyDecimals: parseIntSafe(env('REACT_APP_CURRENCY_DECIMALS'), DEFAULTS.CURRENCY_DECIMALS),
  rpcHttp: env('REACT_APP_RPC_HTTP', DEFAULTS.RPC_HTTP),
  explorerUrl: env('REACT_APP_EXPLORER_URL', DEFAULTS.EXPLORER_URL)
};

export const getRpcUrl = (): string => NETWORK.rpcHttp;
export const getChainIdHex = (): string => NETWORK.idHex;
export const getExplorerUrl = (): string => NETWORK.explorerUrl;

export const getAddEthereumChainParams = () => ({
  chainId: NETWORK.idHex,
  chainName: NETWORK.name,
  nativeCurrency: {
    name: NETWORK.currencyName,
    symbol: NETWORK.currencySymbol,
    decimals: NETWORK.currencyDecimals
  },
  rpcUrls: [NETWORK.rpcHttp],
  blockExplorerUrls: [NETWORK.explorerUrl]
});

export const getViemChain = (): Chain => ({
  id: NETWORK.idDec,
  name: NETWORK.name,
  nativeCurrency: {
    name: NETWORK.currencyName,
    symbol: NETWORK.currencySymbol,
    decimals: NETWORK.currencyDecimals
  },
  rpcUrls: {
    default: { http: [NETWORK.rpcHttp] },
    public: { http: [NETWORK.rpcHttp] }
  },
  blockExplorers: NETWORK.explorerUrl
    ? {
        default: { name: 'explorer', url: NETWORK.explorerUrl }
      }
    : undefined
});


