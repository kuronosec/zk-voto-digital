import '../i18n';
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { getVoteData } from '../hooks/castVote';
import { getVoteScope } from '../hooks/getCredentialData';
import { usePassportVote } from '../hooks/passportVote';
import { VoteOptionsDisplay } from '../components/VoteOptionsDisplay';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useVote } from "./VoteContext";
import { useWallet } from "../context/WalletContext";
import { createSmartWalletConnect, getSmartConnectButtonText } from "../utils/walletConnection";

const Vote: React.FC = () => {
  const { t } = useTranslation();
  const [voteData, setVoteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canVote, setCanVote] = useState(false);
  const { verifiableCredential, setVoteScope, voteScope, authMethod } = useVote();
  
  const { isConnected, connect, account, isChangingNetwork } = useWallet();
  const navigate = useNavigate();
  
  // Create smart wallet connect handler
  const smartConnect = createSmartWalletConnect(connect, navigate, isConnected);
  
  // Usamos useRef para mantener un seguimiento de si el componente está montado
  const isMounted = useRef(true);

  // Limpiar el indicador cuando el componente se desmonte
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Get vote scope data - memoizado para evitar recreación
  const fetchVoteScope = useCallback(async () => {
    if (!isConnected || !account) {
      if (isMounted.current) {
        setError("Wallet no yet available.");
        setVoteScope(0);
        setLoading(false);
      }
      return;
    }
    
    try {
      const { _voteScope, _error } = await getVoteScope();
      // Solo actualizar si el componente sigue montado
      if (isMounted.current) {
        if (_error === "No election yet available for user.") {
          setVoteScope(0);
        } else if (_error === "Wallet no yet available.") {
          setVoteScope(0);
        } else {
          setVoteScope(_voteScope);
        }
        setError(_error);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [isConnected, account, setVoteScope]);

  // Efecto para manejar la verificación inicial y navegación
  useEffect(() => {
    if (!isConnected) {
      setLoading(false);
      setError("Wallet no yet available.");
      return;
    }
    
    if (verifiableCredential === null && voteScope === null) {
      // No queremos actualizar estados cuando el componente está en proceso de navegación
      // así que primero verificamos el voteScope y luego navegamos
      fetchVoteScope().then(() => {
        // Solo navegamos si el componente sigue montado
        if (isMounted.current) {
          navigate("/vote/passport");
        }
      });
    }
  }, [isConnected, account, verifiableCredential, voteScope, navigate, fetchVoteScope]);

  // Get vote data - memoizado para evitar recreación
  const fetchVoteData = useCallback(async () => {
    if (!isConnected || !account) {
      if (isMounted.current) {
        setCanVote(false);
        setVoteData(null);
        setError("Wallet no yet available.");
        setLoading(false);
      }
      return;
    }
    
    try {
      const { _data, _error } = await getVoteData();
      
      // Solo actualizar si el componente sigue montado
      if (isMounted.current) {
        // console.log("Datos de votación recibidos:", _data);
        
        if (_error === "No proposals yet available for user.") {
          setCanVote(false);
          setVoteData(null);
        } else if (_error === "Wallet no yet available.") {
          setCanVote(false);
          setVoteData(null);
        } else if (!_data || !_data.votingQuestion || !_data.proposals) {
          console.error("Datos de votación incompletos:", _data);
          setCanVote(false);
          setVoteData(null);
          setError("Datos de votación incompletos");
        } else {
          setCanVote(true);
          setVoteData(_data);
        }
        
        if (_error) {
          setError(_error);
        }
      }
    } catch (err) {
      if (isMounted.current) {
        console.error("Error al obtener datos de votación:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setCanVote(false);
        setVoteData(null);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [isConnected, account]);
  
  // Efecto para obtener datos de votación cuando cambian credenciales o conexión
  useEffect(() => {
    if (verifiableCredential !== null && isConnected && account) {
      fetchVoteData();
    }
    
    // Limpieza: es buena práctica cancelar peticiones pendientes, pero aquí no
    // es posible ya que getVoteData no da un mecanismo para cancelar.
    // Por eso usamos isMounted para evitar actualizaciones si desmonta.
  }, [verifiableCredential, isConnected, account, fetchVoteData]);

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
            {isConnected && account && (
              <div style={{
                backgroundColor: "#f0fff4",
                color: "#38a169",
                border: "1px solid #c6f6d5",
                borderRadius: "6px",
                padding: "12px",
                marginBottom: "20px",
                textAlign: "center",
                fontSize: "14px"
              }}>
                <p style={{ margin: 0 }}>{t('common.connectedAs')}: {account}</p>
              </div>
            )}
            
            <h2 style={{
              fontSize: "1.4rem",
              color: "#333",
              marginBottom: "20px",
              fontWeight: "500"
            }}>{t('vc')}</h2>
            
            {isChangingNetwork ? (
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
            ) : error ? (
              <div style={{
                padding: "16px",
                backgroundColor: "#fff5f5",
                border: "1px solid #fed7d7",
                borderRadius: "6px",
                color: "#e53e3e",
                marginBottom: "20px"
              }}>
                <p style={{ margin: "0" }}>{error}</p>
                
                {error === "Wallet no yet available." && (
                  <div style={{ marginTop: "15px", textAlign: "center" }}>
                    <button 
                      onClick={smartConnect}
                      style={{
                        backgroundColor: "#5856D6",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        padding: "10px 20px",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        cursor: "pointer"
                      }}
                    >
                      {getSmartConnectButtonText(isConnected, t)}
                    </button>
                  </div>
                )}
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
            ) : !isConnected ? (
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
                <button 
                  onClick={smartConnect}
                  style={{
                    backgroundColor: "#5856D6",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "12px 24px",
                    fontSize: "1rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease"
                  }}
                >
                  {getSmartConnectButtonText(isConnected, t)}
                </button>
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
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                  </svg>
                </div>
                <p style={{
                  fontSize: "1.1rem",
                  color: "#4a5568",
                  marginBottom: "20px"
                }}>{t('voting.noProposalsAvailable')}</p>
                <button 
                  onClick={() => navigate("/results")}
                  style={{
                    backgroundColor: "#5856D6",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "12px 24px",
                    fontSize: "1rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease"
                  }}
                >
                  {t('common.viewResults')}
                </button>
              </div>
            ) : !voteData.votingQuestion || !voteData.proposals ? (
              <div style={{
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
                padding: "30px",
                textAlign: "center",
                border: "1px solid #e2e8f0"
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
                </div>
                <p style={{
                  fontSize: "1.1rem",
                  color: "#4a5568",
                  marginBottom: "20px"
                }}>Cargando datos de votación...</p>
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