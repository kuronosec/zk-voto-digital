import { useState, useEffect } from 'react';
import { isMobile, isTablet, isDesktop, isBrowser } from 'react-device-detect';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isBrowser: boolean;
  hasMetaMaskExtension: boolean;
  hasMetaMaskMobile: boolean;
  canUseWalletConnect: boolean;
  preferredConnection: 'extension' | 'walletconnect' | 'deeplink';
  screenSize: 'sm' | 'md' | 'lg' | 'xl';
}

// Removemos esta declaración ya que probablemente existe en otro archivo

export const useDeviceDetection = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isBrowser: false,
    hasMetaMaskExtension: false,
    hasMetaMaskMobile: false,
    canUseWalletConnect: false,
    preferredConnection: 'extension',
    screenSize: 'md'
  });

  useEffect(() => {
    const detectDevice = () => {
      // Detección básica de dispositivo
      const deviceType = {
        isMobile,
        isTablet,
        isDesktop,
        isBrowser
      };

      // Detección de MetaMask extensión
      const hasMetaMaskExtension = !!(window.ethereum && window.ethereum.isMetaMask);

      // Detección de MetaMask móvil (aproximada)
      const hasMetaMaskMobile = isMobile && (
        /MetaMaskMobile/.test(navigator.userAgent) ||
        (window.ethereum && window.ethereum.isMetaMask)
      );

      // Capacidad de usar WalletConnect
      const canUseWalletConnect = isBrowser && (isMobile || isTablet || !hasMetaMaskExtension);

      // Determinar conexión preferida
      let preferredConnection: 'extension' | 'walletconnect' | 'deeplink' = 'extension';
      
      if (isMobile || isTablet) {
        if (hasMetaMaskMobile) {
          preferredConnection = 'deeplink';
        } else {
          preferredConnection = 'walletconnect';
        }
      } else if (isDesktop) {
        preferredConnection = hasMetaMaskExtension ? 'extension' : 'walletconnect';
      }

      // Detección de tamaño de pantalla
      const getScreenSize = (): 'sm' | 'md' | 'lg' | 'xl' => {
        const width = window.innerWidth;
        if (width < 640) return 'sm';
        if (width < 768) return 'md';
        if (width < 1024) return 'lg';
        return 'xl';
      };

      setDeviceInfo({
        ...deviceType,
        hasMetaMaskExtension,
        hasMetaMaskMobile,
        canUseWalletConnect,
        preferredConnection,
        screenSize: getScreenSize()
      });
    };

    detectDevice();

    // Listener para cambios de tamaño de pantalla
    const handleResize = () => {
      detectDevice();
    };

    window.addEventListener('resize', handleResize);
    
    // Listener para cambios en ethereum provider
    const handleEthereumChange = () => {
      detectDevice();
    };

    if (window.ethereum) {
      window.ethereum.on('connect', handleEthereumChange);
      window.ethereum.on('disconnect', handleEthereumChange);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.ethereum) {
        window.ethereum.removeListener('connect', handleEthereumChange);
        window.ethereum.removeListener('disconnect', handleEthereumChange);
      }
    };
  }, []);

  return deviceInfo;
};