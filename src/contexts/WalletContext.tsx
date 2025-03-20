import React, { createContext, useContext } from 'react';
import { useWalletConnection } from '../hooks/useWalletConnection';
import type { WalletState } from '../hooks/useWalletConnection';

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  updateWalletState: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wallet = useWalletConnection();
  
  return (
    <WalletContext.Provider value={wallet}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}; 