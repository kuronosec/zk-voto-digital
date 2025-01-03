import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCredentialData } from '../hooks/useCredentialData';
import { CredentialDisplay } from './CredentialDisplay';

function ListVerifiableCredentials() {
  const { t } = useTranslation();
  const { data, error, done } = useCredentialData();

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