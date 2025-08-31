import React, { useState, useEffect, CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../LanguageSelector';
import { useWallet } from '../../context/WalletContext';
import { getWalletEnvironmentInfo } from '../../utils/walletDetection';
import { BLOCKDAG_CHAIN_ID } from '../../constants/networks';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Use the wallet context
  const { isConnected, account, connect, checkWalletState, chainId } = useWallet();
  
  // Get wallet environment info
  const walletEnv = getWalletEnvironmentInfo();

  // Check wallet state on component mount
  useEffect(() => {
    checkWalletState();
  }, [checkWalletState]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // Close menu on desktop resize
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const header = document.querySelector('header');
      
      if (isMenuOpen && header && !header.contains(target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  // Format address for display
  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Handle wallet connection based on environment
  const handleWalletConnect = () => {
    if (isConnected) {
      // If already connected, just call connect to handle network switching
      connect();
      return;
    }

    if (walletEnv.isMobile && !walletEnv.isMetaMaskBrowser) {
      // Mobile user outside MetaMask browser -> redirect to instructions
      navigate('/mobile-connect');
      return;
    }

    // Desktop or MetaMask browser -> normal connect
    connect();
  };

  // Get button text based on current state and environment
  const getButtonText = () => {
    if (isConnected) {
      if (chainId === BLOCKDAG_CHAIN_ID) {
        return shortenAddress(account || '');
      } else {
        return `${t('common.switchToNetwork')} ${t('common.networkName')}`;
      }
    }
    
    if (walletEnv.isMobile && !walletEnv.isMetaMaskBrowser) {
      return `📱 ${t('common.mobileInstructions')}`;
    }
    
    if (walletEnv.isMobile && walletEnv.isMetaMaskBrowser) {
      return t('common.connectWallet');
    }
    
    return t('common.connectWallet');
  };

  // Get button status indicator
  const getNetworkIndicator = () => {
    if (!isConnected) return null;
    
    const isCorrectNetwork = chainId === BLOCKDAG_CHAIN_ID;
    
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        color: isCorrectNetwork ? '#10b981' : '#ef4444'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: isCorrectNetwork ? '#10b981' : '#ef4444'
        }}></div>
        {isCorrectNetwork ? t('common.networkName') : t('common.wrongNetwork')}
      </div>
    );
  };

  // Estilos con tipado correcto usando CSSProperties
  const headerStyle: CSSProperties = {
    backgroundColor: '#362463',
    color: 'white',
    padding: '16px 24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000, // Asegura que el header esté por encima de otros elementos
    width: '100%'
  };

  const navStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    minHeight: '74px',
  };

  const logoStyle: CSSProperties = {
    fontWeight: 'bold',
    fontSize: '24px',
    color: 'white',
    textDecoration: 'none'
  };

  const desktopMenuStyle: CSSProperties = {
    display: isMobile ? 'none' : 'flex',
    alignItems: 'center',
    gap: '30px'
  };

  const mobileMenuButtonStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    display: isMobile ? 'block' : 'none'
  };

  const linkStyle: CSSProperties = {
    color: 'white',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer'
  };

  const buttonStyle: CSSProperties = {
    backgroundColor: 'transparent',
    border: '1px solid white',
    borderRadius: '9999px',
    padding: '8px 24px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    marginLeft: '16px'
  };

  const connectedButtonStyle: CSSProperties = {
    ...buttonStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  };

  const mobileMenuStyle: CSSProperties = {
    position: 'fixed',
    top: '64px',
    left: '0',
    right: '0',
    backgroundColor: '#362463',
    padding: '20px',
    display: isMenuOpen ? 'flex' : 'none',
    flexDirection: 'column',
    gap: '20px',
    zIndex: 999,
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  };

  const mobileButtonStyle: CSSProperties = {
    backgroundColor: 'transparent',
    border: '1px solid white',
    borderRadius: '9999px',
    padding: '8px 24px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    marginLeft: '0',
    marginTop: '10px'
  };

  const mobileConnectedButtonStyle: CSSProperties = {
    ...mobileButtonStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  };

  return (
    <header style={headerStyle}>
      <nav style={navStyle}>
        <Link to="/" style={logoStyle}>
          ZK Voto Digital
        </Link>

        {/* Desktop Menu */}
        <div style={desktopMenuStyle}>
          <a href="/#how-it-works" style={linkStyle}>
            {t('common.howItWorks')}
          </a>
          <Link to="/vote" style={linkStyle}>
            {t('common.digitalVote')}
          </Link>
          <Link to="/create-proposal" style={linkStyle}>
            {t('common.createProposal')}
          </Link>
          <Link to="/results" style={linkStyle}>
            {t('common.seeResults')}
          </Link>
          <Link to="https://docs.sakundi.io/es/docs/user-section/client-installation" style={linkStyle}>
            {t('common.download')}
          </Link>
          <LanguageSelector />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <button 
              style={isConnected ? connectedButtonStyle : buttonStyle}
              onClick={handleWalletConnect}
            >
              <span>{getButtonText()}</span>
            </button>
            {getNetworkIndicator()}
          </div>
        </div>

        {/* Mobile Menu Button (Hamburger) */}
        <button 
          style={mobileMenuButtonStyle} 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        {/* Mobile Menu */}
        <div style={mobileMenuStyle}>
          <Link to="/#how-it-works" style={linkStyle} onClick={closeMenu}>
            {t('common.howItWorks')}
          </Link>
          <Link to="/vote" style={linkStyle} onClick={closeMenu}>
            {t('common.digitalVote')}
          </Link>
          <Link to="/create-proposal" style={linkStyle} onClick={closeMenu}>
            {t('common.createProposal')}
          </Link>
          <Link to="/results" style={linkStyle} onClick={closeMenu}>
            {t('common.seeResults')}
          </Link>
          <Link to="https://github.com/kuronosec/zk-firma-digital?tab=readme-ov-file#installation" style={linkStyle} onClick={closeMenu}>
            {t('common.download')}
          </Link>
          <LanguageSelector />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button 
              style={isConnected ? mobileConnectedButtonStyle : mobileButtonStyle}
              onClick={() => {
                handleWalletConnect();
                closeMenu();
              }}
            >
              <span>{getButtonText()}</span>
            </button>
            {getNetworkIndicator()}
          </div>
        </div>
      </nav>
    </header>
  );
};