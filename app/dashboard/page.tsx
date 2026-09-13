import { Panel, Shell } from "@/components/Shell";
import { WalletGate, WalletTerminal } from "@/components/WalletTerminal";

const statuses = [
  ["Active facility", "None open for funding yet"],
  ["Repayment queue", "No proven deposits yet"],
];

export default function Dashboard() {
  return (
    <Shell>
      <section className="page-section">
        <div className="page-wrap">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-mutedForeground">Dashboard</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                The clearing room.
              </h1>
              <p className="mt-2 text-sm leading-6 text-mutedForeground">
                Connect first. Facility data, queue rank, and deposit prep stay
                hidden until a wallet is present.
              </p>
            </div>

            <WalletGate>
              <Panel className="p-6 sm:p-8">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-mutedForeground">Wallet</p>
                <h2 className="mt-2 text-xl font-bold text-foreground">Connect before you fund.</h2>
                <p className="mt-2 text-sm leading-6 text-mutedForeground">
                  Preparing a deposit never submits a transaction.
                </p>

                <div className="mt-6">
                  <WalletTerminal />
                </div>

                <div className="mt-6 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
                  {statuses.map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 rounded-[8px] border border-border bg-background px-4 py-3"
                    >
                      <span className="h-2 w-2 shrink-0 rounded-full bg-mutedForeground/50" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{label}</p>
                        <p className="text-xs text-mutedForeground">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </WalletGate>
          </div>
        </div>
      </section>
    </Shell>
  );
}
