import { ethers } from 'ethers';
import { voteContractAddress, voteContractABI } from '../constants/voteContract';

export const getVoteData = async ():
  Promise<{ _votingQuestion: string, _proposalsArray: any; _totalVotesBN: number; _error: string | null }> => {
  var error = "";
  var votingQuestion = "";
  var proposalsArray: Proposal[] = [];
  var totalVotesBN = 0;

  interface Proposal {
    description: string;
    voteCount: number;
  };

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

      // Get voting question
      votingQuestion = await voteContract.votingQuestion();

      // Get the total number of proposals
      const proposalCountBN = await voteContract.getProposalCount();
      const proposalCount = proposalCountBN.toNumber();

      // Retrieve each proposal
      for (let i = 0; i < proposalCount; i++) {
        const proposalData = await voteContract.getProposal(i);
        proposalsArray.push({
          description: proposalData[0],
          voteCount: proposalData[1].toNumber()
        });
      }

      // Get the total number of votes across all proposals
      totalVotesBN = (await voteContract.getTotalVotes()).toNumber();
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
        resolve({
          _votingQuestion: votingQuestion,
          _proposalsArray: proposalsArray,
          _totalVotesBN: totalVotesBN,
          _error: error});
    }, 2000);
  });
}