"use client";

import React, { ReactNode } from 'react';
import { ToastProvider } from './ToastContext'; 
import { AuthProvider } from './AuthContext'; 

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider> 
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  );
}