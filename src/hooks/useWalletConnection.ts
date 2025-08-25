import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { useDeviceDetection } from './useDeviceDetection';

// Constants
const BLOCKDAG_TESTNET_CHAIN_ID = '0x413'; // 1043 in decimal 

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
  
  // Device detection hook
  const deviceInfo = useDeviceDetection();

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
        if (chainId !== BLOCKDAG_TESTNET_CHAIN_ID) {
          setState({
            isConnected: true,
            account,
            error: "Please switch to BlockDAG Testnet network",
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
  const switchToBlockDAGTestnet = useCallback(async (): Promise<boolean> => {
    if (!window.ethereum) return false;
    if (isChangingNetworkRef.current) return false;

    try {
      isChangingNetworkRef.current = true;
      setState(prev => ({ ...prev, isChangingNetwork: true, error: null }));
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BLOCKDAG_TESTNET_CHAIN_ID }],
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
                chainId: BLOCKDAG_TESTNET_CHAIN_ID,
                chainName: 'BlockDag',
                nativeCurrency: {
                  name: 'BDAG',
                  symbol: 'BDAG',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc.primordial.bdagscan.com'],
                blockExplorerUrls: ['https://explorer.blockdag.network/'],
              },
            ],
          });
          await checkWalletState();
          setState(prev => ({ ...prev, isChangingNetwork: false }));
          isChangingNetworkRef.current = false;
          return true;
        } catch (addError: any) {
          console.error('Failed to add BlockDAG Testnet network:', addError);
          setState(prev => ({ 
            ...prev, 
            error: "Failed to add BlockDAG Testnet network",
            isChangingNetwork: false
          }));
          isChangingNetworkRef.current = false;
          return false;
        }
      }
      console.error('Failed to switch to BlockDAG Testnet network:', error);
      setState(prev => ({ 
        ...prev, 
        error: "Failed to switch to BlockDAG Testnet network",
        isChangingNetwork: false
      }));
      isChangingNetworkRef.current = false;
      return false;
    }
  }, [checkWalletState]);

  // Mobile deeplink connection function
  const connectMobileDeepLink = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      // Generate the deeplink URL - don't include protocol in the dapp path
      const currentUrl = window.location.host + window.location.pathname;
      const deeplinkUrl = `https://metamask.app.link/dapp/${currentUrl}`;
      
      // Open MetaMask mobile app
      window.location.href = deeplinkUrl;
      
      // Set up listener for when user returns
      const handleVisibilityChange = async () => {
        if (document.visibilityState === 'visible') {
          // Wait a bit for MetaMask to initialize
          setTimeout(async () => {
            await checkWalletState();
          }, 1000);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Also check periodically in case visibility API doesn't work
      const checkInterval = setInterval(async () => {
        if (window.ethereum) {
          await checkWalletState();
          clearInterval(checkInterval);
        }
      }, 2000);
      
      // Clear interval after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
      }, 30000);
      
    } catch (error: any) {
      console.error("Failed to open MetaMask mobile:", error);
      setState(prev => ({
        ...prev,
        error: "Failed to open MetaMask mobile app"
      }));
    }
  }, [checkWalletState]);

  // Desktop web extension connection
  const connectDesktop = useCallback(async () => {
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
          error: chainId !== BLOCKDAG_TESTNET_CHAIN_ID ? "Switching to BlockDAG Testnet network..." : null,
          chainId,
          provider,
          signer,
          isChangingNetwork: chainId !== BLOCKDAG_TESTNET_CHAIN_ID
        });
        
        if (chainId !== BLOCKDAG_TESTNET_CHAIN_ID) {
          console.log("Connected but on wrong network. Switching to BlockDAG Testnet...");
          setTimeout(async () => {
            await switchToBlockDAGTestnet();
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
  }, [switchToBlockDAGTestnet]);

  // Main connect function that chooses the appropriate method
  const connect = useCallback(async () => {
    // Check if already connected
    if (state.isConnected) {
      return;
    }

    // On mobile, try deeplink if MetaMask extension is not available
    if (deviceInfo.isMobile && !window.ethereum) {
      console.log("Mobile device detected, using deeplink connection");
      await connectMobileDeepLink();
      return;
    }
    
    // On mobile with MetaMask extension available (e.g., MetaMask browser)
    if (deviceInfo.isMobile && window.ethereum) {
      console.log("Mobile device with MetaMask provider detected, using extension connection");
      await connectDesktop();
      return;
    }
    
    // On desktop or when MetaMask extension is available
    console.log("Desktop device or MetaMask extension detected, using extension connection");
    await connectDesktop();
  }, [deviceInfo.isMobile, state.isConnected, connectMobileDeepLink, connectDesktop]);

  const handleChainChanged = useCallback(async (chainId: string) => {
    console.log("Chain changed to:", chainId);
    // Simplemente actualiza el estado con la nueva cadena
    await checkWalletState();
    
    // Solo intentar cambiar a BlockDAG Testnet si el usuario está conectado y no estamos ya cambiando
    if (chainId !== BLOCKDAG_TESTNET_CHAIN_ID && state.isConnected && !isChangingNetworkRef.current) {
      console.log("Not on BlockDAG Testnet. Current chain:", chainId);
      console.log("Attempting to switch to BlockDAG Testnet automatically");
      await switchToBlockDAGTestnet();
    }
  }, [state.isConnected, checkWalletState, switchToBlockDAGTestnet]);

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
    switchToBlockDAGTestnet,
    deviceInfo
  };
};