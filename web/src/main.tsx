import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from 'react-hot-toast';
import { WebSocketProvider } from './context/WebSocketContext.tsx'
import { RecoilRoot } from 'recoil'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RecoilRoot>
      <WebSocketProvider>
        <Toaster />
        <QueryClientProvider client={queryClient} >
          <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl={'/'} >
            <App />
          </ClerkProvider>
        </QueryClientProvider>
      </WebSocketProvider>
    </RecoilRoot>
  </StrictMode >,
)
