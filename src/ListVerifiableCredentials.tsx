import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';
import './i18n';

const issuerContractAddress = '0xAa7e4806f594090b67cb319A864261543B883b87';
// I am still not sure how to calculate the DIDs
const issuerDID = 'did:iden3:polygon:amoy:x6x5sor7zpyGKuMcMvhoBFtHjMG9NaoeCg7xLb9mH';
const userIdDID = 'did:iden3:polygon:amoy:x6x5sor7zpyX7xMmkJUMASKk2karkjVcG4iUiAh4c';

const contractABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_userId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_credentialId",
        "type": "uint256"
      }
    ],
    "name": "getCredential",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string[]",
            "name": "context",
            "type": "string[]"
          },
          {
            "internalType": "string",
            "name": "_type",
            "type": "string"
          },
          {
            "internalType": "uint64",
            "name": "issuanceDate",
            "type": "uint64"
          },
          {
            "components": [
              {
                "internalType": "string",
                "name": "id",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "_type",
                "type": "string"
              }
            ],
            "internalType": "struct INonMerklizedIssuer.CredentialSchema",
            "name": "credentialSchema",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "string",
                "name": "id",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "_type",
                "type": "string"
              }
            ],
            "internalType": "struct INonMerklizedIssuer.DisplayMethod",
            "name": "displayMethod",
            "type": "tuple"
          }
        ],
        "internalType": "struct INonMerklizedIssuer.CredentialData",
        "name": "",
        "type": "tuple"
      },
      {
        "internalType": "uint256[8]",
        "name": "",
        "type": "uint256[8]"
      },
      {
        "components": [
          {
            "internalType": "string",
            "name": "key",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "rawValue",
            "type": "bytes"
          }
        ],
        "internalType": "struct INonMerklizedIssuer.SubjectField[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_userId",
        "type": "uint256"
      }
    ],
    "name": "getUserCredentialIds",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const displayMethod = {
  "title": "ZK Firma Digital",
  "description": "Proof of Identity through Firma Digital",
  "issuerName": "ZK Firma Digital",
  "titleTextColor": "#c55509",
  "descriptionTextColor": "#ee7108",
  "issuerTextColor": "#06750c",
  "backgroundColor": "#ffffff",
  "logo": {
    "uri": "https://raw.githubusercontent.com/kuronosec/zk-firma-digital/main/assets/logo.png",
    "alt": "ZK Firma Digital Logo"
  }
};

function formatTimestamp(timestamp: string): string {
  // Convert the timestamp string to a number and then to milliseconds
  const date = new Date(parseInt(timestamp, 10) * 1000);

  // Format the date to a readable format, e.g., "YYYY-MM-DD HH:mm:ss"
  return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
  });
}

function ListVerifiableCredentials() {
  const { t } = useTranslation();
  const [data, setData] = useState(
    {
      title: "",
      description: "",
      issuerName: "",
      address: "",
      type: "",
      issuanceDate: "",
      IssuerDID: "",
      RecipientDID: "",
      context: ""
    }
  );

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

  const titleStyle: React.CSSProperties = {
    color: displayMethod.titleTextColor,
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '10px'
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

  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Define an async function to connect to the contract and fetch data
    const fetchData = async () => {
      try {
        // Request access to the user's Ethereum account (e.g., MetaMask)
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Create a provider and signer
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const userId = await signer.getAddress();

        // Connect to the contract
        const contract = new ethers.Contract(issuerContractAddress, contractABI, signer);

        // Call the getCredential function
        const credential = await contract.getCredential(
          userId,
          0
        );

        console.log(credential);

        // Display the result
        // Destructure the result
        const credentialData = credential[0];  // INonMerklizedIssuer.CredentialData struct
        const uintArray = credential[1];       // uint256[8] array
        const subjectFields = credential[2];   // INonMerklizedIssuer.SubjectField[] array

        // Format the result as JSON
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

        // Set the formatted JSON data to the state
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

  return (
    <div>
      <h2>{t('vc')}</h2>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : done && data ? (
        <div style={certificateStyle}>
          <img src={displayMethod.logo.uri} alt={displayMethod.logo.alt} style={{ width: '150px', borderRadius: '50%', marginBottom: '10px' }} />
          <div style={issuerStyle}>{displayMethod.description}</div>
          <div >Issuer:</div>
          <div style={issuerStyle}>{displayMethod.issuerName}</div>
          <div >User Address:</div>
          <div style={descriptionStyle}>{data.address}</div>
          <div >Type:</div>
          <div style={descriptionStyle}>{data.type}</div>
          <div >Issuance Date:</div>
          <div style={descriptionStyle}>{data.issuanceDate}</div>
          <div >Issuer DID:</div>
          <div style={descriptionStyle}>{data.IssuerDID}</div>
          <div >Recipient DID:</div>
          <div style={descriptionStyle}>{data.RecipientDID}</div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default ListVerifiableCredentials;
