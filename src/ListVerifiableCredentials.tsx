import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import ReactJson from 'react-json-view';
import { useTranslation } from 'react-i18next';
import './i18n';
// import { MetaMaskInpageProvider } from "@metamask/providers";

const contractAddress = '0x282eBa8b3D8E1164C5B70604C9C22011E8Ff6C82';
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

function ListVerifiableCredentials() {
  const { t } = useTranslation();
  const [data, setData] = useState(
    {
      userAddress: "",
      credentialData: {
        credentialId: "",
        context: "",
        type: "",
        issuanceDate: "",
      },
      publicInputs: ""
    }
  );
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
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        // Call the getCredential function
        const credential = await contract.getCredential(
          userId,
          0
        );

        // Display the result
        // Destructure the result
        const credentialData = credential[0];  // INonMerklizedIssuer.CredentialData struct
        const uintArray = credential[1];       // uint256[8] array
        const subjectFields = credential[2];   // INonMerklizedIssuer.SubjectField[] array

        // Format the result as JSON
        const jsonResult = {
          userAddress: userId,
          credentialData: {
            credentialId: credentialData.id.toString(),
            context: credentialData.context[0].toString(),
            type: credentialData._type.toString(),
            issuanceDate: credentialData.issuanceDate.toString(),
          },
          publicInputs: uintArray.map((num) => num.toString())
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
        <pre><ReactJson src={data} theme="monokai" collapsed={false} /></pre>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default ListVerifiableCredentials;
