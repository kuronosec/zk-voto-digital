import '../i18n';
import React, { useEffect, useState } from 'react';
import { Header } from "../components/Header";
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
      <div style={{ padding: '20px' }}>
      <h1>Vote Results: {votingQuestion}</h1>
      <p><strong>Total Votes:</strong> {totalVotes}</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Proposal</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Votes</th>
          </tr>
        </thead>
        <tbody>
          {proposals.map((proposal, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {proposal.description}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {proposal.voteCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default VoteResults;
