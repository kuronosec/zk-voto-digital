// src/components/Header/index.tsx
import React, { useState, useEffect, CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../LanguageSelector';
// No necesitamos importar ethers para esta funcionalidad

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const { t } = useTranslation();

  // Check if already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setIsConnected(true);
            setUserAddress(accounts[0]);
          }
        } catch (error) {
          console.error("Error checking MetaMask connection:", error);
        }
      }
    };
    
    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setIsConnected(true);
          setUserAddress(accounts[0]);
        } else {
          setIsConnected(false);
          setUserAddress(null);
        }
      });
    }

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

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

  // Connect to MetaMask wallet
  const connectWallet = async () => {
    // Si ya estamos conectados, no hacemos nada
    if (isConnected) return;
    
    if (!window.ethereum) {
      alert("Please install MetaMask to use this feature");
      return;
    }

    try {
      // Primero intentamos obtener las cuentas ya conectadas
      const existingAccounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (existingAccounts.length > 0) {
        setIsConnected(true);
        setUserAddress(existingAccounts[0]);
        return;
      }

      // Si no hay cuentas existentes, solicitamos conectar
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setIsConnected(true);
        setUserAddress(accounts[0]);
      }
    } catch (error: any) {
      console.error("Error connecting to MetaMask:", error);
      if (error.code === 4001) {
        // User rejected the request
        alert("Please connect to MetaMask to continue");
      } else if (error.code === -32002) {
        // Ya está procesando una solicitud de conexión
        alert("Connection request already in progress. Please check MetaMask extension.");
      } else {
        alert("Error connecting to MetaMask. Please try again.");
      }
    }
  };

  // Format address for display
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Estilos con tipado correcto usando CSSProperties
  const headerStyle: CSSProperties = {
    backgroundColor: '#362463',
    color: 'white',
    padding: '16px 24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
    backgroundColor: '#3f119b',
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

  const mobileLangSelectorStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '15px'
  };

  return (
    <header style={headerStyle}>
      <nav style={navStyle}>
        <Link to="/" style={logoStyle}>
          ZK Firma Digital
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
          <LanguageSelector />
          <button 
            style={isConnected ? connectedButtonStyle : buttonStyle}
            onClick={connectWallet}
          >
            <span>
              {isConnected 
                ? shortenAddress(userAddress || '') 
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
          <button 
            style={isConnected ? mobileConnectedButtonStyle : mobileButtonStyle}
            onClick={connectWallet}
          >
            <span>
              {isConnected 
                ? shortenAddress(userAddress || '') 
                : t('common.connectWallet')}
            </span>
            {!isConnected && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <div style={mobileLangSelectorStyle}>
            <LanguageSelector />
          </div>
        </div>
      </nav>
    </header>
  );
};