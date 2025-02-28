import { ethers } from 'ethers';
import { voteContractAddress, voteContractABI } from '../constants/voteContract';
import { Groth16Proof } from 'snarkjs'

type BigNumberish = string | bigint

export type PackedGroth16Proof = [
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish
]

/**
 * Packs a proof into a format compatible with ZKFirmaDigital.sol contract.
 * @param originalProof The proof generated with SnarkJS.
 * @returns The proof compatible with Semaphore.
 */
function packGroth16Proof(
  groth16Proof: Groth16Proof
): PackedGroth16Proof {
  return [
    groth16Proof.pi_a[0],
    groth16Proof.pi_a[1],
    groth16Proof.pi_b[0][1],
    groth16Proof.pi_b[0][0],
    groth16Proof.pi_b[1][1],
    groth16Proof.pi_b[1][0],
    groth16Proof.pi_c[0],
    groth16Proof.pi_c[1],
  ]
}

export const getVoteData = async ():
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
      const contract = new ethers.Contract(voteContractAddress, voteContractABI, signer);

      type Proposal = {
        description: string;
        voteCount: number;
      };
      
      // Initialize the array
      let proposals: Proposal[] = [];

      // Get information about voting process
      const votingQuestion:String = await contract.votingQuestion();
      const length = await contract.getProposalCount(); // Get the total number of proposals
      
      for (let i = 0; i < length; i++) {
        proposals.push(await contract.proposals(i)); // Fetch each proposal by index
      }
      if (length === 0) {
        console.log("proposals is empty.");
        data = {};
        error = 'No proposals yet available for user.';
      } else {
        // Format the result as JSON
        const jsonResult = {
          votingQuestion: votingQuestion,
          proposals: proposals
        };

        data = jsonResult;
      }
    } catch (err) {
      if (err.code === 4001) {
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
        resolve({ _data: data, _error: error });
    }, 2000);
  });
}

export const castVote = async (verifiableCredential: any, selectedProposalIndex: number):
  Promise<{ _result: any; _error: string | null; _done: boolean }> => {
  var result = "";
  var error = "";
  var done = false;

  const pushData = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        // Prompt the user to connect MetaMask if no accounts are authorized
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userId = await signer.getAddress();
      const voteContract = new ethers.Contract(voteContractAddress, voteContractABI, signer);
      // The order of the public data in the credential is the following
      // 0 - PublicKeyHash (Goverment public key hash)
      // 1 - Nullifier
      // 2 - Reveal Age above 18
      // 3 - NullifierSeed
      // 4 - SignalHash
      // const nullifierSeed = voteContract.voteScope();
      const nullifierSeed = verifiableCredential.proof.signatureValue.public[3];
      const nullifier = verifiableCredential.proof.signatureValue.public[1];
      // Signal used when generating proof
      const signal = BigInt(userId).toString();
      // For the moment this is assumed always the case that age > 18
      const revealArray = [verifiableCredential.proof.signatureValue.public[2]];
      // Get proof from credential
      const proof = verifiableCredential.proof.signatureValue.proof;
      // Call vote method
      const result_transaction = await voteContract.voteForProposal(
        selectedProposalIndex,
        nullifierSeed,
        nullifier,
        signal,
        revealArray,
        packGroth16Proof(proof)
      );
      result = result_transaction;
      done = true;
    } catch (err) {
      if (err.code === 4001) {
        console.error("User rejected the request.");
        error = "User rejected the request.";
      } else {
        console.error("Error:", err);
        done = false;
        console.error(err);
        error = "Failed to write data to the contract";
      }
    }
  };

  pushData();

  return new Promise((resolve) => {
    setTimeout(() => {
        resolve({ _result: result, _error: error, _done: done });
    }, 2000);
  });
}