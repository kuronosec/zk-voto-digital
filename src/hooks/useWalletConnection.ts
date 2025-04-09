import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';

// Constants
const POLYGON_AMOY_CHAIN_ID = '0x13882'; 

export interface WalletState {
  isConnected: boolean;
  account: string | null;
  error: string | null;
  chainId: string | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  isChangingNetwork: boolean;
}

export const useWalletConnection = () => {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    account: null,
    error: null,
    chainId: null,
    provider: null,
    signer: null,
    isChangingNetwork: false
  });
  
  // Usar useRef para evitar actualizar el estado mientras se está ejecutando
  const isChangingNetworkRef = useRef(false);

  // Check current wallet state without requesting connection
  const checkWalletState = useCallback(async () => {
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
            signer,
            isChangingNetwork: false
          });
        } else {
          setState({
            isConnected: true,
            account,
            error: null,
            chainId,
            provider,
            signer,
            isChangingNetwork: false
          });
        }
      } else {
        setState({
          isConnected: false,
          account: null,
          error: null,
          chainId,
          provider: null,
          signer: null,
          isChangingNetwork: false
        });
      }
    } catch (error: any) {
      console.error("Failed to check wallet state:", error);
      setState(prev => ({
        ...prev,
        isConnected: false,
        error: error.message || "Failed to check wallet connection",
        provider: null,
        signer: null,
        isChangingNetwork: false
      }));
    }
  }, []);

  // Function to switch to Polygon Amoy network
  const switchToPolygonAmoy = useCallback(async (): Promise<boolean> => {
    if (!window.ethereum) return false;
    if (isChangingNetworkRef.current) return false;

    try {
      isChangingNetworkRef.current = true;
      setState(prev => ({ ...prev, isChangingNetwork: true, error: null }));
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_AMOY_CHAIN_ID }],
      });
      
      await checkWalletState();
      setState(prev => ({ ...prev, isChangingNetwork: false }));
      isChangingNetworkRef.current = false;
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
          setState(prev => ({ ...prev, isChangingNetwork: false }));
          isChangingNetworkRef.current = false;
          return true;
        } catch (addError: any) {
          console.error('Failed to add Polygon Amoy network:', addError);
          setState(prev => ({ 
            ...prev, 
            error: "Failed to add Polygon Amoy network",
            isChangingNetwork: false
          }));
          isChangingNetworkRef.current = false;
          return false;
        }
      }
      console.error('Failed to switch to Polygon Amoy network:', error);
      setState(prev => ({ 
        ...prev, 
        error: "Failed to switch to Polygon Amoy network",
        isChangingNetwork: false
      }));
      isChangingNetworkRef.current = false;
      return false;
    }
  }, [checkWalletState]);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setState(prev => ({ ...prev, error: "MetaMask is not installed" }));
      return;
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts && accounts.length > 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
        const signer = provider.getSigner();
        const account = await signer.getAddress();

        setState({
          isConnected: true,
          account,
          error: chainId !== POLYGON_AMOY_CHAIN_ID ? "Switching to Polygon Amoy network..." : null,
          chainId,
          provider,
          signer,
          isChangingNetwork: chainId !== POLYGON_AMOY_CHAIN_ID
        });
        
        if (chainId !== POLYGON_AMOY_CHAIN_ID) {
          console.log("Connected but on wrong network. Switching to Polygon Amoy...");
          setTimeout(async () => {
            await switchToPolygonAmoy();
          }, 500);
        }
      }
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      setState(prev => ({
        ...prev,
        error: error.message || "Failed to connect wallet",
        isConnected: false
      }));
    }
  }, [switchToPolygonAmoy]);

  const handleChainChanged = useCallback(async (chainId: string) => {
    console.log("Chain changed to:", chainId);
    // Simplemente actualiza el estado con la nueva cadena
    await checkWalletState();
    
    // Solo intentar cambiar a Polygon Amoy si el usuario está conectado y no estamos ya cambiando
    if (chainId !== POLYGON_AMOY_CHAIN_ID && state.isConnected && !isChangingNetworkRef.current) {
      console.log("Not on Polygon Amoy. Current chain:", chainId);
      console.log("Attempting to switch to Polygon Amoy automatically");
      await switchToPolygonAmoy();
    }
  }, [state.isConnected, checkWalletState, switchToPolygonAmoy]);

  useEffect(() => {
    // Verificar el estado inicial
    checkWalletState();

    if (window.ethereum) {
      const handleAccountsChanged = async (accounts: any) => {
        if (accounts.length === 0) {
          // User disconnected wallet
          setState({
            isConnected: false,
            account: null,
            error: null,
            chainId: null,
            provider: null,
            signer: null,
            isChangingNetwork: false
          });
        } else {
          // Update with new account
          await checkWalletState();
        }
      };

      // Listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      // Cleanup
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [checkWalletState, handleChainChanged]);

  return {
    ...state,
    connect,
    checkWalletState,
    switchToPolygonAmoy
  };
};