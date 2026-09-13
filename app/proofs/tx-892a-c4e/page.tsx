import Link from "next/link";
import { Panel, Shell } from "@/components/Shell";

const details = [
  ["Chain", "Creditcoin CC3 testnet"],
  ["Token", "CTC"],
  ["Rule", "First confirmed, first paid"],
  ["Clearinghouse", "0x7d6803…0048"],
];

const steps = [
  ["1", "Pay in", "CTC into the pot. You join the line."],
  ["2", "Pay the loan back", "Same amount again. You pretend to be the borrower."],
  ["3", "Get my money back", "First in line is paid. That is you if you confirmed first."],
];

export default function LineGuide() {
  return (
    <Shell>
      <section className="page-section">
        <div className="page-wrap">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-mutedForeground">
            The line
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-[1.06] text-foreground sm:text-5xl">
            Same loan. One line. Confirm order wins.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-mutedForeground">
            Several wallets fund the same on-chain loan. Who confirms first
            gets paid first. A later send cannot cut in.
          </p>

          <div className="mt-8 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <Panel className="p-6">
              <h2 className="text-2xl font-bold text-foreground">What is live</h2>
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
              <a
                className="mt-6 inline-block rounded-[8px] border border-brand bg-card p-4 font-mono text-sm text-brand"
                href="https://creditcoin-testnet.blockscout.com/address/0x7d6803Ab43E41963f871cBffFf3F0995d36E0048"
                rel="noreferrer"
                target="_blank"
              >
                Open the clearinghouse
              </a>
            </Panel>

            <Panel className="p-6">
              <h2 className="text-2xl font-bold text-foreground">Three clicks</h2>
              <p className="mt-3 text-base leading-7 text-mutedForeground">
                Money does not come back by itself. Step 2 is the payout pot.
                You play both sides.
              </p>
              <ol className="mt-6 space-y-3">
                {steps.map(([n, title, copy]) => (
                  <li key={n} className="flex items-start gap-4 rounded-[10px] border border-border bg-background px-5 py-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary font-mono text-xs font-bold text-primaryForeground">
                      {n}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{title}</p>
                      <p className="mt-0.5 text-xs text-mutedForeground">{copy}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Link
                className="mt-6 inline-block text-sm font-semibold text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-brand"
                href="/dashboard"
              >
                Open the line
              </Link>
            </Panel>
          </div>
        </div>
      </section>
    </Shell>
  );
}
