"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { useState, type ReactNode } from "react";
import { createConfig, http, WagmiProvider } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";
import { veridexConfig } from "@/veridex.config";

const config = createConfig(
  getDefaultConfig({
    appName: "Veridex",
    appDescription: "Veridex proves who paid in first, so bots and relayers cannot jump ahead in the repayment line.",
    appUrl: "http://localhost:3000",
    walletConnectProjectId: veridexConfig.walletConnectProjectId,
    enableAaveAccount: false,
    chains: [sepolia, hardhat],
    transports: {
      [sepolia.id]: http(veridexConfig.chains.sepolia.rpcUrl),
      [hardhat.id]: http(veridexConfig.chains.hardhat.rpcUrl),
    },
  }),
);

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
