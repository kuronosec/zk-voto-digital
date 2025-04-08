import React from 'react';
import { useState } from "react";
import { displayMethod } from '../constants/displayConfig';
import { Button } from "rimble-ui";
import { castVote } from '../hooks/castVote';
import { useVote } from "../pages/VoteContext";
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const { verifiableCredential } = useVote();
  const [selectedProposalIndex, setSelectedProposalIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle selection (exclusive choice)
  const handleCheckboxChange = (index: number) => {
    setSelectedProposalIndex(index);
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
    
    setIsSubmitting(true);
    setError(null);
    setIsSuccess(false);
    
    try {
      const { _result, _error, _done } = await castVote(verifiableCredential, selectedProposalIndex);
      console.log("Vote result:", _result);
      
      if (_done) {
        setIsSuccess(true);
        setTimeout(() => {
          const successElement = document.getElementById('success-message');
          if (successElement) {
            successElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        setError(_error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
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

          <div>
            <Button.Outline 
              onClick={doCastVote} 
              disabled={selectedProposalIndex === null || isSubmitting}
              style={{
                opacity: selectedProposalIndex === null || isSubmitting ? 0.6 : 1,
                cursor: selectedProposalIndex === null || isSubmitting ? 'not-allowed' : 'pointer',
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 20px',
                backgroundColor: '#5856D6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              {isSubmitting ? (
                <>
                  <span style={{ 
                    display: 'inline-block',
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    marginRight: '8px',
                    animation: 'spin 1s linear infinite'
                  }}></span>
                  <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                  {t('common.submitting')}
                </>
              ) : (
                t('common.sendVote')
              )}
            </Button.Outline>
          </div>
          
          {error && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: '#fff5f5',
              color: '#e53e3e',
              border: '1px solid #fed7d7',
              borderRadius: '6px',
              fontSize: '0.95rem'
            }}>
              <p style={{ margin: '0' }}>{error}</p>
            </div>
          )}
          
          {isSuccess && (
            <div id="success-message" style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: '#f0fff4',
              color: '#38a169',
              border: '1px solid #c6f6d5',
              borderRadius: '6px',
              textAlign: 'center',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px'
              }}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ marginRight: '8px' }}
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>{t('common.voteSuccessfullySent')}</span>
              </div>
              <p style={{ margin: '0', fontSize: '0.9rem', fontWeight: 'normal' }}>
                {t('common.thankYouForParticipating')}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p style={{
          backgroundColor: "#f8fafc",
          padding: "15px",
          borderRadius: "8px",
          color: "#4a5568",
          border: "1px solid #e2e8f0"
        }}>
          {t('common.loadingVotingData')}
        </p>
      )}
    </div>
  );
};