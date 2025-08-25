import React, { createContext, useContext } from 'react';
import { useWalletConnection } from '../hooks/useWalletConnection';
import type { WalletState } from '../hooks/useWalletConnection';
import type { DeviceInfo } from '../hooks/useDeviceDetection';

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  checkWalletState: () => Promise<void>;
  switchToBlockDAGTestnet: () => Promise<boolean>;
  deviceInfo: DeviceInfo;
}

const defaultContext: WalletContextType = {
  isConnected: false,
  account: null,
  error: null,
  chainId: null,
  provider: null,
  signer: null,
  isChangingNetwork: false,
  connect: async () => {},
  checkWalletState: async () => {},
  switchToBlockDAGTestnet: async () => false,
  deviceInfo: {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isBrowser: false,
    hasMetaMaskExtension: false,
    hasMetaMaskMobile: false,
    canUseWalletConnect: false,
    preferredConnection: 'extension',
    screenSize: 'md'
  }
};

const WalletContext = createContext<WalletContextType>(defaultContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wallet = useWalletConnection();
  
  return (
    <WalletContext.Provider value={{ 
      ...wallet,
      checkWalletState: wallet.checkWalletState,
      deviceInfo: wallet.deviceInfo
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  return context;
};