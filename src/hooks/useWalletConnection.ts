import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Constants
const POLYGON_AMOY_CHAIN_ID = '0x13882'; // Chain ID for Polygon Amoy in hexadecimal

export interface WalletState {
  isConnected: boolean;
  account: string | null;
  error: string | null;
  chainId: string | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
}

export const useWalletConnection = () => {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    account: null,
    error: null,
    chainId: null,
    provider: null,
    signer: null
  });

  // Check current wallet state without requesting connection
  const checkWalletState = async () => {
    if (!window.ethereum) {
      setState(prev => ({ ...prev, error: "MetaMask is not installed", isConnected: false }));
      return;
    }

    try {
      // Only check existing accounts without requesting connection
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
      
      if (accounts && accounts.length > 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const account = await signer.getAddress();

        // Check if on the correct network
        if (chainId !== POLYGON_AMOY_CHAIN_ID) {
          setState({
            isConnected: true,
            account,
            error: "Please switch to Polygon Amoy network",
            chainId,
            provider,
            signer
          });
        } else {
          setState({
            isConnected: true,
            account,
            error: null,
            chainId,
            provider,
            signer
          });
        }
      } else {
        setState({
          isConnected: false,
          account: null,
          error: null,
          chainId,
          provider: null,
          signer: null
        });
      }
    } catch (error: any) {
      console.error("Failed to check wallet state:", error);
      setState(prev => ({
        ...prev,
        isConnected: false,
        error: error.message || "Failed to check wallet connection",
        provider: null,
        signer: null
      }));
    }
  };

  // Function to switch to Polygon Amoy network
  const switchToPolygonAmoy = async (): Promise<boolean> => {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_AMOY_CHAIN_ID }],
      });
      await checkWalletState();
      return true;
    } catch (error: any) {
      // If error code is 4902, the network isn't added yet
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: POLYGON_AMOY_CHAIN_ID,
                chainName: 'Polygon Amoy',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc-amoy.polygon.technology/'],
                blockExplorerUrls: ['https://amoy.polygonscan.com/'],
              },
            ],
          });
          await checkWalletState();
          return true;
        } catch (addError: any) {
          console.error('Failed to add Polygon Amoy network:', addError);
          setState(prev => ({ 
            ...prev, 
            error: "Failed to add Polygon Amoy network"
          }));
          return false;
        }
      }
      console.error('Failed to switch to Polygon Amoy network:', error);
      setState(prev => ({ 
        ...prev, 
        error: "Failed to switch to Polygon Amoy network"
      }));
      return false;
    }
  };

  // Function called when user clicks the connect button
  const connect = async () => {
    if (!window.ethereum) {
      setState(prev => ({ ...prev, error: "MetaMask is not installed" }));
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // This shows the MetaMask popup
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts && accounts.length > 0) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
        const signer = provider.getSigner();
        const account = await signer.getAddress();

        // Check if on the correct network
        if (chainId !== POLYGON_AMOY_CHAIN_ID) {
          setState({
            isConnected: true,
            account,
            error: "Please switch to Polygon Amo48484 network",
            chainId,
            provider,
            signer
          });
        } else {
          setState({
            isConnected: true,
            account,
            error: null,
            chainId,
            provider,
            signer
          });
        }
      }
    } catch (error: any) {
      // More specific error handling
      if (error.code === 4001) {
        setState(prev => ({
          ...prev,
          isConnected: false,
          error: "User rejected the connection request",
          provider: null,
          signer: null
        }));
      } else if (error.code === -32002) {
        setState(prev => ({
          ...prev,
          isConnected: false,
          error: "Connection request already pending",
          provider: null,
          signer: null
        }));
      } else {
        setState(prev => ({
          ...prev,
          isConnected: false,
          error: "Failed to connect wallet",
          provider: null,
          signer: null
        }));
      }
    }
  };

  // Initial verification and setup of listeners
  useEffect(() => {
    // Initial state check
    checkWalletState();

    if (window.ethereum) {
      // Set up listeners for changes
      const handleAccountsChanged = async (accounts: any) => {
        if (accounts.length === 0) {
          // User disconnected wallet
          setState({
            isConnected: false,
            account: null,
            error: null,
            chainId: null,
            provider: null,
            signer: null
          });
        } else {
          // Update with new account
          await checkWalletState();
        }
      };

      const handleChainChanged = () => {
        // Reload state when network changes
        checkWalletState();
      };

      const handleDisconnect = (error: any) => {
        console.log("MetaMask disconnect event:", error);
        setState({
          isConnected: false,
          account: null,
          error: null,
          chainId: null,
          provider: null,
          signer: null
        });
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
          window.ethereum.removeListener('disconnect', handleDisconnect);
        }
      };
    }
  }, []);

  return {
    ...state,
    connect,
    checkWalletState,
    switchToPolygonAmoy
  };
};