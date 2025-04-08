import React, { useState, useEffect, useRef, CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detectar cambios en el tamaño de la pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Cerrar el dropdown cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng); // Guarda la preferencia
    setIsOpen(false); // Cierra el dropdown después de seleccionar
  };

  const currentLanguage = i18n.language?.substring(0, 2) || 'en';

  
  const dropdownContainerStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    marginLeft: '20px',
    // Posicionamiento específico para móvil
    ...(isMobile && {
      width: '100%',
      marginLeft: 0,
      marginBottom: '10px'
    })
  };

  const dropdownButtonStyle: CSSProperties = {
    background: 'none',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    color: 'white',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    ...(isMobile && {
      width: '100%',
      justifyContent: 'space-between'
    })
  };

  const dropdownMenuStyle: CSSProperties = {
    position: 'absolute',
    left: 0, // Cambiado a left para mejor alineación en móvil
    backgroundColor: 'white',
    minWidth: '120px',
    boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
    zIndex: 1000,
    borderRadius: '4px',
    marginTop: '5px',
    display: isOpen ? 'block' : 'none'
  };

  const dropdownItemStyle: CSSProperties = {
    color: '#333',
    padding: '10px 15px',
    textDecoration: 'none',
    display: 'block',
    cursor: 'pointer',
    fontSize: '14px'
  };

  const activeDropdownItemStyle: CSSProperties = {
    ...dropdownItemStyle,
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    color: '#3f119b'
  };

  const chevronStyle: CSSProperties = {
    marginLeft: '8px',
    width: '0',
    height: '0',
    borderLeft: '5px solid transparent',
    borderRight: '5px solid transparent',
    borderTop: '5px solid white',
    display: 'inline-block'
  };

  // Obtener la etiqueta del idioma actual para mostrar en el botón
  const getCurrentLanguageDisplay = () => {
    // En móvil mostrar el nombre completo, en desktop solo código
    if (isMobile) {
      switch (currentLanguage) {
        case 'en':
          return '🇬🇧 English';
        case 'es':
          return '🇪🇸 Español';
        default:
          return '🇬🇧 English';
      }
    } else {
      switch (currentLanguage) {
        case 'en':
          return '🇬🇧 EN';
        case 'es':
          return '🇪🇸 ES';
        default:
          return '🇬🇧 EN';
      }
    }
  };

  return (
    <div style={dropdownContainerStyle} ref={dropdownRef}>
      <button
        style={dropdownButtonStyle}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {getCurrentLanguageDisplay()}
        <span style={chevronStyle}></span>
      </button>

      <div style={dropdownMenuStyle}>
        <div
          onClick={() => changeLanguage('en')}
          style={currentLanguage === 'en' ? activeDropdownItemStyle : dropdownItemStyle}
        >
          🇬🇧 English
        </div>
        <div
          onClick={() => changeLanguage('es')}
          style={currentLanguage === 'es' ? activeDropdownItemStyle : dropdownItemStyle}
        >
          🇪🇸 Español
        </div>
      </div>
    </div>
  );
};