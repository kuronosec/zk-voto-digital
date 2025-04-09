import React, { createContext, useState, ReactNode, useContext, useEffect } from "react";
import { useWallet } from "../context/WalletContext";

type VoteContextType = {
  verifiableCredential: Record<string, any> | null;
  setVerifiableCredential: (vc: Record<string, any> | null) => void;
  voteScope: number | null;
  setVoteScope: (index: number | null) => void;
  hasVoted: boolean;
  setHasVoted: (voted: boolean) => void;
  isLoading: boolean;
};

const VoteContext = createContext<VoteContextType | undefined>(undefined);

export const VoteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [verifiableCredential, setVerifiableCredential] = useState<Record<string, any> | null>(null);
  const [voteScope, setVoteScope] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Integrar con el contexto de wallet
  const { isConnected, account } = useWallet();

  // Efecto para limpiar el estado cuando la wallet se desconecta
  useEffect(() => {
    if (!isConnected || !account) {
      // Si la wallet se desconecta, reiniciamos el estado del contexto de voto
      setVerifiableCredential(null);
      setHasVoted(false);
      setIsLoading(false);
    }
  }, [isConnected, account]);

  // Proporciona solo un objeto de valores memoizados
  const value = {
    verifiableCredential,
    setVerifiableCredential,
    voteScope,
    setVoteScope,
    hasVoted,
    setHasVoted,
    isLoading
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