import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/AuthProvider';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: { Component: any; pageProps: any }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}