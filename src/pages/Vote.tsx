import '../i18n';
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { getVoteData } from '../hooks/castVote';
import { getVoteScope } from '../hooks/getCredentialData';
import { VoteOptionsDisplay } from '../components/VoteOptionsDisplay';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useVote } from "./VoteContext";

const Vote: React.FC = () => {
  const { t } = useTranslation();
  const [voteData, setVoteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canVote, setCanVote] = useState(false);
  const { verifiableCredential, setVoteScope, voteScope } = useVote();

  const navigate = useNavigate();

  // Get vote data
  const fetchVoteScope = async () => {
    try {
      const { _voteScope, _error } = await getVoteScope();
      if ( _error === "No election yet available for user.") {
        setVoteScope(0);
      } else if ( _error === "Wallet no yet available." ) {
        setVoteScope(0);
      } else {
        setVoteScope(_voteScope);
      }
      setError(_error);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // If no VC available, create one
  useEffect(() => {
    if (verifiableCredential === null && voteScope === null) {
      fetchVoteScope();
      navigate("/request-firma");
    }
  }, []);

  // Get vote data
  const fetchVoteData = async () => {
    try {
      const { _data, _error } = await getVoteData();
      if ( _error === "No proposals yet available for user.") {
        setCanVote(false);
        setVoteData(null);
      } else if ( _error === "Wallet no yet available." ) {
        setCanVote(false);
        setVoteData(null);
      } else {
        setCanVote(true);
        setVoteData(_data);
      }
      setError(_error);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (verifiableCredential !== null) {
      fetchVoteData();
    }
  }, [verifiableCredential]);

  // 4. Show voting form when available
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
          maxWidth: "900px",
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
            }}>{t('voting.title')}</h1>
          </div>
          
          <div style={{
            padding: "30px"
          }}>
            <h2 style={{
              fontSize: "1.4rem",
              color: "#333",
              marginBottom: "20px",
              fontWeight: "500"
            }}>{t('vc')}</h2>
            
            {error ? (
              <div style={{
                padding: "16px",
                backgroundColor: "#fff5f5",
                border: "1px solid #fed7d7",
                borderRadius: "6px",
                color: "#e53e3e",
                marginBottom: "20px"
              }}>
                <p style={{ margin: "0" }}>{error}</p>
              </div>
            ) : loading ? (
              <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "40px 0"
              }}>
                <div style={{
                  border: "4px solid #f3f3f3",
                  borderTop: "4px solid #5856D6",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  animation: "spin 1s linear infinite"
                }}></div>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            ) : !canVote || !voteData ? (
              <div style={{
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
                padding: "30px",
                textAlign: "center",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{
                  marginBottom: "20px",
                  fontSize: "24px",
                  color: "#5856D6"
                }}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="36" 
                    height="36" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                    <path d="M20 12v4h-4a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4" />
                    <path d="M20 12h-4" />
                  </svg>
                </div>
                <p style={{
                  fontSize: "1.1rem",
                  color: "#4a5568",
                  marginBottom: "20px"
                }}>{t('common.metamaskLogin')}.</p>
                <button style={{
                  backgroundColor: "#5856D6",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "12px 24px",
                  fontSize: "1rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease"
                }}>
                  {t('common.connectWallet')}
                </button>
              </div>
            ) : (
              <VoteOptionsDisplay voteData={voteData} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Vote;