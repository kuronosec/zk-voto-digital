import { http, createConfig } from "wagmi";
import { defineChain } from "viem";
import { walletConnect } from "wagmi/connectors";
import { BLOCK_EXPLORER_URL, NETWORK_NAME, RPC_URL, TARGET_CHAIN_ID_DECIMAL, getNetworkConfig } from "./constants/networks";

const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID
  || process.env.REACT_APP_PROJECT_ID
  || process.env.NEXT_PUBLIC_PROJECT_ID
  || "";

const metadata = {
  name: "ZK Voto Digital",
  description: "Example voting app",
  url: "https://localhost:3000/",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const networkSlug = (
  process.env.REACT_APP_NETWORK_SLUG
  || NETWORK_NAME
).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "custom-network";

const walletAddConfig = getNetworkConfig();

// Define the target chain for wagmi/viem using environment-aware values
export const configuredChain = defineChain({
  id: TARGET_CHAIN_ID_DECIMAL,
  name: NETWORK_NAME,
  network: networkSlug,
  nativeCurrency: walletAddConfig.nativeCurrency,
  rpcUrls: {
    public: { http: [RPC_URL] },
    default: { http: [RPC_URL] },
  },
  blockExplorers: {
    default: { name: `${NETWORK_NAME} Explorer`, url: BLOCK_EXPLORER_URL },
  },
});

export const wagmiConfig = createConfig({
  chains: [configuredChain],
  connectors: [
    walletConnect({
      projectId,
      metadata,
    }),
  ],
  transports: {
    [configuredChain.id]: http(RPC_URL),
  },
});
