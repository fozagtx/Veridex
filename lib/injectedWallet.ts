import { veridexConfig } from "@/veridex.config";
import { encodeFund, facilityId } from "@/lib/clearinghouse";

const CREDITCOIN_ID = veridexConfig.chains.creditcoinTestnet.chainId;
const CREDITCOIN_HEX = `0x${CREDITCOIN_ID.toString(16)}`;

type EthereumProvider = {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
  providers?: EthereumProvider[];
};

function asProvider(value: unknown): EthereumProvider | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  if (!("request" in value) || typeof value.request !== "function") {
    return null;
  }
  return value as EthereumProvider;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function getInjectedProvider(): EthereumProvider | null {
  if (typeof window === "undefined") {
    return null;
  }
  const ethereum = asProvider(window.ethereum);
  if (!ethereum) {
    return null;
  }
  const listed = ethereum.providers?.map(asProvider).filter((item): item is EthereumProvider => item !== null);
  if (listed && listed.length > 0) {
    return listed.find((item) => item.isMetaMask) ?? listed[0];
  }
  return ethereum;
}

export async function getInjectedChainId(): Promise<number | null> {
  const provider = getInjectedProvider();
  if (!provider) {
    return null;
  }
  const hex = await provider.request({ method: "eth_chainId" });
  const parsed = Number.parseInt(String(hex), 16);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function switchToCreditcoin(): Promise<void> {
  const provider = getInjectedProvider();
  if (!provider) {
    throw new Error("Open MetaMask, then try again.");
  }

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CREDITCOIN_HEX }],
    });
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? Number(error.code) : 0;
    if (code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: CREDITCOIN_HEX,
            chainName: "Creditcoin Testnet",
            nativeCurrency: { name: "Creditcoin", symbol: "CTC", decimals: 18 },
            rpcUrls: [veridexConfig.chains.creditcoinTestnet.rpcUrl],
            blockExplorerUrls: ["https://creditcoin-testnet.blockscout.com"],
          },
        ],
      });
      return;
    }
    if (code === 4001) {
      throw new Error("You rejected the Creditcoin switch in MetaMask.");
    }
    throw error instanceof Error ? error : new Error("MetaMask could not switch to Creditcoin.");
  }
}

export async function waitForCreditcoin(timeoutMs = 20000): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const chainId = await getInjectedChainId();
    if (chainId === CREDITCOIN_ID) {
      return;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 300));
  }
  throw new Error("MetaMask is still not on Creditcoin Testnet.");
}

export async function sendClearinghouseFund(from: string, valueWei: bigint): Promise<string> {
  const provider = getInjectedProvider();
  if (!provider) {
    throw new Error("Open MetaMask, then try again.");
  }

  const hash = await provider.request({
    method: "eth_sendTransaction",
    params: [
      {
        from,
        to: veridexConfig.clearinghouse,
        value: `0x${valueWei.toString(16)}`,
        data: encodeFund(facilityId),
      },
    ],
  });

  return String(hash);
}

export function walletErrorMessage(error: unknown): string {
  if (typeof error === "object" && error && "code" in error && Number(error.code) === 4001) {
    return "You rejected the request in MetaMask.";
  }
  if (error instanceof Error) {
    const text = error.message.toLowerCase();
    if (text.includes("insufficient funds") || text.includes("gas")) {
      return "You need Creditcoin testnet CTC for the deposit and gas.";
    }
    if (text.includes("execution reverted") || text.includes("reverted")) {
      return "The clearinghouse rejected the call. Redeploy the contract that includes fund().";
    }
    return error.message;
  }
  return "The wallet request failed.";
}

export const creditcoinId = CREDITCOIN_ID;
