import { DashboardRoom } from "@/components/DashboardRoom";
import { Shell } from "@/components/Shell";
import { WalletGate } from "@/components/WalletTerminal";

export default function Dashboard() {
  return (
    <Shell footer={false}>
      <section className="page-wrap flex min-h-[calc(100dvh-4rem)] items-center justify-center py-10">
        <div className="w-full max-w-xl">
          <WalletGate>
            <DashboardRoom />
          </WalletGate>
        </div>
      </section>
    </Shell>
  );
}
