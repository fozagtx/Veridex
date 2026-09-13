/**
 * Veridex configuration. Non-secret values live here, not in env files.
 * The only env var still in use is DEPLOYER_PRIVATE_KEY (contracts/.env).
 */
export const veridexConfig = {
  chains: {
    sepolia: {
      chainId: 11155111,
      rpcUrl: "https://rpc.sepolia.org",
    },
    creditcoinTestnet: {
      chainId: 102031,
      rpcUrl: "https://rpc.cc3-testnet.creditcoin.network",
    },
    hardhat: {
      chainId: 31337,
      rpcUrl: "http://127.0.0.1:8545",
    },
  },
  /** Sepolia vault the clearinghouse trusts for source-chain proofs. */
  sourceVault: "0x71C000000000000000000000000000000000089A",
  /** Source chain key registered on Creditcoin for Sepolia proofs. */
  sourceChainKey: 11155111,
  /** Deployed VeridexClearinghouse address on Creditcoin CC3 testnet. */
  clearinghouse: "0x32A69a587488EB9664A7F7E6f6a6a2B33657446A",
  /** Open demo facility. keccak256("veridex-facility-1"). */
  facilityId: "0x5e383dd74f1f6bb14459a7e33f47d687360c708230d816115c06e86619d69d4a",
  /**
   * WalletConnect Cloud project ID for QR and mobile wallet connections.
   * Create a free project at https://cloud.reown.com, paste its ID here,
   * and add http://localhost:3000 to the project's allowed origins.
   */
  walletConnectProjectId: "veridex-local-dev",
} as const;
