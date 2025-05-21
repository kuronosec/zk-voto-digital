import React, { useState, useEffect, CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../LanguageSelector';
import { useWallet } from '../../context/WalletContext';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { t } = useTranslation();
  
  // Use the wallet context
  const { isConnected, account, connect, checkWalletState } = useWallet();

  // Check wallet state on component mount
  useEffect(() => {
    checkWalletState();
  }, [checkWalletState]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // Format address for display
  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
          <button 
            style={isConnected ? connectedButtonStyle : buttonStyle}
            onClick={connect}
          >
            <span>
              {isConnected 
                ? shortenAddress(account || '') 
                : t('common.connectWallet')}
            </span>
          </button>
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
          <Link to="/#how-it-works" style={linkStyle}>
            {t('common.howItWorks')}
          </Link>
          <Link to="/vote" style={linkStyle}>
            {t('common.digitalVote')}
          </Link>
          <Link to="/create-proposal" style={linkStyle}>
            {t('common.createProposal')}
          </Link>
          <Link to="/results" style={linkStyle}>
            {t('common.seeResults')}
          </Link>
          <Link to="https://github.com/kuronosec/zk-firma-digital?tab=readme-ov-file#installation" style={linkStyle}>
            {t('common.download')}
          </Link>
          <LanguageSelector />
          <button 
            style={isConnected ? mobileConnectedButtonStyle : mobileButtonStyle}
            onClick={connect}
          >
            <span>
              {isConnected 
                ? shortenAddress(account || '') 
                : t('common.connectWallet')}
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
};