export const issuerContractAddress = '0xFDd8844ec46A0ee5CE8FbCD921A630fc138Ac660';
export const issuerDID = 'did:iden3:polygon:amoy:x6x5sor7zpyex2PhwnukXns7PEfmBh4jANnX2P8Jv';
export const userIdDID = 'did:iden3:privado:main:2ShraEMAiEibLUQGSQdsX49X7m6y83m7uJgMRfYyBt';

export const contractABI = [
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
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_userId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "nullifierSeed",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "nullifier",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "signal",
        "type": "uint256"
      },
      {
        "internalType": "uint256[1]",
        "name": "revealArray",
        "type": "uint256[1]"
      },
      {
        "internalType": "uint256[8]",
        "name": "groth16Proof",
        "type": "uint256[8]"
      }
    ],
    "name": "issueCredential",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];