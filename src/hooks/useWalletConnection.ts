import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { BLOCKDAG_CHAIN_ID, getNetworkConfig } from '../constants/networks';
import { 
  shouldRedirectToMetaMask, 
  redirectToMetaMaskWithFallback, 
  isMetaMaskAvailable,
  getWalletEnvironmentInfo
} from '../utils/walletDetection'; 

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
    if (!isMetaMaskAvailable()) {
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

        // Check if on the correct network (BlockDAG)
        if (chainId !== BLOCKDAG_CHAIN_ID) {
          setState({
            isConnected: true,
            account,
            error: "Please switch to BlockDAG Testnet",
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

  // Function to switch to BlockDAG Testnet network
  const switchToBlockDAG = useCallback(async (): Promise<boolean> => {
    if (!isMetaMaskAvailable()) return false;
    if (isChangingNetworkRef.current) return false;

    try {
      isChangingNetworkRef.current = true;
      setState(prev => ({ ...prev, isChangingNetwork: true, error: null }));
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BLOCKDAG_CHAIN_ID }],
      });
      
      await checkWalletState();
      setState(prev => ({ ...prev, isChangingNetwork: false }));
      isChangingNetworkRef.current = false;
      return true;
    } catch (error: any) {
      // If error code is 4902, the network isn't added yet
      if (error.code === 4902) {
        try {
          const networkConfig = getNetworkConfig();
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
          });
          await checkWalletState();
          setState(prev => ({ ...prev, isChangingNetwork: false }));
          isChangingNetworkRef.current = false;
          return true;
        } catch (addError: any) {
          console.error('Failed to add BlockDAG Testnet:', addError);
          setState(prev => ({ 
            ...prev, 
            error: "Failed to add BlockDAG Testnet",
            isChangingNetwork: false
          }));
          isChangingNetworkRef.current = false;
          return false;
        }
      }
      console.error('Failed to switch to BlockDAG Testnet:', error);
      setState(prev => ({ 
        ...prev, 
        error: "Failed to switch to BlockDAG Testnet",
        isChangingNetwork: false
      }));
      isChangingNetworkRef.current = false;
      return false;
    }
  }, [checkWalletState]);

  const connect = useCallback(async () => {
    // Check if we should redirect to MetaMask Mobile
    if (shouldRedirectToMetaMask()) {
      console.log("Mobile device detected, redirecting to MetaMask...");
      setState(prev => ({ ...prev, error: "Redirecting to MetaMask..." }));
      
      try {
        await redirectToMetaMaskWithFallback();
      } catch (error) {
        console.error("Failed to redirect to MetaMask:", error);
        setState(prev => ({ ...prev, error: "Failed to open MetaMask. Please install MetaMask Mobile." }));
      }
      return;
    }

    if (!isMetaMaskAvailable()) {
      const envInfo = getWalletEnvironmentInfo();
      let errorMessage = "MetaMask is not installed";
      
      if (envInfo.isMobile) {
        errorMessage = "Please open this app in MetaMask browser or install MetaMask Mobile";
      }
      
      setState(prev => ({ ...prev, error: errorMessage }));
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
          error: chainId !== BLOCKDAG_CHAIN_ID ? "Switching to BlockDAG Testnet..." : null,
          chainId,
          provider,
          signer,
          isChangingNetwork: chainId !== BLOCKDAG_CHAIN_ID
        });
        
        if (chainId !== BLOCKDAG_CHAIN_ID) {
          console.log("Connected but on wrong network. Switching to BlockDAG Testnet...");
          setTimeout(async () => {
            await switchToBlockDAG();
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
  }, [switchToBlockDAG]);

  const handleChainChanged = useCallback(async (chainId: string) => {
    console.log("Chain changed to:", chainId);
    // Simply update the state with the new chain
    await checkWalletState();
    
    // Only try to switch to BlockDAG if user is connected and we're not already changing
    if (chainId !== BLOCKDAG_CHAIN_ID && state.isConnected && !isChangingNetworkRef.current) {
      console.log("Not on BlockDAG Testnet. Current chain:", chainId);
      console.log("Attempting to switch to BlockDAG Testnet automatically");
      await switchToBlockDAG();
    }
  }, [state.isConnected, checkWalletState, switchToBlockDAG]);

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
    switchToBlockDAG
  };
};