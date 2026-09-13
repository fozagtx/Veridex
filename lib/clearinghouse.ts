import { encodeFunctionData, parseEther } from "viem";
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
