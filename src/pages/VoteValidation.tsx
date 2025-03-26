import '../i18n';
import { Header } from "../components/Header";
import { getCredentialData } from '../hooks/getCredentialData';
import { VoteOptionsDisplay } from '../components/VoteOptionsDisplay';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';


const VoteValidation: React.FC = () => {
  const { t } = useTranslation()
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const navigate = useNavigate();
  const fetchData = async () => {
    try {
      const { _data, _error } = await getCredentialData();
      if ( _error === "No credential yet available for user.") {
        setDone(false);
        setData(null);
      } else if ( _error === "Wallet no yet available." ) {
        setDone(false);
        setData(null);
      } else {
        setDone(true);
        setData(_data);
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
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && error === "No credential yet available for user.") {
        navigate("/request-firma");
    }
  }, [loading, error, navigate]);

  return (
    <div>
      <Header />
      <div>
      <h1>{t('voting.title')}</h1>
      <h2>{t('vc')}</h2>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : !loading && done && Object.keys(data).length > 0 ? (
        <VoteOptionsDisplay voteData={data} />
      ) : (
        <p>{t('validation.login')}</p>
      )}
      </div>
    </div>
  );
}

export default VoteValidation;