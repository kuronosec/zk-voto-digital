import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import queryString from "query-string";
import { useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useVote } from "../pages/VoteContext";
import { useWallet } from "../context/WalletContext";
import { useTranslation } from "react-i18next";
import { createSmartWalletConnect, getSmartConnectButtonText } from "../utils/walletConnection";

// Configuration
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID || "hello@example.com";
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET || "password";
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || `${window.location.origin}/request-passport`;
const AUTH_SERVER_URL = process.env.REACT_APP_AUTH_SERVER_URL || "https://app.sakundi.io";

// Helper function to parse JWT
function parseJwt(token: string): Record<string, any> | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}

// Helper function to detect mobile
const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Helper function to generate QR code URL
const generateQRCode = (text: string): string => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
};

// Helper function to generate deep link for RariMe app
const generateDeepLink = (proofParamsUrl: string): string => {
  const deepLinkUrl = new URL('rarime://external');
  deepLinkUrl.searchParams.append('type', 'proof-request');
  deepLinkUrl.searchParams.append('proof_params_url', proofParamsUrl);
  
  return deepLinkUrl.toString();
};

const PassportAuth: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [authUrl, setAuthUrl] = useState<string>("");
  const [proofParamsUrl, setProofParamsUrl] = useState<string>("");
  const [tokenData, setTokenData] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [showAppDownload, setShowAppDownload] = useState(false);
  const [isAttemptingAppOpen, setIsAttemptingAppOpen] = useState(false);
  
  const { verifiableCredential, setVerifiableCredential, voteScope, setAuthMethod } = useVote();
  const navigate = useNavigate();
  const { isConnected, account, connect, checkWalletState, isChangingNetwork } = useWallet();
  const [isCheckingWallet, setIsCheckingWallet] = useState(true);
  
  const mobile = isMobile();
  
  // Create smart wallet connect handler
  const smartConnect = createSmartWalletConnect(connect, navigate, isConnected);
  
  // Check wallet state on component mount only once
  useEffect(() => {
    const checkWallet = async () => {
      await checkWalletState();
      setIsCheckingWallet(false);
    };
    
    checkWallet();
  }, [checkWalletState]);
  
  // Generate authorization URL - following RequestFirma pattern exactly
  const generateAuthUrl = useCallback(() => {
    if (isConnected && account && voteScope !== null && !tokenData) {
      return `${AUTH_SERVER_URL}/authorize?` + queryString.stringify({
        grant_type: "code",
        client_id: CLIENT_ID,
        user_id: account,
        redirect_uri: REDIRECT_URI,
        scope: "zk-passport",
        state: String(Math.floor(Math.random() * 10000)),
        nullifier_seed: voteScope,
        data: encodeURIComponent(
          JSON.stringify({
            "id": account,
            "type": "user",
            "attributes": {
              "age_lower_bound": 18,
              "uniqueness": true,
              "nationality": "COL", // Default nationality, could be made configurable
              "nationality_check": true,
              "event_id": voteScope?.toString() || "1",
            }
          })
        )
      });
    }
    return "";
  }, [isConnected, account, voteScope, tokenData]);

  // Update authUrl only when dependencies change
  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      const url = generateAuthUrl();
      if (url) {
        setAuthUrl(url);
        // Extract proof_params_url from the auth URL for QR/deeplink generation
        // This simulates getting the proof params URL from the auth server response
        setProofParamsUrl(url);
      }
    }
  }, [generateAuthUrl, searchParams]);

  // Handle OAuth callback - exchange code for token (following RequestFirma pattern exactly)
  useEffect(() => {
    const code = searchParams.get("code");
    if (!code || tokenData) return;

    const exchangeToken = async () => {
      try {
        const response = await axios.post(
          `${AUTH_SERVER_URL}/token`,
          queryString.stringify({
            code: code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            scope: "zk-passport",
            grant_type: "authorization_code",
          }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        const { access_token, proof } = response.data;
        setTokenData(parseJwt(access_token));
        
        try {
          // Handle proof format - could be string or object
          let parsedCredential;
          if (typeof proof === 'string') {
            parsedCredential = JSON.parse(proof);
          } else {
            parsedCredential = proof;
          }
          setVerifiableCredential(parsedCredential);
          setAuthMethod('passport');
        } catch (error) {
          console.error("Invalid verifiable credential: " + error);
          setError("Invalid verifiable credential format");
        }
      } catch (err) {
        console.error("Error exchanging authorization code:", err);
        setError("Failed to exchange authorization code for access token");
      }
    };

    exchangeToken();
  }, [searchParams, setVerifiableCredential, setAuthMethod, tokenData]);

  // Navigate to vote when we have verifiable credential (following RequestFirma pattern exactly)
  useEffect(() => {
    if (verifiableCredential) {
      navigate("/vote");
    }
  }, [verifiableCredential, navigate]);

  // Handle opening RariMe app (mobile)
  const handleOpenApp = () => {
    if (proofParamsUrl) {
      setIsAttemptingAppOpen(true);
      const deepLink = generateDeepLink(proofParamsUrl);
      
      // Try to open the app
      window.location.href = deepLink;
      
      // Set a timeout to detect if the app didn't open
      const timeoutId = setTimeout(() => {
        setIsAttemptingAppOpen(false);
        setShowAppDownload(true);
      }, 3000);
      
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
  
  // Handle app download
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
  
  // Handle retry app open
  const handleRetryAppOpen = () => {
    setShowAppDownload(false);
    handleOpenApp();
  };

  // Wallet Connection Section
  const WalletConnectionSection = () => (
    <div style={{
      textAlign: "center",
      backgroundColor: "#f0f4ff",
      borderRadius: "8px",
      padding: "24px",
      marginBottom: "30px"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: "16px"
      }}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="48" 
          height="48" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#5856D6" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      <p style={{
        fontSize: "1.1rem",
        color: "#333",
        marginBottom: "16px",
        fontWeight: "500"
      }}>
        {t('common.connectWalletTitle')}
      </p>
      <p style={{
        color: "#666",
        lineHeight: "1.6",
        marginBottom: "20px"
      }}>
        {t('common.connectWalletDescription')}
      </p>
      <button
        onClick={smartConnect}
        style={{
          backgroundColor: "#5856D6",
          color: "white",
          border: "none",
          padding: "12px 24px",
          borderRadius: "6px",
          fontSize: "1rem",
          fontWeight: "500",
          cursor: "pointer",
          transition: "background-color 0.2s",
          display: "inline-flex",
          alignItems: "center"
        }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ marginRight: "8px" }}
        >
          <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
          <path d="M6 12h12"></path>
        </svg>
        {getSmartConnectButtonText(isConnected, t)}
      </button>
    </div>
  );

  // Network Changing Section
  const NetworkChangingSection = () => (
    <div style={{
      backgroundColor: "#f8fafc",
      padding: "20px",
      borderRadius: "8px",
      textAlign: "center",
      border: "1px solid #e2e8f0",
      marginBottom: "20px"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: "16px"
      }}>
        <div style={{
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #5856D6",
          borderRadius: "50%",
          width: "32px",
          height: "32px",
          animation: "spin 1s linear infinite"
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
      <p style={{ color: "#4a5568", margin: "0" }}>
        {t('common.switchingNetwork')}
      </p>
    </div>
  );
  
  // Render UI
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
          maxWidth: "800px",
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
            }}>{t('passport.authentication')}</h1>
            <p style={{ margin: "8px 0 0", opacity: "0.9" }}>
              {mobile ? t('passport.mobileInstructions') : t('passport.desktopInstructions')}
            </p>
          </div>
          
          <div style={{
            padding: "30px"
          }}>
            {isCheckingWallet ? (
              <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "30px 0"
              }}>
                <div style={{
                  border: "4px solid #f3f3f3",
                  borderTop: "4px solid #5856D6",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  animation: "spin 1s linear infinite",
                  marginRight: "12px"
                }}></div>
                <p style={{ color: "#666", margin: "0" }}>{t('common.loading')}</p>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            ) : isChangingNetwork ? (
              <NetworkChangingSection />
            ) : !isConnected ? (
              <WalletConnectionSection />
            ) : (
              <div style={{
                textAlign: "center",
                marginBottom: "30px"
              }}>
                <div style={{
                  backgroundColor: "#f0f4ff",
                  borderRadius: "8px",
                  padding: "24px",
                  marginBottom: "30px"
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "16px"
                  }}>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="48" 
                      height="48" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="#5856D6" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                  </div>
                  <p style={{
                    fontSize: "1.1rem",
                    color: "#333",
                    marginBottom: "8px",
                    fontWeight: "500"
                  }}>
                    {t('passport.authenticationRequired')}
                  </p>
                  <p style={{
                    color: "#666",
                    lineHeight: "1.6",
                    margin: "0"
                  }}>
                   {t('passport.authenticationDescription')}
                  </p>
                </div>
                
                {authUrl ? (
                  <div style={{ marginTop: "30px" }}>
                    {/* Show QR or deeplink based on device */}
                    {mobile ? (
                      /* Mobile: Deep Link Button or App Download */
                      <div style={{ marginBottom: "24px" }}>
                        {showAppDownload ? (
                          /* Show app download options */
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
                          /* Show open app button */
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
                      /* Desktop: QR Code */
                      <div style={{ marginBottom: "24px", textAlign: "center" }}>
                        <img
                          src={generateQRCode(proofParamsUrl)}
                          alt="Passport Authentication QR Code"
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
                    {!mobile && (
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

                    {/* OAuth Authorization Button - Following RequestFirma pattern */}
                    <button
                      onClick={() => {
                        if (authUrl) {
                          window.location.href = authUrl;
                        } else {
                          console.error("Authorization URL is not defined.");
                        }
                      }}
                      style={{
                        backgroundColor: "#5856D6",
                        color: "white",
                        border: "none",
                        padding: "14px 32px",
                        borderRadius: "6px",
                        fontSize: "1rem",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                        display: "inline-flex",
                        alignItems: "center"
                      }}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        style={{ marginRight: "8px" }}
                      >
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                        <polyline points="10 17 15 12 10 7"></polyline>
                        <line x1="15" y1="12" x2="3" y2="12"></line>
                      </svg>
                      {t('passport.authenticate')}
                    </button>
                  </div>
                ) : (
                  <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    margin: "30px 0"
                  }}>
                    <div style={{
                      border: "4px solid #f3f3f3",
                      borderTop: "4px solid #5856D6",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      animation: "spin 1s linear infinite",
                      marginRight: "12px"
                    }}></div>
                    <p style={{ color: "#666", margin: "0" }}>{t('passport.loading')}</p>
                  </div>
                )}
                
                {error && (
                  <div style={{
                    backgroundColor: "#fff5f5",
                    color: "#e53e3e",
                    border: "1px solid #fed7d7",
                    borderRadius: "6px",
                    padding: "16px",
                    marginTop: "20px",
                    textAlign: "left"
                  }}>
                    <p style={{ margin: "0" }}>{error}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Info Section */}
            <div style={{
              borderTop: "1px solid #edf2f7",
              paddingTop: "20px",
              marginTop: "20px"
            }}>
              <h3 style={{
                fontSize: "1.1rem",
                color: "#4a5568",
                marginBottom: "16px"
              }}>{t('passport.zkpInfo.title')}</h3>
              <p style={{
                color: "#718096",
                fontSize: "0.95rem",
                lineHeight: "1.6",
                marginBottom: "16px"
              }}>
                {t('passport.zkpInfo.description1')}
              </p>
              <p style={{
                color: "#718096",
                fontSize: "0.95rem",
                lineHeight: "1.6"
              }}>
               {t('passport.zkpInfo.description2')}
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PassportAuth;