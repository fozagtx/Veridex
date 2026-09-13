import { veridexConfig } from "@/veridex.config";
import { encodeFund, encodeGetPaidBack, encodeRepay, facilityId } from "@/lib/clearinghouse";

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

async function sendToClearinghouse(from: string, data: string, valueWei = BigInt(0)): Promise<string> {
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
        data,
      },
    ],
  });

  return String(hash);
}

export async function sendClearinghouseFund(from: string, valueWei: bigint): Promise<string> {
  return sendToClearinghouse(from, encodeFund(facilityId), valueWei);
}

export async function sendClearinghouseRepay(from: string, valueWei: bigint): Promise<string> {
  return sendToClearinghouse(from, encodeRepay(facilityId), valueWei);
}

export async function sendClearinghousePayout(from: string): Promise<string> {
  return sendToClearinghouse(from, encodeGetPaidBack(facilityId));
}

export function walletErrorMessage(error: unknown): string {
  if (typeof error === "object" && error && "code" in error && Number(error.code) === 4001) {
    return "You rejected the request in MetaMask.";
  }
  if (error instanceof Error) {
    const text = error.message.toLowerCase();
    if (text.includes("insufficient funds") || text.includes("gas")) {
      return "You need Creditcoin testnet CTC for this and for gas.";
    }
    if (text.includes("not your turn")) {
      return "The person in front of you gets paid first.";
    }
    if (text.includes("not paid back enough") || text.includes("has not paid back")) {
      return "The loan has not paid back enough yet.";
    }
    if (text.includes("nothing to collect")) {
      return "You have nothing to collect.";
    }
    if (text.includes("nobody paid in")) {
      return "Nobody has paid in yet.";
    }
    if (text.includes("execution reverted") || text.includes("reverted")) {
      return "The clearinghouse rejected that. Check the line and try the next step.";
    }
    return error.message;
  }
  return "The wallet request failed.";
}

export const creditcoinId = CREDITCOIN_ID;
