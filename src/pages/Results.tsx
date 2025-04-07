import '../i18n';
import React, { useEffect, useState } from 'react';
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { getVoteData } from "../hooks/getVoteResults";
import { useWallet } from "../context/WalletContext";
import { useTranslation } from 'react-i18next';

interface Proposal {
  description: string;
  voteCount: number;
};

const VoteResults: React.FC = () => {
  const { t } = useTranslation();
  const [votingQuestion, setvotingQuestion] = useState<string | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isConnected, connect, account } = useWallet();

  const fetchVoteResults = async () => {
    setLoading(true);
    try {
      const {
        _votingQuestion,
        _proposalsArray,
        _totalVotesBN,
        _error } = await getVoteData();
      
      if (_error) {
        setError(_error);
      } else {
        setvotingQuestion(_votingQuestion);
        setProposals(_proposalsArray);
        setTotalVotes(_totalVotesBN);
      }
    } catch (err: any) {
      console.error("Error fetching vote results:", err);
      setError("Error fetching vote results.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && account) {
      fetchVoteResults();
    } else {
      setLoading(false);
      setError("Wallet no yet available.");
    }
  }, [isConnected, account]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      
      <main style={{ 
        flex: "1", 
        padding: '40px 20px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: "#f8f9fa" 
      }}>
        <div style={{
          maxWidth: "1000px",
          margin: "0 auto",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          overflow: "hidden"
        }}>
          {loading ? (
            <div style={{
              padding: "80px 20px",
              textAlign: "center"
            }}>
              <div style={{
                display: "inline-block",
                width: "50px",
                height: "50px",
                border: "5px solid #f3f3f3",
                borderTop: "5px solid #5856D6",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginBottom: "20px"
              }}></div>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
              <p style={{ fontSize: "18px" }}>{t('common.loading')}</p>
            </div>
          ) : error ? (
            <div style={{
              padding: "60px 20px",
              textAlign: "center"
            }}>
              <div style={{
                fontSize: "60px",
                marginBottom: "20px",
                color: "#d9534f"
              }}>
                ⚠️
              </div>
              <h2 style={{ 
                marginBottom: "20px", 
                color: "#333" 
              }}>{t('common.error')}</h2>
              <p style={{ 
                fontSize: "16px", 
                color: "#666",
                marginBottom: "30px",
                maxWidth: "600px",
                margin: "0 auto 30px"
              }}>
                {error === "Wallet no yet available." ? 
                  t('common.walletNotConnected') : 
                  error}
              </p>
              {(error === "Wallet no yet available." || !isConnected) && (
                <button 
                  onClick={connect}
                  style={{
                    backgroundColor: "#5856D6",
                    color: "white",
                    border: "none",
                    padding: "12px 25px",
                    borderRadius: "5px",
                    fontSize: "16px",
                    cursor: "pointer",
                    fontWeight: "500",
                    transition: "background-color 0.3s"
                  }}
                  onMouseOver={(e) => 
                    (e.currentTarget.style.backgroundColor = "#4745c0")
                  }
                  onMouseLeave={(e) => 
                    (e.currentTarget.style.backgroundColor = "#5856D6")
                  }
                >
                  {t('common.connectWallet')}
                </button>
              )}
            </div>
          ) : (
            <div style={{ padding: '30px' }}>
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
            
              <h1 style={{ 
                textAlign: 'center', 
                marginBottom: '25px',
                color: "#333"
              }}>
                {t('common.voteResults')}: {votingQuestion}
              </h1>
              
              <div style={{
                backgroundColor: "#f8fafc",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "25px",
                textAlign: "center"
              }}>
                <strong>{t('common.totalVotes')}:</strong> {totalVotes}
              </div>

              {proposals.length > 0 ? (
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
                  borderRadius: "5px",
                  overflow: "hidden"
                }}>
                  <thead>
                    <tr>
                      <th style={{
                        padding: '15px',
                        backgroundColor: '#5856D6',
                        color: 'white',
                        textAlign: 'left',
                        fontWeight: "600"
                      }}>
                        {t('common.proposal')}
                      </th>
                      <th style={{
                        padding: '15px',
                        backgroundColor: '#5856D6',
                        color: 'white',
                        textAlign: 'center',
                        width: "150px",
                        fontWeight: "600"
                      }}>
                        {t('common.votes')}
                      </th>
                      <th style={{
                        padding: '15px',
                        backgroundColor: '#5856D6',
                        color: 'white',
                        textAlign: 'center',
                        width: "180px",
                        fontWeight: "600"
                      }}>
                        {t('common.percentage')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposals.map((proposal, index) => (
                      <tr
                        key={index}
                        style={{
                          backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9ff',
                          transition: 'background-color 0.3s'
                        }}
                      >
                        <td style={{ 
                          padding: '15px',
                          borderBottom: '1px solid #eee' 
                        }}>
                          {proposal.description}
                        </td>
                        <td style={{ 
                          padding: '15px', 
                          textAlign: 'center',
                          fontWeight: "600",
                          borderBottom: '1px solid #eee'
                        }}>
                          {proposal.voteCount}
                        </td>
                        <td style={{ 
                          padding: '15px', 
                          textAlign: 'center',
                          fontWeight: "600",
                          borderBottom: '1px solid #eee'
                        }}>
                          {totalVotes > 0 
                            ? `${((proposal.voteCount / totalVotes) * 100).toFixed(1)}%` 
                            : '0%'}
                          <div style={{
                            width: '100%',
                            backgroundColor: '#e9ecef',
                            borderRadius: '4px',
                            height: '8px',
                            marginTop: '8px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${totalVotes > 0 ? (proposal.voteCount / totalVotes) * 100 : 0}%`,
                              backgroundColor: '#5856D6',
                              height: '100%'
                            }}></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{
                  textAlign: "center",
                  padding: "30px",
                  color: "#666"
                }}>
                  {t('common.noProposalsFound')}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VoteResults;
