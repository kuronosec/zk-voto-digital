import React, { createContext, useState, ReactNode, useContext, useEffect } from "react";
import { useWallet } from "../context/WalletContext";

type AuthMethod = 'firma-digital' | 'passport' | null;

type VoteContextType = {
  verifiableCredential: Record<string, any> | null;
  setVerifiableCredential: (vc: Record<string, any> | null) => void;
  voteScope: number | null;
  setVoteScope: (index: number | null) => void;
  hasVoted: boolean;
  setHasVoted: (voted: boolean) => void;
  isLoading: boolean;
  authMethod: AuthMethod;
  setAuthMethod: (method: AuthMethod) => void;
  passportProof: any | null;
  setPassportProof: (proof: any | null) => void;
};

const VoteContext = createContext<VoteContextType | undefined>(undefined);

const STORAGE_KEYS = {
  verifiableCredential: "vote.verifiableCredential",
  voteScope: "vote.voteScope",
  authMethod: "vote.authMethod",
} as const;

const readStoredValue = <T,>(key: string, fallback: T): T => {
  try {
    const storedValue = sessionStorage.getItem(key);
    return storedValue !== null ? JSON.parse(storedValue) as T : fallback;
  } catch (error) {
    console.error(`Failed to read session value for ${key}:`, error);
    return fallback;
  }
};

export const VoteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [verifiableCredential, setVerifiableCredential] = useState<Record<string, any> | null>(() =>
    readStoredValue<Record<string, any> | null>(STORAGE_KEYS.verifiableCredential, null)
  );
  const [voteScope, setVoteScope] = useState<number | null>(() =>
    readStoredValue<number | null>(STORAGE_KEYS.voteScope, null)
  );
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authMethod, setAuthMethod] = useState<AuthMethod>(() =>
    readStoredValue<AuthMethod>(STORAGE_KEYS.authMethod, null)
  );
  const [passportProof, setPassportProof] = useState<any | null>(null);
  
  // Integrar con el contexto de wallet
  const { isConnected, account } = useWallet();

  // Efecto para limpiar el estado cuando la wallet se desconecta
  useEffect(() => {
    if (!isConnected || !account) {
      // Si la wallet se desconecta, reiniciamos el estado del contexto de voto
      setVerifiableCredential(null);
      setPassportProof(null);
      setAuthMethod(null);
      setVoteScope(null);
      setHasVoted(false);
      setIsLoading(false);
      sessionStorage.removeItem(STORAGE_KEYS.verifiableCredential);
      sessionStorage.removeItem(STORAGE_KEYS.voteScope);
      sessionStorage.removeItem(STORAGE_KEYS.authMethod);
    }
  }, [isConnected, account]);

  useEffect(() => {
    if (verifiableCredential === null) {
      sessionStorage.removeItem(STORAGE_KEYS.verifiableCredential);
      return;
    }

    sessionStorage.setItem(
      STORAGE_KEYS.verifiableCredential,
      JSON.stringify(verifiableCredential)
    );
  }, [verifiableCredential]);

  useEffect(() => {
    if (voteScope === null) {
      sessionStorage.removeItem(STORAGE_KEYS.voteScope);
      return;
    }

    sessionStorage.setItem(STORAGE_KEYS.voteScope, JSON.stringify(voteScope));
  }, [voteScope]);

  useEffect(() => {
    if (authMethod === null) {
      sessionStorage.removeItem(STORAGE_KEYS.authMethod);
      return;
    }

    sessionStorage.setItem(STORAGE_KEYS.authMethod, JSON.stringify(authMethod));
  }, [authMethod]);

  // Proporciona solo un objeto de valores memoizados
  const value = {
    verifiableCredential,
    setVerifiableCredential,
    voteScope,
    setVoteScope,
    hasVoted,
    setHasVoted,
    isLoading,
    authMethod,
    setAuthMethod,
    passportProof,
    setPassportProof
  };

  return (
    <VoteContext.Provider value={value}>
      {children}
    </VoteContext.Provider>
  );
};

// Custom hook para usar el contexto
export const useVote = () => {
  const context = useContext(VoteContext);
  if (!context) {
    throw new Error("useVote must be used within a VoteProvider");
  }
  return context;
};
