import React from 'react';
import { useState } from "react";
import { displayMethod } from '../constants/displayConfig';
import { Button } from "rimble-ui";
import { castVote } from '../hooks/castVote';
import { useVote } from "../pages/VoteContext";

type Proposal = {
  description: string;
  voteCount: number;
};

interface VoteOptionsDisplayProps {
  voteData: {
    votingQuestion: string;
    proposals: Proposal[];
  };
}

export const VoteOptionsDisplay: React.FC<VoteOptionsDisplayProps> = ({ voteData }) => {
  const { verifiableCredential, voteScope } = useVote();
  const [selectedProposalIndex, setSelectedProposalIndex] = useState<number | null>(null);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Handle selection (exclusive choice)
  const handleCheckboxChange = (index: number) => {
    setSelectedProposalIndex(index);
  };

  const certificateStyle: React.CSSProperties = {
    backgroundColor: displayMethod.backgroundColor,
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'left',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  };

  const descriptionStyle: React.CSSProperties = {
    color: displayMethod.descriptionTextColor,
    fontSize: '14px',
    marginBottom: '10px'
  };

  const issuerStyle: React.CSSProperties = {
    color: displayMethod.issuerTextColor,
    fontSize: '16px',
    fontStyle: 'italic',
    marginBottom: '10px'
  };

  // Cast the vote
  const doCastVote = async () => {
    if (selectedProposalIndex === null) {
      alert("Please select a proposal before voting!");
      return;
    }
    try {
      const { _result, _error, _done } = await castVote(verifiableCredential, selectedProposalIndex);
      console.log(_result);
      setDone(_done);
      setError(_error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div>
      {voteData && voteData.votingQuestion && voteData.proposals ? (
        <div>
          <h2>{voteData.votingQuestion}</h2>
          <form style={issuerStyle}>
            {voteData.proposals.map((proposal, index) => (
              <label key={proposal.description} style={{ display: "block", margin: "8px 0" }}>
                <input
                  type="radio"
                  name="proposal"
                  value={index}
                  checked={selectedProposalIndex === index}
                  onChange={() => handleCheckboxChange(index)}
                />
                {proposal.description}
              </label>
            ))}
          </form>

          <div className="button-wrapper">
            <Button.Outline onClick={doCastVote} disabled={selectedProposalIndex === null}>Send Vote</Button.Outline>
          </div>
        </div>
      ) : (
        <p>voteData</p>
      )}
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : done ? (
        <p style={{ color: 'red' }}>Vote was send succesfully!</p>
      ) : (
        <p></p>
      )}
    </div>
  );
};