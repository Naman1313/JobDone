"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

type ActionMenuContextType = {
  isShareWorkOpen: boolean;
  setShareWorkOpen: (isOpen: boolean) => void;
  isPostJobOpen: boolean;
  setPostJobOpen: (isOpen: boolean) => void;
  isEmergencyOpen: boolean;
  setEmergencyOpen: (isOpen: boolean) => void;
  isAskAiOpen: boolean;
  setAskAiOpen: (isOpen: boolean) => void;
  
  // A helper to close all modals
  closeAll: () => void;
};

const ActionMenuContext = createContext<ActionMenuContextType | undefined>(undefined);

export function ActionMenuProvider({ children }: { children: ReactNode }) {
  const [isShareWorkOpen, setShareWorkOpen] = useState(false);
  const [isPostJobOpen, setPostJobOpen] = useState(false);
  const [isEmergencyOpen, setEmergencyOpen] = useState(false);
  const [isAskAiOpen, setAskAiOpen] = useState(false);

  const closeAll = () => {
    setShareWorkOpen(false);
    setPostJobOpen(false);
    setEmergencyOpen(false);
    setAskAiOpen(false);
  };

  return (
    <ActionMenuContext.Provider value={{
      isShareWorkOpen, setShareWorkOpen,
      isPostJobOpen, setPostJobOpen,
      isEmergencyOpen, setEmergencyOpen,
      isAskAiOpen, setAskAiOpen,
      closeAll
    }}>
      {children}
    </ActionMenuContext.Provider>
  );
}

export function useActionMenu() {
  const context = useContext(ActionMenuContext);
  if (context === undefined) {
    throw new Error('useActionMenu must be used within an ActionMenuProvider');
  }
  return context;
}
