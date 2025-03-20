import React, { createContext, useContext, useState } from 'react';

interface VoteContextType {
  verifiableCredential: any | null;
  setVerifiableCredential: (credential: any) => void;
  voteScope: string | null;
  setVoteScope: (scope: string | null) => void;
}

const VoteContext = createContext<VoteContextType | null>(null);

export const VoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [verifiableCredential, setVerifiableCredential] = useState<any | null>(null);
  // Inicializar voteScope con un valor aleatorio por defecto
  const [voteScope] = useState<string>(() => {
    return Math.random().toString(36).substring(2, 15);
  });

  const value = {
    verifiableCredential,
    setVerifiableCredential,
    voteScope,
    setVoteScope: () => {} // No permitimos cambiar el voteScope una vez establecido
  };

  return (
    <VoteContext.Provider value={value}>
      {children}
    </VoteContext.Provider>
  );
};

export const useVote = () => {
  const context = useContext(VoteContext);
  if (!context) {
    throw new Error('useVote must be used within a VoteProvider');
  }
  return context;
};
