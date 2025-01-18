import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { issuerContractAddress, contractABI, issuerDID, userIdDID } from '../constants/contract';
import { displayMethod } from '../constants/displayConfig';
import { formatTimestamp } from '../utils/formatters';

interface CredentialData {
  title: string;
  description: string;
  issuerName: string;
  address: string;
  type: string;
  issuanceDate: string;
  IssuerDID: string;
  RecipientDID: string;
  context: string;
}

export function useCredentialData() {
  const [data, setData] = useState<CredentialData | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const userId = await signer.getAddress();
        const contract = new ethers.Contract(issuerContractAddress, contractABI, signer);

        const credential = await contract.getCredential(userId, 1);
        const credentialData = credential[0];

        const jsonResult = {
          title: displayMethod.title,
          description: displayMethod.description,
          issuerName: displayMethod.issuerName,
          address: userId,
          type: credentialData._type.toString(),
          issuanceDate: formatTimestamp(credentialData.issuanceDate.toString()),
          IssuerDID: issuerDID,
          RecipientDID: userIdDID,
          context: credentialData.context[0].toString()
        };

        setData(jsonResult);
        setDone(true);
      } catch (err) {
        setDone(false);
        console.error(err);
        setError("Failed to fetch data from the contract");
      }
    };

    fetchData();
  }, []);

  return { data, error, done };
}