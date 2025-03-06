import '../i18n';
import React, { useEffect, useState } from 'react';
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { getVoteData } from "../hooks/getVoteResults";
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

  useEffect(() => {
    async function fetchVoteResults() {
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
  }, []);

  if (loading) {
    return <div>Loading vote results...</div>;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
    <Header />
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
        Vote Results: {votingQuestion}
      </h1>
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
    <Footer />
  </div>
  );
};

export default VoteResults;
