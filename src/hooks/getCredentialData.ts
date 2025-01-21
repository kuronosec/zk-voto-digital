import { ethers } from 'ethers';
import { issuerContractAddress, contractABI, issuerDID, userIdDID } from '../constants/contract';
import { formatTimestamp } from '../utils/formatters';

type BigNumberish = string | bigint;

export const getCredentialData = async ():
  Promise<{ data: any; error: string | null; done: boolean }> => {
  var data = {};
  var error = "";
  var done = false;
  console.log("fetchData started");

  const fetchData = async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userId = await signer.getAddress();
      const contract = new ethers.Contract(issuerContractAddress, contractABI, signer);

      // Get list of credentials
      const credentialIds: BigNumberish[] = await contract.getUserCredentialIds(
        userId
      );
      if (credentialIds.length === 0) {
        console.log("credentialIds is empty.");
        error = 'No credential yet available for user.';
      } else {
        const formattedIds = credentialIds.map((id) => id.toString());
        console.log("User Credential IDs:", formattedIds);
        const credential = await contract.getCredential(userId, formattedIds[0]);

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
        console.log("data:", data);
        done = true;
      }
    } catch (err) {
      console.error(err);
    };
  }

  fetchData();

  return new Promise((resolve) => {
    setTimeout(() => {
        resolve({ data: data, error: error, done: done });
    }, 2000);
  });
}