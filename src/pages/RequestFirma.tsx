import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import queryString from "query-string";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useVote } from "./VoteContext";
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
    <div>
      <Header />
      <h1 className="card-title">Create a new Proof of Identity to be able to cast a vote</h1>
      <p className="card-subtitle">
        { authUrl ? (
        <button
          onClick={() => {
            if (authUrl) {
              window.location.href = authUrl;
            } else {
              console.error("Authorization URL is not defined.");
            }
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
      ):
      (<p className="card-subtitle">You will be able to proceed in a second...</p>)}
      </p>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ): (
        <p className="card-subtitle">Please use your Firma Digital card to authenticate and vote</p>
      )}
    <Footer />
    </div>
  );
};

export default RequestFirma;
