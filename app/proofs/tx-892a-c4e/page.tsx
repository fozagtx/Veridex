import Link from "next/link";
import { Panel, Shell } from "@/components/Shell";

const details = [
  ["Block", "Ethereum Sepolia #6,892,104"],
  ["Deposit position", "3rd in the block"],
  ["Checked by", "Creditcoin's built-in proof checker"],
  ["Status", "Locked in, block is final"],
];

export default function ProofInspector() {
  return (
    <Shell>
      <section className="page-section">
        <div className="page-wrap">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-mutedForeground">
            Proof inspector / Tx 0x892a...c4e
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-[1.06] text-foreground sm:text-5xl">
            One deposit. One locked-in place.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-mutedForeground">
            This example shows how a deposit's position in its block becomes a
            permanent place in the repayment line.
          </p>

          <div className="mt-8 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <Panel className="p-6">
              <h2 className="text-2xl font-bold text-foreground">What was recorded</h2>
              <dl className="mt-5 space-y-4 text-sm">
                {details.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4 border-b border-border pb-3"
                  >
                    <dt className="font-mono text-xs uppercase tracking-[0.5px] text-mutedForeground">
                      {label}
                    </dt>
                    <dd className="text-right font-medium text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 rounded-[8px] border border-brand bg-card p-4 font-mono text-sm text-brand">
                Verified on Creditcoin CC3
              </div>
            </Panel>

            <Panel className="p-6">
              <h2 className="text-2xl font-bold text-foreground">Why it cannot be changed</h2>
              <p className="mt-3 text-base leading-7 text-mutedForeground">
                Every block has a fingerprint built from all of its
                transactions in order. This deposit's position is part of that
                fingerprint. Once the block is final, moving the deposit would
                change the fingerprint, and the whole chain would reject it.
                That is why a place in line cannot be swapped, bribed, or
                reordered.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {["1", "2", "3", "4"].map((position) => {
                  const thisOne = position === "3";
                  return (
                    <div
                      key={position}
                      className={`rounded-[10px] border p-4 text-center ${
                        thisOne ? "border-brand bg-background" : "border-border bg-muted"
                      }`}
                    >
                      <p className={`font-mono text-2xl ${thisOne ? "text-brand" : "text-foreground"}`}>
                        #{position}
                      </p>
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.5px] text-mutedForeground">
                        {thisOne ? "This deposit" : "Taken"}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 rounded-[10px] border border-border bg-background p-4 font-mono text-sm text-mutedForeground">
                Position #3 in block #6,892,104. Final and permanent.
              </div>
              <Link
                className="mt-6 inline-block text-sm font-semibold text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-brand"
                href="/dashboard"
              >
                Back to clearing room
              </Link>
            </Panel>
          </div>
        </div>
      </section>
    </Shell>
  );
}
