import { http, createConfig } from "wagmi";
import { defineChain } from "viem";
import { walletConnect } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || "";

const metadata = {
  name: "ZK Voto Digital",
  description: "Example voting app",
  url: "https://localhost:3000/",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

// Define BlockDAG Testnet for wagmi/viem
export const blockdagTestnet = defineChain({
  id: 1043,
  name: 'BlockDAG Testnet',
  network: 'blockdag-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BDAG',
    symbol: 'BDAG',
  },
  rpcUrls: {
    public: { http: ['https://rpc.primordial.bdagscan.com/'] },
    default: { http: ['https://rpc.primordial.bdagscan.com/'] },
  },
  blockExplorers: {
    default: { name: 'BlockDAG Explorer', url: 'https://primordial.bdagscan.com' },
  },
});

export const wagmiConfig = createConfig({
  chains: [blockdagTestnet],
  connectors: [
    walletConnect({
      projectId,
      metadata,
    }),
  ],
  transports: {
    [blockdagTestnet.id]: http(),
  },
});
