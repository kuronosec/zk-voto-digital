import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import queryString from "query-string";
import { issueCredential } from '../hooks/issueCredential';
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import './styles.css';

// Secrets
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID || "hello@example.com";
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET || "password";
const USER_ID = process.env.REACT_APP_USER_ID || "hello@user.com";
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
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [verifiableCredential, setVerifiableCredential] =
    useState<Record<string, any> | null>(null);
  const navigate = useNavigate();
  
  // Step 1: Generate the authorization URL
  useEffect(() => {
    const code = searchParams.get("code");

    if (!code && !tokenData) {
      const url = `${AUTH_SERVER_URL}/authorize?` + queryString.stringify({
        grant_type: "code",
        client_id: CLIENT_ID,
        user_id: USER_ID,
        redirect_uri: REDIRECT_URI,
        scope: "zk-firma-digital",
        state: Math.random() * 10000, // Random value to protect against CSRF
      });
      setAuthUrl(url);
    }
  }, []);

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

  // Step 3: Create credentials on-chain
  const pushData = async () => {
      try {
        const { result, error, done } =
          await issueCredential(verifiableCredential);
        setResult(result);
        setError(error);
        console.log("result:", result);
        console.log("error:", error);
        if (done) {
          setDone(done);
        }
      } catch (err) {
          setError(err instanceof Error ? err.message : "An error occurred");
      }
  };
    
  useEffect(() => {
      if (tokenData && verifiableCredential) {
        pushData();
      }
    }, [tokenData, verifiableCredential]);

  useEffect(() => {
    if (done) {
      navigate("/vote");
    }
  }, [done]); // Only runs when loading, data, or navigate changes
  
  // Step 3: Display the UI
  return (
    <div>
      <Header />
      <h1 className="card-title">Create a new Proof of Identity to be able to cast a vote</h1>
      <p className="card-subtitle">
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
      </p>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ): (
        <p className="card-subtitle">Please use your Firma Digital card to authenticate and vote</p>
      )}
    </div>
  );
};

export default RequestFirma;
