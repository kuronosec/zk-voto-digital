import { useState } from "react";
import { useTranslation } from 'react-i18next';
import '../i18n';
import { Button } from "rimble-ui";
// import "./style.css";

import { verifyProof } from '../utils/verifyProof';
import { endpointUrl } from '../constants';
import ListVerifiableCredentials from '../components/ListVerifiableCredentials';
import RequestFirma from "../components/ZkSign/RequestFirma";

export const VoteValidation = () => {
  const { t } = useTranslation();
  const [proof, setProof] = useState(null);
  const [signals, setSignals] = useState(null);
  const [done, setDone] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [isVCAvailable, setIsVCAvailable] = useState(false);
  const [error, setError] = useState("");

  const handleVCFetch = (newProof: any, newSignals: any) => {
    setProof(newProof);
    setSignals(newSignals);
  };

  const handleVCAvailable = (available: boolean) => {
    setIsVCAvailable(available);
  };

  return (
    <div className="card-white-profile" id="example">
      <div className="container">
      <h1 className="card-title">Voting System - Citizen Identity Validation</h1>

      <div className="validation-status">
        <ListVerifiableCredentials onVCAvailable={handleVCAvailable} onError={setError}/>
      </div>
      {!isVCAvailable && <div className="validation-status">
        <RequestFirma onVCFetch={handleVCFetch} onError={setError}/>
      </div>
      }
      {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}