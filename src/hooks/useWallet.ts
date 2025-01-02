import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  signer: JsonRpcSigner | null;
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    signer: null,
  });

  const updateWalletState = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length > 0) {
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();

        setWallet({
          isConnected: true,
          address,
          chainId: Number(network.chainId),
          signer,
        });
      } else {
        setWallet({
          isConnected: false,
          address: null,
          chainId: null,
          signer: null,
        });
      }
    } catch (error) {
      console.error('Error updating wallet state:', error);
      setWallet({
        isConnected: false,
        address: null,
        chainId: null,
        signer: null,
      });
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this feature');
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      await updateWalletState();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    }
  }, [updateWalletState]);

  const disconnectWallet = useCallback(async () => {
    try {
      // Clear local wallet state first
      setWallet({
        isConnected: false,
        address: null,
        chainId: null,
        signer: null,
      });

      // Try to revoke permissions if possible
      if (window.ethereum?.request) {
        try {
          await window.ethereum.request({
            method: 'wallet_revokePermissions',
            params: [{ eth_accounts: {} }],
          });
        } catch (error) {
          // Some wallets might not support this method, so we'll ignore the error
          console.warn('Could not revoke permissions:', error);
        }
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          // MetaMask is locked or the user has not connected any accounts
          setWallet({
            isConnected: false,
            address: null,
            chainId: null,
            signer: null,
          });
        } else {
          await updateWalletState();
        }
      };

      const handleChainChanged = () => {
        updateWalletState();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Initial check
      updateWalletState();

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [updateWalletState]);

  return {
    ...wallet,
    connectWallet,
    disconnectWallet,
  };
}