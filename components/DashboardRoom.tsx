"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { DiagramBlock } from "@/components/DashboardDiagrams";
import { Panel } from "@/components/Shell";
import { WalletTerminal } from "@/components/WalletTerminal";
import { formatCtc, readDeal, stillOwed, type DealState } from "@/lib/clearinghouse";

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function DashboardRoom() {
  const { address } = useAccount();
  const [deal, setDeal] = useState<DealState | null>(null);

  const refresh = useCallback(async () => {
    try {
      setDeal(await readDeal());
    } catch {
      // Keep the last known line if the RPC blips.
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh, address]);

  const places = deal?.places ?? [];
  const owed = deal ? stillOwed(deal) : BigInt(0);
  const first = places[0];
  const youAreFirst = Boolean(
    first && address && first.funder.toLowerCase() === address.toLowerCase(),
  );

  return (
    <Panel className="p-5 sm:p-6">
      <WalletTerminal deal={deal} onChanged={() => void refresh()} />

      <div className="mt-5 border-t border-border pt-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-mutedForeground">
          The line
        </p>
        <p className="mt-2 text-sm leading-6 text-mutedForeground">
          {places.length === 0
            ? "Nobody has paid in yet."
            : owed === BigInt(0)
              ? "The deal has paid back enough. First in line can take their money."
              : `The deal still needs ${formatCtc(owed)} CTC before the front of the line can get paid.`}
        </p>
        <div className="mt-3 space-y-2">
          {places.length === 0 ? (
            <p className="rounded-[8px] border border-border bg-background px-4 py-3 text-sm text-mutedForeground">
              Pay in to stand in line.
            </p>
          ) : (
            places.map((place, index) => {
              const isYou = Boolean(address && place.funder.toLowerCase() === address.toLowerCase());
              return (
                <div
                  key={`${place.funder}-${index}`}
                  className={`flex items-center justify-between rounded-[8px] border px-4 py-3 ${
                    isYou ? "border-brand bg-brand/5" : "border-border bg-background"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      #{index + 1} {isYou ? "· you" : shortAddress(place.funder)}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-mutedForeground">
                      {formatCtc(place.amount)} CTC
                    </p>
                  </div>
                  <span className="font-mono text-[11px] text-mutedForeground">
                    {place.paidBack ? "got paid back" : index === 0 ? "gets paid first" : "waits"}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
        <DiagramBlock
          label="The pot"
          note={
            first
              ? `${formatCtc(places.reduce((sum, place) => sum + place.amount, BigInt(0)))} CTC paid in. ${formatCtc(deal?.repaid ?? BigInt(0))} CTC paid back.`
              : "Empty until someone pays in."
          }
          live={places.length > 0}
        >
          <p className="text-xs text-mutedForeground">
            {youAreFirst ? "You paid in first." : first ? `${shortAddress(first.funder)} paid in first.` : "Waiting."}
          </p>
        </DiagramBlock>
        <DiagramBlock
          label="Who gets money first"
          note={
            first?.paidBack
              ? "The person at the front already got paid."
              : first
                ? "When the deal pays back, #1 is sent CTC first."
                : "No line yet."
          }
          live={Boolean(first && !first.paidBack)}
        >
          <p className="text-xs text-mutedForeground">
            {first ? `#1 takes ${formatCtc(first.amount)} CTC before anyone else.` : "Pay in to open the line."}
          </p>
        </DiagramBlock>
      </div>
    </Panel>
  );
}
