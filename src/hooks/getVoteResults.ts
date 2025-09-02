import { ethers } from 'ethers';
import { voteContractAddress, voteContractABI } from '../constants/voteContract';

interface Proposal {
  description: string;
  voteCount: number;
}

const getUser = async () => {
  const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  if (accounts.length === 0) {
    // Prompt the user to connect MetaMask if no accounts are authorized
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const userId = await signer.getAddress();

  return userId;
};

export const getVoteData = async ():
Promise<{ _votingQuestion: string, _proposalsArray: Proposal[]; _totalVotesBN: number; _error: string | null }> => {
  try {
    const userId = await getUser();
    console.log("VoteResults userId: ", userId);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const voteContract = new ethers.Contract(voteContractAddress, voteContractABI, signer);

    const voteParams = await voteContract.voteParams();

    const votingQuestion = voteParams[0];

    const proposalCountBN = await voteContract.getProposalCount();
    const proposalCount = proposalCountBN.toNumber();

    const proposalsArray: Proposal[] = [];
    for (let i = 0; i < proposalCount; i++) {
      const proposalData = await voteContract.getProposal(i);
      proposalsArray.push({
        description: proposalData[0],
        voteCount: proposalData[1].toNumber()
      });
    }

    const totalVotesBN = (await voteContract.getTotalVotes()).toNumber();

    return {
      _votingQuestion: votingQuestion,
      _proposalsArray: proposalsArray,
      _totalVotesBN: totalVotesBN,
      _error: null
    };

  } catch (err: any) {
    console.error("Error in getVoteData:", err);
    
    if (err.code === 4001) {
      return {
        _votingQuestion: "",
        _proposalsArray: [],
        _totalVotesBN: 0,
        _error: "User rejected the request."
      };
    }

    return {
      _votingQuestion: "",
      _proposalsArray: [],
      _totalVotesBN: 0,
      _error: err.message || "Error fetching vote data"
    };
  }
};