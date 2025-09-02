import React, { useState, useEffect, CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { useWallet } from '../context/WalletContext';
import { isMobileDevice, redirectToMetaMaskWithFallback } from '../utils/walletDetection';

export const MobileInstructions = () => {
  const { t } = useTranslation();
  const { isConnected, account } = useWallet();
  const [copied, setCopied] = useState(false);
  
  // Get the current URL based on environment
  const getDAppURL = () => {
    const hostname = window.location.hostname;
    const environment = process.env.REACT_APP_ENVIRONMENT || process.env.NODE_ENV;
    
    // Local development (localhost or IP)
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('192.168')) {
      return `${window.location.protocol}//${hostname}:${window.location.port || '3000'}`;
    }
    
    // Environment-based URLs
    switch (environment) {
      case 'development':
        return 'https://voto-dev.sakundi.io';
      case 'production':
        return 'https://voto.sakundi.io';
      default:
        // Fallback: use current hostname if deployed elsewhere
        return `${window.location.protocol}//${hostname}`;
    }
  };

  const dappUrl = getDAppURL();

  // Redirect to home if not mobile
  useEffect(() => {
    if (!isMobileDevice()) {
      window.location.href = '/';
    }
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(dappUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = dappUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnectWallet = async () => {
    try {
      await redirectToMetaMaskWithFallback();
    } catch (error) {
      console.error('Failed to open MetaMask:', error);
    }
  };

  // Styles similar to existing components
  const containerStyle: CSSProperties = {
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  };

  const cardStyle: CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '500px',
    margin: '0 auto',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  };

  const titleStyle: CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '16px',
    textAlign: 'center'
  };

  const subtitleStyle: CSSProperties = {
    fontSize: '16px',
    color: '#64748b',
    marginBottom: '32px',
    textAlign: 'center',
    lineHeight: '1.6'
  };

  const stepContainerStyle: CSSProperties = {
    backgroundColor: '#f1f5f9',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #e2e8f0'
  };

  const stepTitleStyle: CSSProperties = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center'
  };

  const stepNumberStyle: CSSProperties = {
    backgroundColor: '#362463',
    color: 'white',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    marginRight: '12px'
  };

  const stepTextStyle: CSSProperties = {
    fontSize: '15px',
    color: '#475569',
    lineHeight: '1.6',
    marginBottom: '12px'
  };

  const urlContainerStyle: CSSProperties = {
    backgroundColor: 'white',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '12px',
    fontSize: '14px',
    fontFamily: 'monospace'
  };

  const copyButtonStyle: CSSProperties = {
    backgroundColor: copied ? '#10b981' : '#362463',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s'
  };

  const connectButtonStyle: CSSProperties = {
    backgroundColor: '#362463',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    marginTop: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  const warningStyle: CSSProperties = {
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '24px',
    fontSize: '14px',
    color: '#92400e'
  };

  if (!isMobileDevice()) {
    return null;
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <h1 style={titleStyle}>📱 {t('mobileConnect.title')}</h1>
        <p style={subtitleStyle}>
          {t('mobileConnect.subtitle')}
        </p>

        {/* Step 1 */}
        <div style={stepContainerStyle}>
          <h3 style={stepTitleStyle}>
            <span style={stepNumberStyle}>1</span>
            {t('mobileConnect.step1.title')}
          </h3>
          <p style={stepTextStyle}>
            {t('mobileConnect.step1.description')}
          </p>
          <div style={urlContainerStyle}>
            <span style={{ flex: 1, wordBreak: 'break-all' }}>{dappUrl}</span>
            <button style={copyButtonStyle} onClick={copyToClipboard}>
              {copied ? '✅' : '📋'} {copied ? t('mobileConnect.step1.copiedButton') : t('mobileConnect.step1.copyButton')}
            </button>
          </div>
        </div>

        {/* Step 2 */}
        <div style={stepContainerStyle}>
          <h3 style={stepTitleStyle}>
            <span style={stepNumberStyle}>2</span>
            {t('mobileConnect.step2.title')}
          </h3>
          <p style={stepTextStyle}>
            {t('mobileConnect.step2.description')}
          </p>
          <button style={connectButtonStyle} onClick={handleConnectWallet}>
            🦊 {t('mobileConnect.step2.button')}
          </button>
        </div>

        {/* Step 3 */}
        <div style={stepContainerStyle}>
          <h3 style={stepTitleStyle}>
            <span style={stepNumberStyle}>3</span>
            {t('mobileConnect.step3.title')}
          </h3>
          <p style={stepTextStyle}>
            {t('mobileConnect.step3.description')}
          </p>
        </div>

        {/* Step 4 */}
        <div style={stepContainerStyle}>
          <h3 style={stepTitleStyle}>
            <span style={stepNumberStyle}>4</span>
            {t('mobileConnect.step4.title')}
          </h3>
          <p style={stepTextStyle}>
            {t('mobileConnect.step4.description')}
          </p>
        </div>

        {/* Step 5 */}
        <div style={stepContainerStyle}>
          <h3 style={stepTitleStyle}>
            <span style={stepNumberStyle}>5</span>
            {t('mobileConnect.step5.title')}
          </h3>
          <p style={stepTextStyle}>
            {t('mobileConnect.step5.description')}
          </p>
        </div>

        {/* Warning */}
        <div style={warningStyle}>
          <strong>💡 {t('mobileConnect.warning.title')}</strong> {t('mobileConnect.warning.description')}
        </div>

        {/* Connection Status */}
        {isConnected && (
          <div style={{ 
            ...stepContainerStyle, 
            backgroundColor: '#dcfce7', 
            border: '1px solid #16a34a',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#15803d', marginBottom: '8px' }}>
              ✅ {t('mobileConnect.connected.title')}
            </h3>
            <p style={{ color: '#166534', fontSize: '14px', margin: 0 }}>
              {t('mobileConnect.connected.address')} {account?.slice(0, 6)}...{account?.slice(-4)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};