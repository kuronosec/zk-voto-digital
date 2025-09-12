import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from './Header';
import { Footer } from './Footer';
import { usePassportVerification, useVerificationStatus } from '../hooks/passportVote';
import { PassportVerificationService } from '../services/passportService';
import { useVote } from '../pages/VoteContext';

const PassportVerification: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { userId: string; nationality: string; eventId: string } | null;
  const { setVerifiableCredential, setAuthMethod } = useVote();

  const [isMobile] = useState(PassportVerificationService.isMobile());
  const verificationStarted = useRef(false);
  const [showAppDownload, setShowAppDownload] = useState(false);
  const [isAttemptingAppOpen, setIsAttemptingAppOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  
  const {
    verificationLink,
    isLoading: isStartingVerification,
    error: verificationError,
    userId,
    startVerification,
    generateQRCode,
    generateDeepLink
  } = usePassportVerification();

  const {
    status,
    proof,
    isPolling,
    error: statusError,
    startPolling,
    stopPolling
  } = useVerificationStatus(userId, !!verificationLink);

  useEffect(() => {
    if (!state) {
      navigate('/vote/passport');
      return;
    }

    // Only start verification once when component mounts
    if (!verificationStarted.current) {
      verificationStarted.current = true;
      startVerification({
        userId: state.userId,
        nationality: state.nationality,
        eventId: state.eventId
      });
    }
  }, [state, navigate, startVerification]);

  useEffect(() => {
    if (verificationLink && verificationLink !== 'completed') {
      const cleanup = startPolling();
      return cleanup;
    }
  }, [verificationLink, startPolling]);

  // Auto-check verification status every 5 seconds similar to the example
  useEffect(() => {
    if (!userId || status === 'verified' || status === 'failed') return;

    const intervalId = window.setInterval(async () => {
      try {
        const response = await PassportVerificationService.checkVerificationStatus(userId);
        if (response.status === 'verified' && response.proof) {
          setVerifiableCredential(response.proof);
          setAuthMethod('passport');
          navigate('/vote');
        }
      } catch (error) {
        console.error('Auto-check error:', error);
      }
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [userId, status, setVerifiableCredential, setAuthMethod, navigate]);

  useEffect(() => {
    if (status === 'verified' && proof) {
      // Save proof as verifiable credential and set auth method
      setVerifiableCredential(proof);
      setAuthMethod('passport');
      // Navigate to voting page
      navigate('/vote');
    }
  }, [status, proof, navigate, setVerifiableCredential, setAuthMethod]);

  const handleManualCheck = () => {
    startPolling();
  };

  const handleRetry = () => {
    if (state) {
      startVerification({
        userId: state.userId,
        nationality: state.nationality,
        eventId: state.eventId
      });
    }
  };

  const handleOpenApp = () => {
    if (verificationLink && verificationLink !== 'completed') {
      setIsAttemptingAppOpen(true);
      const deepLink = decodeURIComponent(generateDeepLink(verificationLink));
      
      // Try to open the app
      window.location.href = deepLink;
      
      // Set a timeout to detect if the app didn't open
      const timeoutId = setTimeout(() => {
        setIsAttemptingAppOpen(false);
        setShowAppDownload(true);
      }, 3000); // Wait 3 seconds
      
      // Clear timeout if user returns to page (app opened successfully)
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          clearTimeout(timeoutId);
          setIsAttemptingAppOpen(false);
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Cleanup
      setTimeout(() => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }, 5000);
    }
  };
  
  const handleDownloadApp = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
      window.open('https://apps.apple.com/app/rarime/id1672042081', '_blank');
    } else if (isAndroid) {
      window.open('https://play.google.com/store/apps/details?id=com.rarilabs.rarime', '_blank');
    } else {
      window.open('https://docs.rarimo.com/rarime-app/', '_blank');
    }
  };
  
  const handleRetryAppOpen = () => {
    setShowAppDownload(false);
    handleOpenApp();
  };
  
  const handleConfirmAuthentication = async () => {
    if (!state || !verificationLink) return;
    
    setIsConfirming(true);
    
    try {
      // Check if user has completed verification
      const statusResponse = await PassportVerificationService.checkVerificationStatus(state.userId);
      
      if (statusResponse.status === 'verified') {
        // Create the confirm URL to complete OAuth flow
        const queryParams = {
          grant_type: "code",
          client_id: process.env.REACT_APP_CLIENT_ID || "hello@example.com",
          user_id: state.userId,
          redirect_uri: process.env.REACT_APP_REDIRECT_URI || `${window.location.origin}/vote/passport/callback`,
          scope: "zk-passport",
          state: String(Math.floor(Math.random() * 10000)),
          nullifier_seed: 1000,
          data: encodeURIComponent(
            JSON.stringify({
              "id": state.userId,
              "type": "user",
              "attributes": {
                "age_lower_bound": 18,
                "uniqueness": true,
                "nationality": state.nationality,
                "nationality_check": true,
                "event_id": state.eventId,
              }
            })
          )
        };
        
        const confirmUrl = `${process.env.REACT_APP_AUTH_SERVER_URL || 'https://app.sakundi.io'}/confirm-authorize?` + new URLSearchParams(queryParams).toString();
        
        // Redirect to complete OAuth flow
        window.location.href = confirmUrl;
      } else {
        alert("❌ Authentication not confirmed yet. Please complete verification in RariMe app first.");
      }
    } catch (error) {
      console.error('Error confirming authentication:', error);
      alert("❌ Failed to confirm authentication: " + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsConfirming(false);
    }
  };

  if (!state) {
    return null; // Will redirect
  }

  if (verificationError) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header />
        <main style={{ flex: "1", backgroundColor: "#f8f9fa", padding: "40px 20px 80px" }}>
          <div style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
            padding: "30px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "20px" }}>❌</div>
            <h2 style={{ color: "#dc2626", marginBottom: "16px" }}>
              {t('passport.verificationError')}
            </h2>
            <p style={{ color: "#6b7280", marginBottom: "24px" }}>
              {verificationError}
            </p>
            <button
              onClick={handleRetry}
              style={{
                backgroundColor: "#5856D6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "12px 24px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              {t('passport.retry')}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isStartingVerification) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header />
        <main style={{ flex: "1", backgroundColor: "#f8f9fa", padding: "40px 20px 80px" }}>
          <div style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
            padding: "30px",
            textAlign: "center"
          }}>
            <div style={{
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #5856D6",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px"
            }}></div>
            <h2>{t('passport.preparingVerification')}</h2>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main style={{ flex: "1", backgroundColor: "#f8f9fa", padding: "40px 20px 80px" }}>
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
            color: "white",
            textAlign: "center"
          }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: "600", margin: "0" }}>
              {t('passport.verification')}
            </h1>
            <p style={{ margin: "8px 0 0", opacity: "0.9" }}>
              {isMobile ? t('passport.mobileInstructions') : t('passport.desktopInstructions')}
            </p>
          </div>
          
          <div style={{ padding: "30px", textAlign: "center" }}>
            
            {/* Status Display */}
            <div style={{
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "24px",
              backgroundColor: status === 'verified' ? '#f0fdf4' : 
                              status === 'failed' ? '#fef2f2' : '#f8fafc',
              border: `1px solid ${status === 'verified' ? '#bbf7d0' : 
                                   status === 'failed' ? '#fecaca' : '#e2e8f0'}`
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>
                {status === 'verified' ? '✅' : 
                 status === 'failed' ? '❌' : 
                 isPolling ? '⏳' : '⏸️'}
              </div>
              <h3 style={{
                margin: "0 0 8px",
                color: status === 'verified' ? '#059669' : 
                       status === 'failed' ? '#dc2626' : '#374151'
              }}>
                {status === 'verified' ? t('passport.verified') : 
                 status === 'failed' ? t('passport.failed') : 
                 isPolling ? t('passport.verifying') : t('passport.waiting')}
              </h3>
              {statusError && (
                <p style={{ color: '#dc2626', margin: "0" }}>{statusError}</p>
              )}
            </div>

            {/* QR Code or Deep Link */}
            {verificationLink && verificationLink !== 'completed' && status !== 'verified' && (
              <>
                {isMobile ? (
                  // Mobile: Deep Link Button or App Download
                  <div style={{ marginBottom: "24px" }}>
                    {showAppDownload ? (
                      // Show app download options
                      <div style={{
                        backgroundColor: "#fef3c7",
                        border: "1px solid #f59e0b",
                        borderRadius: "8px",
                        padding: "20px",
                        textAlign: "center",
                        marginBottom: "16px"
                      }}>
                        <div style={{ fontSize: "2rem", marginBottom: "12px" }}>📱</div>
                        <h3 style={{ color: "#92400e", marginBottom: "12px" }}>
                          {t('passport.appNotInstalled')}
                        </h3>
                        <p style={{ color: "#92400e", marginBottom: "16px", fontSize: "0.875rem" }}>
                          {t('passport.appNotInstalledMessage')}
                        </p>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                          <button
                            onClick={handleDownloadApp}
                            style={{
                              backgroundColor: "#059669",
                              color: "white",
                              border: "none",
                              borderRadius: "8px",
                              padding: "12px 20px",
                              fontSize: "0.9rem",
                              fontWeight: "600",
                              cursor: "pointer"
                            }}
                          >
                            📲 {t('passport.downloadApp')}
                          </button>
                          <button
                            onClick={handleRetryAppOpen}
                            style={{
                              backgroundColor: "#6b7280",
                              color: "white",
                              border: "none",
                              borderRadius: "8px",
                              padding: "12px 20px",
                              fontSize: "0.9rem",
                              fontWeight: "600",
                              cursor: "pointer"
                            }}
                          >
                            🔄 {t('passport.retryOpenApp')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Show open app button
                      <>
                        <button
                          onClick={handleOpenApp}
                          disabled={isAttemptingAppOpen}
                          style={{
                            backgroundColor: isAttemptingAppOpen ? "#6b7280" : "#059669",
                            color: "white",
                            border: "none",
                            borderRadius: "12px",
                            padding: "16px 32px",
                            fontSize: "1.1rem",
                            fontWeight: "600",
                            cursor: isAttemptingAppOpen ? "not-allowed" : "pointer",
                            marginBottom: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            margin: "0 auto",
                            opacity: isAttemptingAppOpen ? 0.6 : 1
                          }}
                        >
                          {isAttemptingAppOpen ? (
                            <>
                              ⏳ {t('passport.openingApp')}
                            </>
                          ) : (
                            <>
                              📱 {t('passport.openRarimeApp')}
                            </>
                          )}
                        </button>
                        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                          {t('passport.mobileAppInstructions')}
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  // Desktop: QR Code
                  <div style={{ marginBottom: "24px", textAlign: "center" }}>
                    <img
                      src={generateQRCode(verificationLink)}
                      alt="Verification QR Code"
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        marginBottom: "16px",
                        display: "block",
                        margin: "0 auto 16px auto"
                      }}
                    />
                    <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                      {t('passport.qrInstructions')}
                    </p>
                  </div>
                )}

                {/* App Download Link - Only show on desktop */}
                {!isMobile && (
                  <div style={{
                    backgroundColor: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "24px"
                  }}>
                    <p style={{ margin: "0 0 8px", fontWeight: "600", color: "#0369a1" }}>
                      {t('passport.needApp')}
                    </p>
                    <a
                      href="https://docs.rarimo.com/rarime-app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#2563eb",
                        textDecoration: "underline",
                        fontSize: "0.875rem"
                      }}
                    >
                      {t('passport.downloadApp')}
                    </a>
                  </div>
                )}
              </>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              {status !== 'verified' && (
                <>
                  <button
                    onClick={handleConfirmAuthentication}
                    disabled={isConfirming}
                    style={{
                      backgroundColor: "#059669",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px 24px",
                      fontSize: "1rem",
                      fontWeight: "600",
                      cursor: isConfirming ? "not-allowed" : "pointer",
                      opacity: isConfirming ? 0.6 : 1
                    }}
                  >
                    {isConfirming ? t('passport.confirming') : t('passport.confirmAuth')}
                  </button>
                  <button
                    onClick={handleManualCheck}
                    disabled={isPolling}
                    style={{
                      backgroundColor: "#5856D6",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px 24px",
                      fontSize: "1rem",
                      fontWeight: "600",
                      cursor: isPolling ? "not-allowed" : "pointer",
                      opacity: isPolling ? 0.6 : 1
                    }}
                  >
                    {isPolling ? t('passport.checking') : t('passport.checkStatus')}
                  </button>
                </>
              )}

              <button
                onClick={() => navigate('/vote/passport')}
                style={{
                  backgroundColor: "transparent",
                  color: "#6b7280",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  padding: "12px 24px",
                  fontSize: "1rem",
                  cursor: "pointer"
                }}
              >
                {t('passport.goBack')}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PassportVerification;