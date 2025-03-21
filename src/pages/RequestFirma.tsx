import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import queryString from "query-string";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useVote } from "./VoteContext";
import { useWallet } from "../contexts/WalletContext";
import './styles.css';

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
  console.log('🔄 RequestFirma component rendered');
  
  const [searchParams] = useSearchParams();
  const [authUrl, setAuthUrl] = useState<string>("");
  const [tokenData, setTokenData] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { verifiableCredential, setVerifiableCredential, voteScope } = useVote();
  const { isConnected, account, connect, error: walletError } = useWallet();
  const navigate = useNavigate();

  console.log('📊 Current state:', {
    authUrl: !!authUrl,
    tokenData: !!tokenData,
    error,
    isLoading,
    voteScope,
    isConnected,
    account
  });

  // Generate the authorization URL
  useEffect(() => {
    let mounted = true;
    
    const generateAuthUrl = async () => {
      // Solo generar la URL si estamos conectados y tenemos la cuenta
      if (!isConnected || !account) {
        console.log('❌ Wallet not connected or no account');
        return;
      }

      // Verificar que tenemos el voteScope
      if (!voteScope) {
        console.log('❌ No voteScope available');
        return;
      }

      console.log('✅ Generating authorization URL with:', {
        account,
        voteScope
      });

      if (mounted) setIsLoading(true);
      
      try {
        const url = `${AUTH_SERVER_URL}/authorize?` + queryString.stringify({
          grant_type: "code",
          client_id: CLIENT_ID,
          user_id: account,
          redirect_uri: REDIRECT_URI,
          scope: "zk-firma-digital",
          state: Math.random() * 10000,
          nullifier_seed: voteScope
        });
        console.log('✅ Authorization URL generated:', url);
        if (mounted) setAuthUrl(url);
      } catch (error) {
        console.error('❌ Error generating authorization URL:', error);
        if (mounted) {
          setError("Failed to generate authorization URL");
          setAuthUrl("");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    // Solo intentar generar la URL si no hay código en los parámetros
    const code = searchParams.get("code");
    if (!code && !tokenData) {
      generateAuthUrl();
    }

    return () => {
      mounted = false;
    };
  }, [isConnected, account, voteScope]);

  // Handle the callback and exchange the code for an access token
  useEffect(() => {
    let mounted = true;
    const code = searchParams.get("code");
    console.log('🔄 Token exchange effect running, code present:', !!code);

    if (code) {
      const exchangeToken = async () => {
        console.log('🔄 Exchanging token...');
        if (mounted) setIsLoading(true);
        
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

          if (!mounted) return;

          console.log('✅ Token exchange successful');
          const { access_token, verifiable_credential } = response.data;
          setTokenData(parseJwt(access_token));
          try {
            setVerifiableCredential(JSON.parse(verifiable_credential));
            console.log('✅ Verifiable credential set');
          } catch (error) {
            console.error('❌ Invalid verifiable credential:', error);
            setError("Invalid verifiable credential received");
          }
        } catch (err) {
          console.error('❌ Error exchanging authorization code:', err);
          if (mounted) {
            setError("Failed to exchange authorization code for access token");
          }
        } finally {
          if (mounted) setIsLoading(false);
        }
      };

      exchangeToken();
    }

    return () => {
      mounted = false;
    };
  }, [searchParams, setVerifiableCredential]);

  useEffect(() => {
    console.log('🔄 Navigation effect running, verifiableCredential present:', !!verifiableCredential);
    if (verifiableCredential !== null) {
      navigate("/vote");
    }
  }, [verifiableCredential, navigate]);

  // Handle wallet errors
  useEffect(() => {
    console.log('🔄 Wallet error effect running, error:', walletError);
    if (walletError) {
      setError(walletError);
    }
  }, [walletError]);
  
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column"
    }}>
      <Header />
      <main style={{
        flex: "1 0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "1rem"
      }}>
        <h1 className="card-title">Create a new Proof of Identity to be able to cast a vote</h1>
        <div className="card-subtitle" style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          width: "100%",
          maxWidth: "600px",
        }}>
          {isLoading ? (
            <p>Loading...</p>
          ) : !isConnected ? (
            <button
              onClick={connect}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                cursor: "pointer",
                backgroundColor: "#007BFF",
                color: "#FFF",
                border: "none",
                borderRadius: "5px",
                alignItems: "center"
              }}
            >
              Connect Wallet
            </button>
          ) : authUrl ? (
            <button
              onClick={() => {
                window.location.href = authUrl;
              }}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                cursor: "pointer",
                backgroundColor: "#007BFF",
                color: "#FFF",
                border: "none",
                borderRadius: "5px",
                alignItems: "center"
              }}
            >
              Authenticate
            </button>
          ) : (
            <p>Generating authentication URL...</p>
          )}
        </div>
        {error && (
          <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
        )}
        {!error && (
          <p className="card-subtitle" style={{ textAlign: 'center' }}>Please use your Firma Digital card to authenticate and vote</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default RequestFirma;
