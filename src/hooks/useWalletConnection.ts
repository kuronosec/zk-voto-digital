import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export interface WalletState {
  isConnected: boolean;
  account: string | null;
  error: string | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
}

export const useWalletConnection = () => {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    account: null,
    error: null,
    provider: null,
    signer: null
  });

  // Verificar el estado actual de la wallet sin solicitar conexión
  const checkWalletState = async () => {
    if (!window.ethereum) {
      setState(prev => ({ ...prev, error: "MetaMask is not installed", isConnected: false }));
      return;
    }

    try {
      // Solo verifica las cuentas existentes sin solicitar conexión
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts && accounts.length > 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const account = await signer.getAddress();
        setState({
          isConnected: true,
          account,
          error: null,
          provider,
          signer
        });
      } else {
        setState({
          isConnected: false,
          account: null,
          error: null,
          provider: null,
          signer: null
        });
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnected: false,
        error: "Failed to check wallet connection",
        provider: null,
        signer: null
      }));
    }
  };

  // Función que se llama cuando el usuario hace clic en el botón
  const connect = async () => {
    if (!window.ethereum) {
      setState(prev => ({ ...prev, error: "MetaMask is not installed" }));
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // Esta es la llamada que muestra el popup de MetaMask
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts && accounts.length > 0) {
        const signer = provider.getSigner();
        const account = await signer.getAddress();
        setState({
          isConnected: true,
          account,
          error: null,
          provider,
          signer
        });
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnected: false,
        error: "User rejected connection",
        provider: null,
        signer: null
      }));
    }
  };

  // Verificación inicial y configuración de listeners
  useEffect(() => {
    // Verificación inicial del estado
    checkWalletState();

    if (window.ethereum) {
      // Configurar listeners para cambios
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          // Usuario desconectó su wallet
          setState({
            isConnected: false,
            account: null,
            error: null,
            provider: null,
            signer: null
          });
        } else {
          // Actualizar con la nueva cuenta
          await checkWalletState();
        }
      };

      const handleChainChanged = () => {
        // Recargar el estado cuando cambia la red
        checkWalletState();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', () => {
        setState({
          isConnected: false,
          account: null,
          error: null,
          provider: null,
          signer: null
        });
      });

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
          window.ethereum.removeListener('disconnect', () => {});
        }
      };
    }
  }, []);

  return {
    ...state,
    connect,
    checkWalletState
  };
}; 