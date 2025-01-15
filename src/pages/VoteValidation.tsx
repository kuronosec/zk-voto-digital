import { useState } from "react";
import { useTranslation } from 'react-i18next';
import '../i18n';
import { Button } from "rimble-ui";
// import "./style.css";

import { verifyProof } from '../utils/verifyProof';
import { endpointUrl } from '../constants';
import ListVerifiableCredentials from '../components/ListVerifiableCredentials';

export const VoteValidation = () => {
  const { t } = useTranslation();
  const [proof, setProof] = useState(null);
  const [signals, setSignals] = useState(null);
  const [done, setDone] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState("");

  const handleFileUpload = (newProof: any, newSignals: any) => {
    setProof(newProof);
    setSignals(newSignals);
  };

  const runProofs = async () => {
    try {
      const _isValid = await verifyProof(endpointUrl, signals, proof);
      setIsValid(_isValid);
      setDone(proof);
      
      if (_isValid) {
        console.log("Valid credentials");
      } else {
        console.log("Invalid credentials");
        setDone("error");
      }
    } catch (error) {
      setIsValid(false);
      console.log('Error in validation: ' + error);
    }
  };

  return (
    <div className="card-white-profile" id="example">
      <div className="container">
      <h1 className="card-title">Identity Verification</h1>

      <div className="validation-status">
        <ListVerifiableCredentials />
      </div>
      <div className="button-wrapper">
        <Button.Outline onClick={runProofs}>{t("button")}</Button.Outline>
      </div>
      </div>
    </div>
  );
}