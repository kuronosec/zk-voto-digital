import { ethers } from 'ethers';
import { issuerContractAddress, contractABI } from '../constants/contract';

type BigNumberish = string | bigint;

export function getCredentialData() {
  var data = null;
  var error = "";
  var done = false;

  const fetchData = async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userId = '0x179E0B398A2FE8b600dfF23dA141956Be52Dc98D';// await signer.getAddress();
      const contract = new ethers.Contract(issuerContractAddress, contractABI, signer);

      // Get list of credentials
      const credentialIds: BigNumberish[] = await contract.getUserCredentialIds(
        userId
      );
      if (credentialIds.length === 0) {
        console.log("credentialIds is empty.");
        // setError("No credential yet available for user.");
      } else {
        console.log("credentialIds:", credentialIds);
        const formattedIds = credentialIds.map((id) => id.toString());
        console.log("User Credential IDs:", formattedIds);
        const credential = await contract.getCredential(userId, formattedIds[0]);
        data = credential[0];
        done = true;
      }
    } catch (err) {
      console.error(err);
    };
  }

  fetchData();

  return { data, error, done };
}