import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useWallet } from '../context/WalletContext';

const COUNTRIES = [
  { code: 'CRI', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'USA', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'ESP', name: 'España', flag: '🇪🇸' },
  { code: 'DEU', name: 'Alemania', flag: '🇩🇪' },
  { code: 'ARG', name: 'Argentina', flag: '🇦🇷' },
  { code: 'BRA', name: 'Brasil', flag: '🇧🇷' },
  { code: 'COL', name: 'Colombia', flag: '🇨🇴' },
  { code: 'MEX', name: 'México', flag: '🇲🇽' },
  { code: 'PER', name: 'Perú', flag: '🇵🇪' },
  { code: 'CHL', name: 'Chile', flag: '🇨🇱' },
];

const PassportVote: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { account, isConnected } = useWallet();
  const [userId, setUserId] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('CRI');
  const [selectedMethod, setSelectedMethod] = useState<'firma-digital' | 'passport'>('passport');

  // Auto-fill user ID with MetaMask wallet address
  useEffect(() => {
    if (isConnected && account) {
      setUserId(account);
    }
  }, [isConnected, account]);

  const handleContinue = () => {
    if (selectedMethod === 'firma-digital') {
      navigate('/request-firma');
    } else {
      // Navigate to passport verification with user data
      navigate('/vote/passport/verify', { 
        state: { 
          userId, 
          nationality: selectedCountry,
          eventId: `vote-${Date.now()}`
        } 
      });
    }
  };

  const isFormValid = userId.trim().length > 0;

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column"
    }}>
      <Header />
      <main style={{
        flex: "1",
        backgroundColor: "#f8f9fa",
        padding: "40px 20px 80px"
      }}>
        <div style={{
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          overflow: "hidden"
        }}>
          <div style={{
            backgroundColor: "#5856D6",
            padding: "25px 30px",
            color: "white"
          }}>
            <h1 style={{
              fontSize: "1.75rem",
              fontWeight: "600",
              margin: "0"
            }}>{t('passport.title')}</h1>
            <p style={{
              margin: "8px 0 0",
              opacity: "0.9"
            }}>{t('passport.subtitle')}</p>
          </div>
          
          <div style={{
            padding: "30px"
          }}>
            <form onSubmit={(e) => { e.preventDefault(); handleContinue(); }}>
              
              {/* User ID Input */}
              <div style={{ marginBottom: "24px" }}>
                <label 
                  htmlFor="userId" 
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: "6px"
                  }}
                >
                  {t('passport.userId')}:
                </label>
                <input
                  type="text"
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder={t('passport.userIdPlaceholder')}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "1rem",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#5856D6"}
                  onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
                  required
                />
                {!isFormValid && userId.length > 0 && (
                  <p style={{ 
                    color: "#ef4444", 
                    fontSize: "0.75rem", 
                    marginTop: "4px",
                    margin: "4px 0 0" 
                  }}>
                    {t('passport.userIdRequired')}
                  </p>
                )}
              </div>

              {/* Authentication Method Selection */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "12px"
                }}>
                  {t('passport.authMethod')}:
                </label>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px",
                    border: `2px solid ${selectedMethod === 'firma-digital' ? '#5856D6' : '#e5e7eb'}`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    backgroundColor: selectedMethod === 'firma-digital' ? '#f8f7ff' : 'white'
                  }}>
                    <input
                      type="radio"
                      name="authMethod"
                      value="firma-digital"
                      checked={selectedMethod === 'firma-digital'}
                      onChange={(e) => setSelectedMethod(e.target.value as 'firma-digital' | 'passport')}
                      style={{ marginRight: "12px" }}
                    />
                    <span style={{ fontSize: "1.2rem", marginRight: "8px" }}>🔐</span>
                    <span style={{ fontWeight: "500" }}>{t('passport.firmaDigital')}</span>
                  </label>

                  <label style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px",
                    border: `2px solid ${selectedMethod === 'passport' ? '#5856D6' : '#e5e7eb'}`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    backgroundColor: selectedMethod === 'passport' ? '#f8f7ff' : 'white'
                  }}>
                    <input
                      type="radio"
                      name="authMethod"
                      value="passport"
                      checked={selectedMethod === 'passport'}
                      onChange={(e) => setSelectedMethod(e.target.value as 'firma-digital' | 'passport')}
                      style={{ marginRight: "12px" }}
                    />
                    <span style={{ fontSize: "1.2rem", marginRight: "8px" }}>🛂</span>
                    <span style={{ fontWeight: "500" }}>{t('passport.passport')}</span>
                  </label>
                </div>
              </div>

              {/* Country Selection (only shown for passport method) */}
              {selectedMethod === 'passport' && (
                <div style={{ marginBottom: "24px" }}>
                  <label 
                    htmlFor="country" 
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "6px"
                    }}
                  >
                    {t('passport.country')}:
                  </label>
                  <select
                    id="country"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "1rem",
                      backgroundColor: "white",
                      outline: "none",
                      cursor: "pointer"
                    }}
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.name} ({country.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Continue Button */}
              <button
                type="button"
                disabled={!isFormValid}
                onClick={handleContinue}
                style={{
                  width: "100%",
                  backgroundColor: isFormValid ? "#5856D6" : "#9ca3af",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "14px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: isFormValid ? "pointer" : "not-allowed",
                  transition: "all 0.2s ease"
                }}
              >
                {t('passport.continue')}
              </button>
            </form>

            {/* Information Box */}
            <div style={{
              marginTop: "24px",
              padding: "16px",
              backgroundColor: "#f0f9ff",
              border: "1px solid #bae6fd",
              borderRadius: "8px",
              fontSize: "0.875rem",
              color: "#0369a1"
            }}>
              <h4 style={{ margin: "0 0 8px", fontWeight: "600" }}>
                {t('passport.infoTitle')}
              </h4>
              <p style={{ margin: "0" }}>
                {selectedMethod === 'passport' 
                  ? t('passport.passportInfo')
                  : t('passport.firmaDigitalInfo')
                }
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PassportVote;