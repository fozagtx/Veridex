import { DiagramBlock, FlowDiagram, QueueDiagram, TrancheDiagram } from "@/components/DashboardDiagrams";
import { Panel, Shell } from "@/components/Shell";
import { WalletGate, WalletTerminal } from "@/components/WalletTerminal";

export default function Dashboard() {
  return (
    <Shell footer={false}>
      <section className="page-wrap flex min-h-[calc(100dvh-4rem)] items-center justify-center py-10">
        <div className="w-full max-w-xl">
          <WalletGate>
            <Panel className="p-5 sm:p-6">
              <WalletTerminal />

              <div className="mt-5 border-t border-border pt-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-mutedForeground">
                  Where your deposit goes
                </p>
                <div className="mt-3">
                  <FlowDiagram />
                </div>
              </div>

              <div className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
                <DiagramBlock label="Active facility" note="None open for funding yet. When one opens, it works like this:">
                  <TrancheDiagram />
                </DiagramBlock>
                <DiagramBlock label="Repayment queue" note="No proven deposits yet. Once you fund, your rank locks in:">
                  <QueueDiagram />
                </DiagramBlock>
              </div>
            </Panel>
          </WalletGate>
        </div>
      </section>
    </Shell>
  );
}
