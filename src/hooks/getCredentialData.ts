import { ethers } from 'ethers';
import { issuerContractAddress, issuerContractABI, issuerDID, userIdDID } from '../constants/issuerContract';
import { voteContractAddress, voteContractABI } from '../constants/voteContract';
import { formatTimestamp } from '../utils/formatters';

type BigNumberish = string | bigint;

export const getCredentialData = async ():
  Promise<{ _data: any; _error: string | null }> => {
  var data = {};
  var error = "";

  const fetchData = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        // Prompt the user to connect MetaMask if no accounts are authorized
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userId = await signer.getAddress();
      const issueContract = new ethers.Contract(issuerContractAddress, issuerContractABI, signer);

      // Get list of credentials
      const credentialIds: BigNumberish[] = await issueContract.getUserCredentialIds(
        userId
      );

      if (credentialIds.length === 0) {
        console.log("credentialIds is empty.");
        data = {};
        error = 'No credential yet available for user.';
      } else {
        const formattedIds = credentialIds.map((id) => id.toString());
        const credential = await issueContract.getCredential(userId, formattedIds[0]);

        // Destructure the result to display
        const credentialData = credential[0];  // INonMerklizedIssuer.CredentialData struct
        // const uintArray = credential[1];       // uint256[8] array
        // const subjectFields = credential[2];   // INonMerklizedIssuer.SubjectField[] array

        // Format the result as JSON
        const jsonResult = {
          address: userId,
          type: credentialData._type.toString(),
          issuanceDate: formatTimestamp(credentialData.issuanceDate.toString()),
          IssuerDID: issuerDID,
          RecipientDID: userIdDID,
          context: credentialData.context[0].toString()
        };

        data = jsonResult;
      }
    } catch (err: unknown) {
      if ((err as any).code === 4001) {
        console.error("User rejected the request.");
        error = "User rejected the request.";
      } else {
        console.error("Error:", err);
        error = "Wallet no yet available."
      }
    };
  }

  fetchData();

  return new Promise((resolve) => {
    setTimeout(() => {
        resolve({ _data: data, _error: error});
    }, 2000);
  });
}

export const getVoteScope = async ():
  Promise<{ _voteScope: number; _error: string | null }> => {
  var error = "";
  var voteScope:number | null = 0;

  const fetchData = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        // Prompt the user to connect MetaMask if no accounts are authorized
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const voteContract = new ethers.Contract(voteContractAddress, voteContractABI, signer);

      // Get information about voting process
      const voteParams = await voteContract.voteParams();
      voteScope = voteParams[7];
      if (voteScope === null || voteScope === 0) {
        console.log("voteScope is empty.");
        error = 'No election yet available for user.';
      }
    } catch (err: unknown) {
      if ((err as any).code === 4001) {
        console.error("User rejected the request.");
        error = "User rejected the request.";
      } else {
        console.error("Error:", err);
        error = "Wallet no yet available."
      }
    };
  }

  fetchData();

  return new Promise((resolve) => {
    setTimeout(() => {
        resolve({ _voteScope: voteScope || 0, _error: error});
    }, 2000);
  });
}