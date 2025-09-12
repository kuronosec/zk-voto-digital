import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from './Header';
import { Footer } from './Footer';
import { PassportVerificationService } from '../services/passportService';
import { useVote } from '../pages/VoteContext';

const PassportCallback: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setVerifiableCredential, setAuthMethod } = useVote();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const scope = searchParams.get('scope');

      if (!code) {
        setError('Missing authorization code');
        setIsProcessing(false);
        return;
      }

      try {
        // Exchange code for token and proof
        const tokenData = await PassportVerificationService.exchangeCodeForToken(
          code, 
          state || 'unknown-user'
        );

        const { access_token, proof } = tokenData;

        if (proof) {
          // Save proof as verifiable credential
          setVerifiableCredential(JSON.stringify(proof));
          setAuthMethod('passport');
          
          // Navigate to voting page
          navigate('/vote');
        } else {
          throw new Error('No proof received from server');
        }
      } catch (err) {
        console.error('Error processing callback:', err);
        setError(err instanceof Error ? err.message : 'Failed to process authentication');
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, navigate, setVerifiableCredential, setAuthMethod]);

  if (error) {
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
              Authentication Error
            </h2>
            <p style={{ color: "#6b7280", marginBottom: "24px" }}>
              {error}
            </p>
            <button
              onClick={() => navigate('/vote/passport')}
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
              {t('passport.goBack')}
            </button>
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
          <h2>Processing Authentication...</h2>
          <p style={{ color: "#6b7280" }}>
            Please wait while we complete your passport verification.
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PassportCallback;