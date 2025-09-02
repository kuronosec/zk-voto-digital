import { getWalletEnvironmentInfo } from './walletDetection';

/**
 * Smart wallet connection handler that works for both desktop and mobile
 * Uses the same logic as the Header component
 */
export const createSmartWalletConnect = (
  connect: () => Promise<void>, 
  navigate: (path: string) => void, 
  isConnected: boolean
) => {
  return () => {
    const walletEnv = getWalletEnvironmentInfo();

    if (isConnected) {
      // If already connected, just call connect to handle network switching
      connect();
      return;
    }

    if (walletEnv.isMobile && !walletEnv.isMetaMaskBrowser) {
      // Mobile user outside MetaMask browser -> redirect to instructions
      navigate('/mobile-connect');
      return;
    }

    // Desktop or MetaMask browser -> normal connect
    connect();
  };
};

/**
 * Get smart button text based on wallet environment
 */
export const getSmartConnectButtonText = (
  isConnected: boolean, 
  t: (key: string) => string
): string => {
  if (isConnected) {
    return t('common.connectWallet'); // For network switching
  }

  const walletEnv = getWalletEnvironmentInfo();
  
  if (walletEnv.isMobile && !walletEnv.isMetaMaskBrowser) {
    return `📱 ${t('common.mobileInstructions')}`;
  }
  
  return t('common.connectWallet');
};