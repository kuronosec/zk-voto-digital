import React, { createContext, useContext } from 'react';
import { useWalletConnection } from '../hooks/useWalletConnection';
import type { WalletState } from '../hooks/useWalletConnection';

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  checkWalletState: () => Promise<void>;
  switchToTargetNetwork: () => Promise<boolean>;
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
  switchToTargetNetwork: async () => false
};

const WalletContext = createContext<WalletContextType>(defaultContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wallet = useWalletConnection();
  
  return (
    <WalletContext.Provider value={{ 
      ...wallet,
      checkWalletState: wallet.checkWalletState 
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  return context;
};