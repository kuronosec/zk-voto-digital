import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import queryString from "query-string";

// Secrets
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID || "hello@example.com";
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET || "password";
const USER_ID = process.env.REACT_APP_USER_ID || "hello@user.com";
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || "http://localhost:3000/callback";
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

  // Step 1: Generate the authorization URL
  useEffect(() => {
    const url = `${AUTH_SERVER_URL}/authorize?` + queryString.stringify({
      grant_type: "code",
      client_id: CLIENT_ID,
      user_id: USER_ID,
      redirect_uri: REDIRECT_URI,
      scope: "zk-firma-digital",
      state: Math.random() * 10000, // Random value to protect against CSRF
    });
    setAuthUrl(url);
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
          setTokenData(parseJwt(access_token));
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
    return (
      <div>
        <h1>Access Token Received!</h1>
        <pre>{JSON.stringify(tokenData, null, 2)}</pre>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Authenticate with Your Digital Signature</h1>
      <p>
        <a href={authUrl}>Click here to begin the authentication process</a>
      </p>
    </div>
  );
};

export default RequestFirma;
