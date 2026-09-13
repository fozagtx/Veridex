import { decodeFunctionResult, encodeFunctionData, formatEther, parseEther, zeroAddress } from "viem";
import { veridexConfig } from "@/veridex.config";

export const clearinghouseAbi = [
  {
    type: "function",
    name: "fund",
    stateMutability: "payable",
    inputs: [{ name: "tradeId", type: "bytes32" }],
    outputs: [],
  },
  {
    type: "function",
    name: "seniority",
    stateMutability: "view",
    inputs: [{ name: "tradeId", type: "bytes32" }],
    outputs: [
      { name: "funder", type: "address" },
      { name: "blockHeight", type: "uint256" },
      { name: "txIndex", type: "uint32" },
      { name: "seniorityKey", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
  },
] as const;

export function encodeFund(tradeId: `0x${string}`): `0x${string}` {
  return encodeFunctionData({
    abi: clearinghouseAbi,
    functionName: "fund",
    args: [tradeId],
  });
}

export function depositValue(amount: string): bigint {
  return parseEther(amount);
}

export const facilityId = veridexConfig.facilityId as `0x${string}`;

export type Seniority = {
  funder: `0x${string}`;
  blockHeight: bigint;
  txIndex: number;
  seniorityKey: bigint;
  amount: bigint;
};

async function creditcoinRpc(method: string, params: unknown[]): Promise<unknown> {
  const response = await fetch(veridexConfig.chains.creditcoinTestnet.rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const payload = (await response.json()) as { result?: unknown; error?: { message?: string } };
  if (payload.error?.message) {
    throw new Error(payload.error.message);
  }
  return payload.result;
}

export async function readSeniority(): Promise<Seniority | null> {
  const data = encodeFunctionData({
    abi: clearinghouseAbi,
    functionName: "seniority",
    args: [facilityId],
  });
  const result = await creditcoinRpc("eth_call", [
    { to: veridexConfig.clearinghouse, data },
    "latest",
  ]);
  if (typeof result !== "string" || result === "0x") {
    return null;
  }

  const decoded = decodeFunctionResult({
    abi: clearinghouseAbi,
    functionName: "seniority",
    data: result as `0x${string}`,
  });

  const funder = decoded[0];
  if (!funder || funder.toLowerCase() === zeroAddress) {
    return null;
  }

  return {
    funder,
    blockHeight: decoded[1],
    txIndex: Number(decoded[2]),
    seniorityKey: decoded[3],
    amount: decoded[4],
  };
}

export async function waitForTransaction(hash: string, timeoutMs = 60000): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const receipt = await creditcoinRpc("eth_getTransactionReceipt", [hash]);
    if (receipt && typeof receipt === "object") {
      const status = "status" in receipt ? String(receipt.status) : "";
      if (status === "0x0") {
        throw new Error("The clearinghouse rejected the deposit.");
      }
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error("The deposit is still confirming. Check Blockscout, then refresh.");
}

export function formatCtc(amount: bigint): string {
  const value = Number(formatEther(amount));
  if (!Number.isFinite(value)) {
    return formatEther(amount);
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function explorerTx(hash: string): string {
  return `https://creditcoin-testnet.blockscout.com/tx/${hash}`;
}
