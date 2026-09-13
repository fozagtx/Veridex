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
      ? `This deal is live. You paid in first. ${formatCtc(record.amount)} CTC is in the pot.`
      : `This deal is live. ${shortAddress(record.funder)} paid in first with ${formatCtc(record.amount)} CTC.`
    : "No money in this deal yet. When someone pays in, it looks like this:";

  const queueNote = record
    ? youAreFirst
      ? "You get your money back first."
      : `${shortAddress(record.funder)} gets paid back first. You wait.`
    : "Nobody has paid in yet. After you do, you will see who is first.";

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
