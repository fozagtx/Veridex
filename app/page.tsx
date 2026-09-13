import Link from "next/link";
import { ConnectWalletButton } from "@/components/ConnectWallet";
import { HeroWaves } from "@/components/HeroWaves";
import { GridIcon, RelayIcon, ShieldIcon } from "@/components/Icons";
import { HeroSteps, ProtocolGrid } from "@/components/LandingSections";
import { Shell } from "@/components/Shell";

const faqs = [
  [
    "What is my place in line?",
    "Who gets their money back first. If you confirmed first, you get paid first. If you confirmed later, you wait.",
  ],
  [
    "What stops an MEV bot from taking my place?",
    "Once your pay-in confirms, your place is locked. A later send, even with a higher fee, can only stand behind you.",
  ],
  [
    "Why do I pay the loan back?",
    "Money does not come back by itself. Pay the loan back fills the pot. You pretend to be the borrower. No pot, nobody gets paid.",
  ],
  [
    "Which chain is this?",
    "Creditcoin CC3. You send CTC. The line and the payout live there.",
  ],
  [
    "Do I need to pay in to see my place?",
    "Yes. After your pay-in confirms, the dashboard shows if you are first or waiting.",
  ],
];

const problemCards = [
  {
    icon: <GridIcon />,
    title: "Pending is public",
    copy: "Your send sits in a public waiting list before it confirms. An MEV bot can see it.",
  },
  {
    icon: <RelayIcon />,
    title: "MEV bot pays more fee",
    copy: "The MEV bot pays a higher fee, confirms first, and sits at the front of the same loan.",
  },
  {
    icon: <ShieldIcon />,
    title: "MEV bot is paid first",
    copy: "When the borrower pays back, first in line is paid first. If the MEV bot confirmed first, the MEV bot is paid first.",
  },
];

const pillPrimary =
  "rounded-full bg-brand px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-brandDark";
const pillSecondary =
  "inline-flex items-center rounded-full border border-border bg-background/60 px-8 py-4 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:border-foreground";

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-mutedForeground">
      {children}
    </p>
  );
}

export default function Home() {
  return (
    <Shell>
      <section className="relative -mt-16 overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <HeroWaves className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/70 to-background/30" />
        </div>
        <div className="page-wrap relative grid min-h-[92vh] items-center gap-12 pb-24 pt-32 sm:pt-36 lg:grid-cols-2 lg:gap-10">
          <div>
            <h1 className="text-5xl font-extrabold leading-[0.98] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              <span className="block">An MEV bot</span>
              <span className="block font-serif font-normal italic text-brand">cannot jump this loan.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-mutedForeground">
              Several wallets can fund the same loan on Creditcoin, and if an
              MEV bot confirms first it gets paid first, so Veridex locks the
              line.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <ConnectWalletButton className={pillPrimary} />
              <Link href="/dashboard" className={pillSecondary}>
                Open the line
              </Link>
            </div>
          </div>
          <HeroSteps />
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="page-wrap">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow>The problem</Eyebrow>
              <h2 className="mt-4 text-4xl font-extrabold leading-[1.02] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Your pending send sits{" "}
                <span className="font-serif font-normal italic text-brand">in the open.</span>
              </h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-mutedForeground">
                Several wallets fund the same loan, and the pending send is
                public, so an MEV bot can pay a higher fee and confirm first,
                and when the borrower pays the loan back the MEV bot is paid
                first, which means you wait or you lose.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8">
              <Eyebrow>The line</Eyebrow>
              <p className="mt-5 font-serif text-7xl italic leading-none text-brand">#1 gets paid</p>
              <p className="mt-5 text-sm leading-6 text-mutedForeground">
                The line is the order in which pay-ins confirm, and the wallet
                at the front of that line is the first one paid when the
                borrower pays the loan back.
              </p>
              <div className="mt-7 grid grid-cols-4 gap-2">
                {["1", "2", "3", "4"].map((position) => {
                  const you = position === "1";
                  return (
                    <div
                      key={position}
                      className={`rounded-[10px] border p-3 text-center ${
                        you ? "border-brand bg-background" : "border-border bg-background"
                      }`}
                    >
                      <p className={`font-mono text-xl ${you ? "text-brand" : "text-foreground"}`}>
                        #{position}
                      </p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.5px] text-mutedForeground">
                        {you ? "You" : "Waits"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {problemCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-border bg-card p-8">
                <div className="grid h-11 w-11 place-items-center rounded-[10px] bg-muted text-foreground">
                  {card.icon}
                </div>
                <h3 className="mt-6 text-lg font-bold text-foreground">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-mutedForeground">{card.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="scroll-mt-20 border-t border-border py-24 sm:py-32">
        <div className="page-wrap grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow>How the line works</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold leading-[1.02] tracking-tight text-foreground sm:text-5xl">
              First in,{" "}
              <span className="font-serif font-normal italic text-brand">first paid back.</span>
            </h2>
            <div className="mt-6 space-y-4 text-base leading-7 text-mutedForeground">
              <p>
                Several wallets fund the same on-chain loan. They line up to
                get paid back. Whoever confirmed first gets paid first.
                Whoever confirmed later waits.
              </p>
              <p>
                Veridex locks that order on Creditcoin. After your pay-in
                confirms, an MEV bot cannot step in front of you.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="mt-7 inline-block text-sm font-semibold text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-brand"
            >
              Open the line
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8">
            <Eyebrow>Repayment line</Eyebrow>
            <ol className="mt-6 space-y-3">
              <li className="flex items-center gap-4 rounded-[10px] border border-border bg-background px-5 py-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary font-mono text-xs font-bold text-primaryForeground">
                  1
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">First in line</p>
                  <p className="mt-0.5 text-xs text-mutedForeground">Gets money back first</p>
                </div>
                <span className="font-mono text-sm text-mutedForeground">Paid first</span>
              </li>
              <li className="flex items-center gap-4 rounded-[10px] border border-border bg-background px-5 py-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border font-mono text-xs text-mutedForeground">
                  2
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">Next in line</p>
                  <p className="mt-0.5 text-xs text-mutedForeground">Gets money back after #1</p>
                </div>
                <span className="font-mono text-sm text-mutedForeground">Waits</span>
              </li>
            </ol>
            <p className="mt-6 border-t border-border pt-5 text-xs leading-5 text-mutedForeground">
              If the pot is short, the back of the line waits. The front is
              paid first.
            </p>
          </div>
        </div>
      </section>

      <ProtocolGrid />

      <section id="faq" className="scroll-mt-20 border-t border-border py-24 sm:py-32">
        <div className="page-wrap grid items-start gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold leading-[1.02] tracking-tight text-foreground sm:text-5xl">
              Questions,{" "}
              <span className="font-serif font-normal italic text-brand">answered.</span>
            </h2>
          </div>
          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            {faqs.map(([question, answer]) => (
              <details key={question} className="group/details px-7 py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                  {question}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border text-mutedForeground transition-transform duration-200 group-open/details:rotate-45">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-mutedForeground">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-28 sm:py-36">
        <div className="page-wrap text-center">
          <h2 className="mx-auto max-w-3xl text-5xl font-extrabold leading-[1.02] tracking-tight text-foreground sm:text-6xl">
            Pay in. Pay it back.{" "}
            <span className="font-serif font-normal italic text-brand">Get paid.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-mutedForeground">
            Connect, send CTC, and the line shows who gets paid first.
          </p>
          <ConnectWalletButton className={`mt-10 ${pillPrimary}`} />
        </div>
      </section>
    </Shell>
  );
}
