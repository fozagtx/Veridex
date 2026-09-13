import Link from "next/link";
import { VeridexLogo } from "@/components/VeridexLogo";

const product = [
  ["About", "/#about"],
  ["FAQ", "/#faq"],
  ["The line", "/dashboard"],
];

const network = [
  ["Creditcoin CC3", "Line and payout"],
  ["CTC", "What you send"],
  ["Clearinghouse", "0x7d6803…0048"],
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
              On-chain lending where several wallets fund the same loan, and
              the one that confirmed first is paid first, so an MEV bot cannot jump
              the line.
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
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mutedForeground">The rules</p>
            <ul className="mt-4 grid gap-2.5 text-sm text-mutedForeground">
              <li>Confirm order is the line.</li>
              <li>Pay the loan back fills the pot.</li>
              <li>A confirmed place cannot be jumped.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="page-wrap flex flex-col gap-2 py-4 text-xs text-mutedForeground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Veridex. Line on Creditcoin CC3.</p>
          <p className="font-mono">CTC · first confirmed · first paid</p>
        </div>
      </div>
    </footer>
  );
}
