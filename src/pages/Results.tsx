import '../i18n';
import React, { useEffect, useState } from 'react';
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { getVoteData } from "../hooks/getVoteResults";
import { useWallet } from "../contexts/WalletContext";
import './styles.css';

interface Proposal {
  description: string;
  voteCount: number;
};

const VoteResults: React.FC = () => {
  console.log('🔄 VoteResults component rendered');

  const [votingQuestion, setvotingQuestion] = useState<string | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, account, connect, error: walletError } = useWallet();

  console.log('📊 Current state:', {
    votingQuestion: !!votingQuestion,
    proposals: proposals.length,
    totalVotes,
    loading,
    error,
    isConnected,
    account
  });

  // Fetch vote results
  useEffect(() => {
    let mounted = true;

    const fetchVoteResults = async () => {
      // Solo buscar resultados si estamos conectados y tenemos la cuenta
      if (!isConnected || !account) {
        console.log('❌ Wallet not connected or no account');
        if (mounted) setLoading(false);
        return;
      }

      console.log('✅ Fetching vote results with account:', account);
      
      if (mounted) setLoading(true);
      
      try {
        const {
          _votingQuestion,
          _proposalsArray,
          _totalVotesBN,
          _error
        } = await getVoteData();

        if (!mounted) return;

        if (_error) {
          console.error('❌ Error from getVoteData:', _error);
          setError(_error);
          return;
        }

        console.log('✅ Vote results fetched successfully');
        setvotingQuestion(_votingQuestion);
        setProposals(_proposalsArray);
        setTotalVotes(_totalVotesBN);
        setError(null);
      } catch (err: any) {
        console.error('❌ Error fetching vote results:', err);
        if (mounted) {
          setError(err.message || "Error fetching vote results");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchVoteResults();

    return () => {
      mounted = false;
    };
  }, [isConnected, account]);

  // Handle wallet errors
  useEffect(() => {
    console.log('🔄 Wallet error effect running, error:', walletError);
    if (walletError) {
      setError(walletError);
      setLoading(false);
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
        <h1 className="card-title">Vote Results</h1>
        
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          width: "100%",
          maxWidth: "800px",
        }}>
          {loading ? (
            <p>Loading vote results...</p>
          ) : !isConnected ? (
            <div style={{textAlign: 'center'}}>
              <p className="card-subtitle">Please connect your wallet to view the results</p>
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
                  marginTop: "20px"
                }}
              >
                Connect Wallet
              </button>
            </div>
          ) : error ? (
            <div style={{textAlign: 'center'}}>
              <p style={{ color: 'red', marginBottom: '20px' }}>{error}</p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: "10px 20px",
                  fontSize: "16px",
                  cursor: "pointer",
                  backgroundColor: "#007BFF",
                  color: "#FFF",
                  border: "none",
                  borderRadius: "5px"
                }}
              >
                Retry
              </button>
            </div>
          ) : votingQuestion ? (
            <div style={{ width: '100%' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
                {votingQuestion}
              </h2>
              <p style={{ textAlign: 'center', fontSize: '18px' }}>
                <strong>Total Votes:</strong> {totalVotes}
              </p>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                  marginTop: '20px'
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        border: '1px solid #ddd',
                        padding: '12px',
                        backgroundColor: '#f5f5f5',
                        textAlign: 'left'
                      }}
                    >
                      Proposal
                    </th>
                    <th
                      style={{
                        border: '1px solid #ddd',
                        padding: '12px',
                        backgroundColor: '#f5f5f5',
                        textAlign: 'left'
                      }}
                    >
                      Votes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map((proposal, index) => (
                    <tr
                      key={index}
                      style={{
                        borderBottom: '1px solid #ddd',
                        transition: 'background-color 0.3s'
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = '#f9f9f9')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = 'transparent')
                      }
                    >
                      <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                        {proposal.description}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                        {proposal.voteCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No voting data available</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VoteResults;
