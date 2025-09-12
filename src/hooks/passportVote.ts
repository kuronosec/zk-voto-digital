import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { PassportVerificationService, VerificationRequest, VerificationStatusResponse } from '../services/passportService';
import { ZkProof } from '@rarimo/zk-passport';

export interface PassportVoteExecuteParams {
  registrationRoot: string;
  currentDate: number;
  userPayload: any;
  zkPoints: any;
}

export const usePassportVerification = () => {
  const [verificationLink, setVerificationLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');

  const startVerification = useCallback(async (request: VerificationRequest) => {
    setIsLoading(true);
    setError(null);
    setUserId(request.userId);

    try {
      const response = await PassportVerificationService.requestVerificationLink(request);
      
      if (response.link) {
        setVerificationLink(response.link);
      } else if (response.status === 'created') {
        // Verification was already completed, skip to status check
        setVerificationLink('completed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start verification');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateQRCode = useCallback((link: string) => {
    // Using a simple QR code generation approach
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(link)}`;
    return qrApiUrl;
  }, []);

  const generateDeepLink = useCallback((link: string) => {
    return encodeURIComponent(link);
  }, []);

  const reset = useCallback(() => {
    setVerificationLink(null);
    setError(null);
    setUserId('');
    setIsLoading(false);
  }, []);

  return {
    verificationLink,
    isLoading,
    error,
    userId,
    startVerification,
    generateQRCode,
    generateDeepLink,
    reset
  };
};

export const useVerificationStatus = (userId: string, enabled: boolean = false) => {
  const [status, setStatus] = useState<'pending' | 'verified' | 'failed'>('pending');
  const [proof, setProof] = useState<any>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    if (!userId || !enabled) return;

    try {
      const response: VerificationStatusResponse = await PassportVerificationService.checkVerificationStatus(userId);
      setStatus(response.status);
      if (response.proof) {
        setProof(response.proof);
      }
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check status');
      setStatus('failed');
      return null;
    }
  }, [userId, enabled]);

  const startPolling = useCallback(() => {
    if (!userId || isPolling) return;

    setIsPolling(true);
    setError(null);

    const pollInterval = setInterval(async () => {
      const response = await checkStatus();
      
      if (response && (response.status === 'verified' || response.status === 'failed')) {
        clearInterval(pollInterval);
        setIsPolling(false);
      }
    }, 5000); // Poll every 5 seconds like in the example

    // Stop polling after 5 minutes (timeout)
    const timeoutId = setTimeout(() => {
      clearInterval(pollInterval);
      setIsPolling(false);
      setStatus('failed');
      setError('Verification timeout - please try again');
    }, 300000); // 5 minutes

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeoutId);
      setIsPolling(false);
    };
  }, [userId, checkStatus]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  return {
    status,
    proof,
    isPolling,
    error,
    checkStatus,
    startPolling,
    stopPolling
  };
};

export const usePassportVote = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const executeVote = useCallback(async (
    proof: ZkProof,
    selectedProposalIndex: number
  ): Promise<{ success: boolean; result?: any; error?: string }> => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Check if MetaMask is available
      if (!window.ethereum) {
        throw new Error('MetaMask not detected');
      }

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Get contract addresses from environment or constants
      const zkPassportVoteAddress = process.env.REACT_APP_ZK_PASSPORT_VOTE_CONTRACT_ADDRESS;
      if (!zkPassportVoteAddress) {
        throw new Error('ZK Passport vote contract address not configured');
      }

      // This would need the actual ZKPassportVote contract ABI
      // For now, using a placeholder structure based on the prompt requirements
      const zkPassportVoteABI = [
        "function execute(bytes32 registrationRoot, uint256 currentDate, bytes userPayload, bytes zkPoints) external"
      ];

      const zkPassportVoteContract = new ethers.Contract(
        zkPassportVoteAddress,
        zkPassportVoteABI,
        signer
      );

      // Extract data from proof for contract execution
      // This would need to be adapted based on actual ZkProof structure
      const registrationRoot = proof.pubSignals[11]; // Assuming similar structure to existing code
      const currentDate = Math.floor(Date.now() / 1000);
      
      // Create user payload (this would need to be defined based on contract requirements)
      const userPayload = ethers.utils.defaultAbiCoder.encode(
        ['uint256', 'uint256'],
        [selectedProposalIndex, currentDate]
      );

      // Create zkPoints from proof (this would need to be adapted based on contract requirements)
      const zkPoints = ethers.utils.defaultAbiCoder.encode(
        ['uint256[]', 'uint256[][]', 'uint256[]'],
        [proof.proof.piA, proof.proof.piB, proof.proof.piC]
      );

      // Execute the vote
      const transaction = await zkPassportVoteContract.execute(
        registrationRoot,
        currentDate,
        userPayload,
        zkPoints
      );

      setResult(transaction);
      return { success: true, result: transaction };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute passport vote';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return {
    executeVote,
    isLoading,
    error,
    result,
    reset
  };
};