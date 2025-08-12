import { http, createConfig } from "wagmi";
import { walletConnect } from "wagmi/connectors";
import { getViemChain } from "./constants/network";

// CRA uses REACT_APP_* env prefix
const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || "";

const metadata = {
  name: "ZK Firma Digital",
  description: "Example voting app",
  url: "https://localhost:3000/",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const chain = getViemChain();

export const wagmiConfig = createConfig({
  chains: [chain],
  connectors: [
    walletConnect({
      projectId,
      metadata,
      showQrModal: true
    }),
  ],
  transports: {
    [chain.id]: http(),
  },
});
