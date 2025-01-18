import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import queryString from "query-string";
import { issueCredential } from '../../hooks/issueCredential';

// Secrets
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID || "hello@example.com";
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET || "password";
const USER_ID = process.env.REACT_APP_USER_ID || "hello@user.com";
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || "http://localhost:3000/callback";
const AUTH_SERVER_URL = process.env.REACT_APP_AUTH_SERVER_URL || "https://app.sakundi.io";

interface VCFetchProps {
  onVCFetch: (proof: any, signals: any) => void;
  onError: (error: string) => void;
}

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
    console.log(JSON.parse(jsonPayload));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}

const RequestFirma: React.FC<VCFetchProps> = ({ onVCFetch, onError }) => {
  const [searchParams] = useSearchParams();
  const [authUrl, setAuthUrl] = useState<string>("");
  const [tokenData, setTokenData] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  var verifiable_credential_json: any = null;
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
            verifiable_credential_json = JSON.parse(verifiable_credential);
            if (verifiable_credential_json) {
              console.log(verifiable_credential_json);
              if (verifiable_credential_json.proof) {
                onVCFetch(
                  verifiable_credential_json.proof.signatureValue.proof,
                  verifiable_credential_json.proof.signatureValue.public
                );
              } else {
                console.log('Invalid veriable credential');
                onError('Invalid veriable credential');
              }
            }
          } catch (error) {
            console.log("Error parsing JSON file: " + error);
            onError(error instanceof Error ? error.message : 'Error parsing JSON file');
          }
        } catch (err) {
          console.error("Error exchanging authorization code:", err);
          setError("Failed to exchange authorization code for access token");
        }
      };

      exchangeToken();
    }
  }, [searchParams]);

  // Step 3: Display the UI
  if (tokenData) {
    const { result, error, done } = issueCredential(verifiable_credential_json);
    if (done) {
      return (
        <div>
          <h1>Credential created succesfully!</h1>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      );
    } else if (error) {
      return (
        <div>
          <h1>There was an error on the credential creation!</h1>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      );
    }
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Create a new Proof of Identity to be able to cast a vote</h1>
      <p>
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
          }}
        >
          Authenticate
        </button>
      </p>
    </div>
  );
};

export default RequestFirma;
