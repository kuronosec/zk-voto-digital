import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import queryString from "query-string";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useVote } from "./VoteContext";
import { useTranslation } from "react-i18next";

// Secrets
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID || "hello@example.com";
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET || "password";
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || "http://localhost:3000/request-firma";
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

const RequestFirma: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [authUrl, setAuthUrl] = useState<string>("");
  const [tokenData, setTokenData] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { verifiableCredential, setVerifiableCredential, voteScope } = useVote();
  const navigate = useNavigate();

  const getUser = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length === 0) {
      // Prompt the user to connect MetaMask if no accounts are authorized
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const userId = await signer.getAddress();

    return userId;
  };
  
  // Step 1: Generate the authorization URL
  useEffect(() => {
    const fetchUserAndSetUrl = async () => {
      const code = searchParams.get("code");

      const userId = await getUser();
      console.log("RequestFirma userId: ", userId);

      if (!code && !tokenData && voteScope !== null) {
        const url = `${AUTH_SERVER_URL}/authorize?` + queryString.stringify({
          grant_type: "code",
          client_id: CLIENT_ID,
          user_id: userId,
          redirect_uri: REDIRECT_URI,
          scope: "zk-firma-digital",
          state: Math.random() * 10000, // Random value to protect against CSRF,
          nullifier_seed: voteScope
        });
        setAuthUrl(url);
      }
    };

    fetchUserAndSetUrl();
  }, [voteScope]);

  // Step 2: Handle the callback and exchange the code for an access token
  useEffect(() => {
    const code = searchParams.get("code");

    if (code) {
      const exchangeToken = async () => {
        try {
          const response = await axios.post(
            `${AUTH_SERVER_URL}/token`,
            queryString.stringify({
              code: code,
              client_id: CLIENT_ID,
              client_secret: CLIENT_SECRET,
              redirect_uri: REDIRECT_URI,
              grant_type: "authorization_code",
            }),
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          );

          const { access_token } = response.data;
          const { verifiable_credential } = response.data
          setTokenData(parseJwt(access_token));
          try {
            setVerifiableCredential(JSON.parse(verifiable_credential));
          } catch (error) {
            console.error("Invalid verifiable credential: " + error);
          }
        } catch (err) {
          console.error("Error exchanging authorization code:", err);
          setError("Failed to exchange authorization code for access token");
        }
      };

      exchangeToken();
    }
  }, [searchParams]);

  useEffect(() => {
    if (verifiableCredential !== null ) {
      navigate("/vote");
    }
  }, [verifiableCredential]); // Only runs when loading, data, or navigate changes
  
  // Step 3: Display the UI
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
            }}>{t('requestFirmaFile.title')}</h1>
          </div>
          
          <div style={{
            padding: "30px"
          }}>
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
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <p style={{
                  fontSize: "1.1rem",
                  color: "#333",
                  marginBottom: "8px",
                  fontWeight: "500"
                }}>
                  {t('requestFirmaFile.authBox.title')}
                </p>
                <p style={{
                  color: "#666",
                  lineHeight: "1.6",
                  margin: "0"
                }}>
                 {t('requestFirmaFile.authBox.description')}
                </p>
              </div>
              
              {authUrl ? (
                <div style={{
                  marginTop: "30px"
                }}>
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
                    {t('requestFirmaFile.button')}
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
                  <p style={{ color: "#666", margin: "0" }}>{t('requestFirmaFile.loading')}</p>
                  <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
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
            
            <div style={{
              borderTop: "1px solid #edf2f7",
              paddingTop: "20px",
              marginTop: "20px"
            }}>
              <h3 style={{
                fontSize: "1.1rem",
                color: "#4a5568",
                marginBottom: "16px"
              }}>{t('requestFirmaFile.zkpInfo.title')}</h3>
              <p style={{
                color: "#718096",
                fontSize: "0.95rem",
                lineHeight: "1.6",
                marginBottom: "16px"
              }}>
                {t('requestFirmaFile.zkpInfo.description1')}
              </p>
              <p style={{
                color: "#718096",
                fontSize: "0.95rem",
                lineHeight: "1.6"
              }}>
               {t('requestFirmaFile.zkpInfo.description2')}
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RequestFirma;
