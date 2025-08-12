import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getAddEthereumChainParams, getChainIdHex } from '../constants/network';

// Target chain from env-configurable constants
const TARGET_CHAIN_ID_HEX = getChainIdHex();

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
        if (chainId !== TARGET_CHAIN_ID_HEX) {
          setState({
            isConnected: true,
            account,
            error: "Por favor cambia a la red objetivo",
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
  };

  // Switch to target network
  const switchToTargetNetwork = async (): Promise<boolean> => {
    if (!window.ethereum) return false;

    try {
      setState(prev => ({ ...prev, isChangingNetwork: true, error: null }));
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: TARGET_CHAIN_ID_HEX }],
      });
      
      await checkWalletState();
      setState(prev => ({ ...prev, isChangingNetwork: false }));
      return true;
    } catch (error: any) {
      // If error code is 4902, the network isn't added yet
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [getAddEthereumChainParams()],
          });
          await checkWalletState();
          setState(prev => ({ ...prev, isChangingNetwork: false }));
          return true;
        } catch (addError: any) {
          console.error('Failed to add target network:', addError);
          setState(prev => ({ 
            ...prev, 
            error: "No se pudo agregar la red objetivo",
            isChangingNetwork: false
          }));
          return false;
        }
      }
      console.error('Failed to switch to target network:', error);
      setState(prev => ({ 
        ...prev, 
        error: "No se pudo cambiar a la red objetivo",
        isChangingNetwork: false
      }));
      return false;
    }
  };

const connect = async () => {
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
        error: chainId !== TARGET_CHAIN_ID_HEX ? "Cambiando a la red objetivo..." : null,
        chainId,
        provider,
        signer,
        isChangingNetwork: chainId !== TARGET_CHAIN_ID_HEX
      });
      
      if (chainId !== TARGET_CHAIN_ID_HEX) {
        console.log("Connected but on wrong network. Switching to target network...");
        
        setTimeout(async () => {
          await switchToTargetNetwork();
        }, 500);
      }
    }
  } catch (error: any) {
  }
};

const handleChainChanged = async (chainId: string) => {
  console.log("Chain changed to:", chainId);
  if (chainId !== TARGET_CHAIN_ID_HEX && state.isConnected) {
    console.log("Not on target chain. Current chain:", chainId);
    if (!state.isChangingNetwork) {
      console.log("Attempting to switch to target chain automatically");
      await switchToTargetNetwork();
    }
  } else {
    console.log("Chain is correct or not connected. Updating state.");
    await checkWalletState();
  }
};

  useEffect(() => {
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
          
          // If connected but not on the right network, switch automatically
          const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
          if (chainId !== TARGET_CHAIN_ID_HEX) {
            await switchToTargetNetwork();
          }
        }
      };

      const handleChainChangedEvent = (chainId: string) => {
        handleChainChanged(chainId);
      };

      const handleDisconnect = (error: any) => {
        console.log("MetaMask disconnect event:", error);
        setState({
          isConnected: false,
          account: null,
          error: null,
          chainId: null,
          provider: null,
          signer: null,
          isChangingNetwork: false
        });
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChangedEvent);
      window.ethereum.on('disconnect', handleDisconnect);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChangedEvent);
          window.ethereum.removeListener('disconnect', handleDisconnect);
        }
      };
    }
  }, [state.isConnected, state.isChangingNetwork]);

  return {
    ...state,
    connect,
    checkWalletState,
    switchToTargetNetwork
  };
};