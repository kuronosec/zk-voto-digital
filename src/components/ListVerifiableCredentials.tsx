import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCredentialData } from '../hooks/useCredentialData';
import { CredentialDisplay } from './CredentialDisplay';

interface VCAvailableProps {
  onVCAvailable: (available: boolean) => void;
  onError: (error: string) => void;
}

const ListVerifiableCredentials: React.FC<VCAvailableProps> = ({ onVCAvailable, onError }) => {
  const { t } = useTranslation();
  const { data, error, done } = useCredentialData();
  if (!data) {
    onVCAvailable(false);
  } else {
    onVCAvailable(true);
  }

  if (error) {
    onError(error);
  }

  return (
    <div>
      <h2>{t('vc')}</h2>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : done && data ? (
        <CredentialDisplay data={data} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default ListVerifiableCredentials;