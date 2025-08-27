import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWallet } from '../context/WalletContext';

const containerStyle: React.CSSProperties = {
  maxWidth: '720px',
  margin: '0 auto',
  padding: '24px 16px'
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '20px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
};

const titleStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '12px'
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#555',
  marginBottom: '16px'
};

const listStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '10px',
  marginBottom: '16px'
};

const itemStyle: React.CSSProperties = {
  background: '#f7f7fb',
  borderRadius: '10px',
  padding: '12px 14px'
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'center'
};

const copyButtonStyle: React.CSSProperties = {
  border: 'none',
  background: '#e8e8f4',
  color: '#362463',
  borderRadius: '8px',
  padding: '6px 10px',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap'
};

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#666',
  marginBottom: '4px'
};

const valueStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  wordBreak: 'break-word'
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#362463',
  color: 'white',
  border: 'none',
  borderRadius: '9999px',
  padding: '12px 18px',
  fontSize: '16px',
  fontWeight: 600
};

const noteStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#666',
  marginTop: '10px'
};

const MobileNetworkInfo: React.FC = () => {
  const { connect } = useWallet();
  const { t } = useTranslation();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = async (text: string, key: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '-1000px';
        textArea.style.left = '-1000px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (e) {
      // No bloquear la UI si falla; intentar fallback directo
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '-1000px';
        textArea.style.left = '-1000px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
      } catch {}
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={titleStyle}>{t('mobileNetwork.title')}</div>
        <div style={subtitleStyle}>{t('mobileNetwork.subtitle')}</div>

        <div style={listStyle}>
          <div style={itemStyle}>
            <div style={rowStyle}>
              <div>
                <div style={labelStyle}>{t('mobileNetwork.fields.networkName')}</div>
                <div style={valueStyle}>{t('mobileNetwork.values.name')}</div>
              </div>
              <button style={copyButtonStyle} onClick={() => copyText(t('mobileNetwork.values.name'), 'name')}>
                {copiedKey === 'name' ? t('mobileNetwork.copied') : t('mobileNetwork.copy')}
              </button>
            </div>
          </div>
          <div style={itemStyle}>
            <div style={rowStyle}>
              <div>
                <div style={labelStyle}>{t('mobileNetwork.fields.rpcUrl')}</div>
                <div style={valueStyle}>{t('mobileNetwork.values.rpc')}</div>
              </div>
              <button style={copyButtonStyle} onClick={() => copyText(t('mobileNetwork.values.rpc'), 'rpc')}>
                {copiedKey === 'rpc' ? t('mobileNetwork.copied') : t('mobileNetwork.copy')}
              </button>
            </div>
          </div>
          <div style={itemStyle}>
            <div style={rowStyle}>
              <div>
                <div style={labelStyle}>{t('mobileNetwork.fields.chainId')}</div>
                <div style={valueStyle}>{t('mobileNetwork.values.chainId')}</div>
              </div>
              <button style={copyButtonStyle} onClick={() => copyText('1043', 'chainId')}>
                {copiedKey === 'chainId' ? t('mobileNetwork.copied') : t('mobileNetwork.copy')}
              </button>
            </div>
          </div>
          <div style={itemStyle}>
            <div style={rowStyle}>
              <div>
                <div style={labelStyle}>{t('mobileNetwork.fields.symbol')}</div>
                <div style={valueStyle}>{t('mobileNetwork.values.symbol')}</div>
              </div>
              <button style={copyButtonStyle} onClick={() => copyText(t('mobileNetwork.values.symbol'), 'symbol')}>
                {copiedKey === 'symbol' ? t('mobileNetwork.copied') : t('mobileNetwork.copy')}
              </button>
            </div>
          </div>
          <div style={itemStyle}>
            <div style={rowStyle}>
              <div>
                <div style={labelStyle}>{t('mobileNetwork.fields.explorer')}</div>
                <div style={valueStyle}>{t('mobileNetwork.values.explorer')}</div>
              </div>
              <button style={copyButtonStyle} onClick={() => copyText(t('mobileNetwork.values.explorer'), 'explorer')}>
                {copiedKey === 'explorer' ? t('mobileNetwork.copied') : t('mobileNetwork.copy')}
              </button>
            </div>
          </div>
        </div>

        <button style={buttonStyle} onClick={connect}>{t('mobileNetwork.connect')}</button>
        <div style={noteStyle}>{t('mobileNetwork.note')}</div>
      </div>
    </div>
  );
};

export default MobileNetworkInfo;


