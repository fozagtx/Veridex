"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { DiagramBlock, FlowDiagram, QueueDiagram, TrancheDiagram } from "@/components/DashboardDiagrams";
import { Panel } from "@/components/Shell";
import { WalletTerminal } from "@/components/WalletTerminal";
import { formatCtc, readSeniority, type Seniority } from "@/lib/clearinghouse";

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function DashboardRoom() {
  const { address } = useAccount();
  const [record, setRecord] = useState<Seniority | null>(null);

  const refresh = useCallback(async () => {
    try {
      setRecord(await readSeniority());
    } catch {
      // Keep the last known rank if the RPC blips.
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh, address]);

  const youAreFirst = Boolean(
    record && address && record.funder.toLowerCase() === address.toLowerCase(),
  );

  const facilityNote = record
    ? youAreFirst
      ? `Open. You are #1. ${formatCtc(record.amount)} CTC locked at block ${record.blockHeight.toString()}.`
      : `Open. #1 is ${shortAddress(record.funder)} with ${formatCtc(record.amount)} CTC.`
    : "None open for funding yet. When one opens, it works like this:";

  const queueNote = record
    ? youAreFirst
      ? "Your place is locked. You are first in the repayment line."
      : `${shortAddress(record.funder)} is first. A later deposit stays behind them.`
    : "No proven deposits yet. Once you fund, your rank locks in:";

  return (
    <Panel className="p-5 sm:p-6">
      <WalletTerminal onDeposited={() => void refresh()} locked={record} />

      <div className="mt-5 border-t border-border pt-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-mutedForeground">
          Where your deposit goes
        </p>
        <div className="mt-3">
          <FlowDiagram locked={Boolean(record)} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
        <DiagramBlock
          label="Active facility"
          note={facilityNote}
          live={Boolean(record)}
        >
          <TrancheDiagram youAreFirst={youAreFirst} />
        </DiagramBlock>
        <DiagramBlock
          label="Repayment queue"
          note={queueNote}
          live={Boolean(record)}
        >
          <QueueDiagram filled={Boolean(record)} youAreFirst={youAreFirst} />
        </DiagramBlock>
      </div>
    </Panel>
  );
}
