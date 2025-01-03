import React from 'react';
import { Text } from "rimble-ui";
import { useTranslation } from 'react-i18next';
import ListVerifiableCredentials from './ListVerifiableCredentials';

interface ValidationStatusProps {
  isValid: boolean;
  done: any;
}

export const ValidationStatus: React.FC<ValidationStatusProps> = ({ isValid, done }) => {
  const { t } = useTranslation();

  if (!done) return null;

  return (
    <div>
      <Text>
        {isValid ? 
          t('logged-in') : 
          <p style={{ color: "red" }}>{t('wrong-credential')}</p>
        }
      </Text>
      {isValid && <ListVerifiableCredentials />}
    </div>
  );
};