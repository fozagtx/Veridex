"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";
import { useState, type ReactNode } from "react";
import { creditCoin3Testnet, hardhat } from "viem/chains";
import { createConfig, http, WagmiProvider } from "wagmi";
import { injected } from "wagmi/connectors";
import { veridexConfig } from "@/veridex.config";

const config = createConfig({
  chains: [creditCoin3Testnet, hardhat],
  connectors: [injected()],
  ssr: true,
  transports: {
    [creditCoin3Testnet.id]: http(veridexConfig.chains.creditcoinTestnet.rpcUrl),
    [hardhat.id]: http(veridexConfig.chains.hardhat.rpcUrl),
  },
});

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          mode="light"
          theme="soft"
          customTheme={{
            "--ck-accent-color": "#D25611",
            "--ck-accent-text-color": "#FFFFFF",
            "--ck-border-radius": "8px",
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
