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

// BlockDAG Testnet chain definition
export const blockdagTestnet = defineChain({
  id: 1043,
  name: "BlockDAG Testnet",
  network: "blockdag-testnet",
  nativeCurrency: { name: "BlockDAG", symbol: "BDAG", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.primordial.bdagscan.com/"] },
    public: { http: ["https://rpc.primordial.bdagscan.com/"] },
  },
  blockExplorers: {
    default: { name: "Primordial Explorer", url: "https://primordial.bdagscan.com/" },
  },
  testnet: true,
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
    [blockdagTestnet.id]: http("https://rpc.primordial.bdagscan.com/"),
  },
});
