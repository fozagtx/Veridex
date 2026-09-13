import { decodeFunctionResult, encodeFunctionData, formatEther, parseEther } from "viem";
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
    name: "repay",
    stateMutability: "payable",
    inputs: [{ name: "tradeId", type: "bytes32" }],
    outputs: [],
  },
  {
    type: "function",
    name: "getPaidBack",
    stateMutability: "nonpayable",
    inputs: [{ name: "tradeId", type: "bytes32" }],
    outputs: [],
  },
  {
    type: "function",
    name: "lineSize",
    stateMutability: "view",
    inputs: [{ name: "tradeId", type: "bytes32" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "lineAt",
    stateMutability: "view",
    inputs: [
      { name: "tradeId", type: "bytes32" },
      { name: "i", type: "uint256" },
    ],
    outputs: [
      { name: "funder", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "blockHeight", type: "uint256" },
      { name: "index", type: "uint32" },
      { name: "paidBack", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "repaid",
    stateMutability: "view",
    inputs: [{ name: "tradeId", type: "bytes32" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "paidOut",
    stateMutability: "view",
    inputs: [{ name: "tradeId", type: "bytes32" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "unpaidTotal",
    stateMutability: "view",
    inputs: [{ name: "tradeId", type: "bytes32" }],
    outputs: [{ name: "total", type: "uint256" }],
  },
] as const;

export const facilityId = veridexConfig.facilityId as `0x${string}`;

export type LinePlace = {
  funder: `0x${string}`;
  amount: bigint;
  blockHeight: bigint;
  index: number;
  paidBack: boolean;
};

export type LoanState = {
  places: LinePlace[];
  repaid: bigint;
  paidOut: bigint;
  unpaid: bigint;
};

export function depositValue(amount: string): bigint {
  return parseEther(amount);
}

export function encodeFund(tradeId: `0x${string}`): `0x${string}` {
  return encodeFunctionData({ abi: clearinghouseAbi, functionName: "fund", args: [tradeId] });
}

export function encodeRepay(tradeId: `0x${string}`): `0x${string}` {
  return encodeFunctionData({ abi: clearinghouseAbi, functionName: "repay", args: [tradeId] });
}

export function encodeGetPaidBack(tradeId: `0x${string}`): `0x${string}` {
  return encodeFunctionData({ abi: clearinghouseAbi, functionName: "getPaidBack", args: [tradeId] });
}

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

async function call(functionName: "lineSize" | "repaid" | "paidOut" | "unpaidTotal", args: readonly unknown[]) {
  const data = encodeFunctionData({
    abi: clearinghouseAbi,
    functionName,
    args: args as never,
  });
  const result = await creditcoinRpc("eth_call", [
    { to: veridexConfig.clearinghouse, data },
    "latest",
  ]);
  if (typeof result !== "string" || result === "0x") {
    return null;
  }
  return decodeFunctionResult({
    abi: clearinghouseAbi,
    functionName,
    data: result as `0x${string}`,
  });
}

export async function readLoan(): Promise<LoanState> {
  const sizeRaw = await call("lineSize", [facilityId]);
  const size = sizeRaw ? Number(sizeRaw) : 0;
  const places: LinePlace[] = [];

  for (let i = 0; i < size; i += 1) {
    const data = encodeFunctionData({
      abi: clearinghouseAbi,
      functionName: "lineAt",
      args: [facilityId, BigInt(i)],
    });
    const result = await creditcoinRpc("eth_call", [
      { to: veridexConfig.clearinghouse, data },
      "latest",
    ]);
    if (typeof result !== "string" || result === "0x") {
      continue;
    }
    const decoded = decodeFunctionResult({
      abi: clearinghouseAbi,
      functionName: "lineAt",
      data: result as `0x${string}`,
    });
    places.push({
      funder: decoded[0],
      amount: decoded[1],
      blockHeight: decoded[2],
      index: Number(decoded[3]),
      paidBack: Boolean(decoded[4]),
    });
  }

  const repaidRaw = await call("repaid", [facilityId]);
  const paidOutRaw = await call("paidOut", [facilityId]);
  const unpaidRaw = await call("unpaidTotal", [facilityId]);

  return {
    places,
    repaid: repaidRaw ? BigInt(repaidRaw.toString()) : BigInt(0),
    paidOut: paidOutRaw ? BigInt(paidOutRaw.toString()) : BigInt(0),
    unpaid: unpaidRaw ? BigInt(unpaidRaw.toString()) : BigInt(0),
  };
}

export async function waitForTransaction(hash: string, timeoutMs = 60000): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const receipt = await creditcoinRpc("eth_getTransactionReceipt", [hash]);
    if (receipt && typeof receipt === "object") {
      const status = "status" in receipt ? String(receipt.status) : "";
      if (status === "0x0") {
        throw new Error("The clearinghouse rejected that transaction.");
      }
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error("Still confirming. Check Blockscout, then refresh.");
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

export function stillOwed(loan: LoanState): bigint {
  if (loan.unpaid > loan.repaid - loan.paidOut) {
    return loan.unpaid - (loan.repaid - loan.paidOut);
  }
  return BigInt(0);
}
