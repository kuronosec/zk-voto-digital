import { ethers } from 'ethers';
import { getWalletClient } from 'wagmi/actions';
import { wagmiConfig } from '../config';

/**
 * Obtiene un ethers.Signer utilizando, en este orden:
 * - Provider inyectado (MetaMask en desktop o in-app browser móvil)
 * - WalletConnect v2 a través de wagmi (@wagmi/core)
 */
export async function getEthersSigner(): Promise<ethers.Signer> {
  // 1) Provider inyectado (MetaMask extension o in-app browser)
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    const injected = (window as any).ethereum;
    const provider = new ethers.providers.Web3Provider(injected);
    return provider.getSigner();
  }

  // 2) WalletConnect v2 vía wagmi
  const walletClient = await getWalletClient(wagmiConfig);
  if (!walletClient) {
    throw new Error('No hay wallet conectada. Conecta tu wallet primero.');
  }

  // Adaptador EIP-1193 mínimo para ethers
  const eip1193Provider = {
    request: async ({ method, params }: { method: string; params?: any[] }) => {
      return (walletClient.transport as any).request({ method, params });
    },
  } as any;

  const provider = new ethers.providers.Web3Provider(eip1193Provider);
  return provider.getSigner(walletClient.account.address);
}


