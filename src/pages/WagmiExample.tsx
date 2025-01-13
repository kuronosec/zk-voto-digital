 // 1. Import modules
 import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
 import { WagmiProvider } from 'wagmi'
 import { wagmiConfig } from '../config'
 
 // 2. Set up a React Query client.
 const queryClient = new QueryClient()
 
 export const WagmiExample = () => {
   // 3. Wrap app with Wagmi and React Query context.
   return (
     <WagmiProvider config={wagmiConfig}>
       <QueryClientProvider client={queryClient}> 
         {/** ... */} 
       </QueryClientProvider> 
     </WagmiProvider>
   )
 }