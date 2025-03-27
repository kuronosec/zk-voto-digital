import React, { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng); // Guarda la preferencia
  };

  // Estilos en línea para mantener consistencia con el componente Header
  const languageSelectorStyle: CSSProperties = {
    display: 'flex',
    marginLeft: '20px'
  };

  const buttonBaseStyle: CSSProperties = {
    background: 'none',
    border: '1px solid white',
    padding: '4px 10px',
    margin: '0 5px',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '14px',
    color: 'white',
    fontWeight: '500'
  };

  const activeButtonStyle: CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: 'white',
    color: '#3f119b',
    borderColor: 'white'
  };

  return (
    <div style={languageSelectorStyle}>
      <button 
        style={i18n.language === 'en' ? activeButtonStyle : buttonBaseStyle}
        onClick={() => changeLanguage('en')}
      >
        EN
      </button>
      <button 
        style={i18n.language === 'es' ? activeButtonStyle : buttonBaseStyle}
        onClick={() => changeLanguage('es')}
      >
        ES
      </button>
    </div>
  );
};