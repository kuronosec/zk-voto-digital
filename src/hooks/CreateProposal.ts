import { ethers } from 'ethers';
import { voteContractBytecode, voteContractABI } from '../constants/voteContract';
import { issuerContractAddress } from '../constants/issuerContract';

export const createProposal = async (question: any, options: any):
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
      const voteScope = Math.floor(Math.random() * 100000);

      if( userId === "0xE100422ABa51537d8636c64ca594bC0813f3a554" ) {
        // Assume you have the contract's ABI and bytecode
        const voteContractFactory = new ethers.ContractFactory(
          voteContractABI,
          voteContractBytecode.bytecode,
          signer);
        
        const voteContract = await voteContractFactory.deploy(
          question,
          options,
          issuerContractAddress,
          voteScope
        );
        await voteContract.deployed();
        console.log("Contract deployed at:", voteContract.address);
        done = true;
      } else {
        error = "Wrong admin address creating the voting contract";
        done = false;
      }
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