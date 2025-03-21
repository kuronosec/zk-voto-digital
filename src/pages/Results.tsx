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
  const [votingQuestion, setvotingQuestion] = useState<string | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, connect, error: walletError } = useWallet();

  useEffect(() => {
    async function fetchVoteResults() {
      if (!isConnected) {
        setLoading(false);
        return;
      }
      
      try {
        const {
          _votingQuestion,
          _proposalsArray,
          _totalVotesBN,
          _error } = await getVoteData();
        setvotingQuestion(_votingQuestion);
        setProposals(_proposalsArray);
        setTotalVotes(_totalVotesBN);
        setError(_error);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching vote results:", err);
        setError("Error fetching vote results.");
        setLoading(false);
      }
    }
    fetchVoteResults();
  }, [isConnected]);

  // Handle wallet errors
  useEffect(() => {
    if (walletError) {
      setError(walletError);
    }
  }, [walletError]);

  if (loading) {
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
          <p>Loading vote results...</p>
        </main>
        <Footer />
      </div>
    );
  }

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
        
        {!isConnected ? (
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
            {error && (
              <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>
            )}
          </div>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <div style={{ width: '100%', maxWidth: '800px' }}>
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
        )}
      </main>
      <Footer />
    </div>
  );
};

export default VoteResults;
