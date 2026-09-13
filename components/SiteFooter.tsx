import Link from "next/link";
import { VeridexLogo } from "@/components/VeridexLogo";

const product = [
  ["About", "/#about"],
  ["FAQ", "/#faq"],
  ["Dashboard", "/dashboard"],
  ["Proof inspector", "/proofs/tx-892a-c4e"],
];

const network = [
  ["Creditcoin CC3", "Settlement"],
  ["Ethereum Sepolia", "Deposits"],
  ["Built-in proof check", "No trusted middleman"],
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="page-wrap py-12 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.9fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 text-foreground">
              <VeridexLogo className="h-8 w-8" />
              <span className="text-base font-bold tracking-tight">Veridex</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-mutedForeground">
              Cross-chain repayment order, proven. Your place in the line comes
              from the confirmed order of deposits, not from whoever relays
              first.
            </p>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mutedForeground">Product</p>
            <ul className="mt-4 grid gap-2.5 text-sm">
              {product.map(([label, href]) => (
                <li key={href}>
                  <Link className="text-foreground hover:text-brand" href={href}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mutedForeground">Network</p>
            <ul className="mt-4 grid gap-2.5 text-sm">
              {network.map(([label, copy]) => (
                <li key={label}>
                  <p className="text-foreground">{label}</p>
                  <p className="text-xs text-mutedForeground">{copy}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mutedForeground">Clearing rules</p>
            <ul className="mt-4 grid gap-2.5 text-sm text-mutedForeground">
              <li>Connect a wallet before facility data appears.</li>
              <li>Your place follows the confirmed order of deposits.</li>
              <li>Bot and middleman reordering is rejected.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="page-wrap flex flex-col gap-2 py-4 text-xs text-mutedForeground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Veridex. Clearing on Creditcoin CC3.</p>
          <p className="font-mono">Sepolia deposits · CC3 settlement</p>
        </div>
      </div>
    </footer>
  );
}
