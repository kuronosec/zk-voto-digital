import '../i18n';
import { Header } from "../components/Header";
import { getVoteData } from '../hooks/castVote';
import { getVoteScope } from '../hooks/getCredentialData';
import { VoteOptionsDisplay } from '../components/VoteOptionsDisplay';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useVote } from "./VoteContext";
import './styles.css';

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
    <div>
      <Header />
      <div className="container">
      <h1 className="card-title">Voting System - Citizen Identity Validation</h1>  
      <h2 className="card-subtitle">{t('vc')}</h2>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : !loading && canVote && voteData ? (
        <VoteOptionsDisplay voteData={voteData} />
      ) : (
        <p>Please login with Metamask...</p>
      )}
      </div>
    </div>
  );
}

export default Vote;