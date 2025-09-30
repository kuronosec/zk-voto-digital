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

function toRarimeDeepLink(input: string): string {
  // Normalise empty input
  if (!input) return "rarime://";

  // Try URL API first (works in Node >=10+ and browsers)
  try {
    const u = new URL(input);

    // If the hostname ends with "rarime.com" (handles app.rarime.com, www.rarime.com, etc.)
    if (/\.?rarime\.com$/i.test(u.hostname)) {
      // Grab path + query + hash
      const pathAndQuery = (u.pathname || "") + (u.search || "") + (u.hash || "");
      // Remove any leading slashes so the deep link becomes rarime://external?...
      const cleaned = pathAndQuery.replace(/^\/+/, "");
      return `rarime://${cleaned || ""}`; // rarime:// if no path
    }

    // If it's a URL but not rarime.com, optionally transform by replacing the origin:
    // e.g. https://example.com/foo -> rarime://example.com/foo
    // If you want to *only* transform rarime.com requests, change this block to return input.
    const afterOrigin = (u.pathname || "") + (u.search || "") + (u.hash || "");
    const cleaned = afterOrigin.replace(/^\/+/, "");
    return `rarime://${cleaned || ""}`;
  } catch (e) {
    // Fallback: match the first slash after host and grab everything after host
    const m = input.match(/^https?:\/\/[^\/]+(\/.*)$/i);
    if (m && m[1]) {
      return "rarime://" + m[1].replace(/^\/+/, "");
    }
    // If we can't parse anything, just prefix with rarime://
    return input.startsWith("rarime://") ? input : `rarime://${input}`;
  }
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
        console.log("response.link: ", toRarimeDeepLink(response.link));
        setVerificationLink(toRarimeDeepLink(response.link));
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
    console.log("generateDeepLink decode: ", link);
    console.log("generateDeepLink", encodeURIComponent(link));
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