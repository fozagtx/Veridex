import Link from "next/link";
import { ConnectWalletButton } from "@/components/ConnectWallet";
import { HeroWaves } from "@/components/HeroWaves";
import { GridIcon, RelayIcon, ShieldIcon } from "@/components/Icons";
import { HeroSteps, ProtocolGrid } from "@/components/LandingSections";
import { Shell } from "@/components/Shell";

const faqs = [
  [
    "What is my place in line?",
    "Who gets their money back first. If your money went through first, you get paid first. If it went through later, you wait.",
  ],
  [
    "What stops an MEV bot from taking my place?",
    "Once your pay-in has gone through, your place is locked. A later send, even with a higher fee, can only stand behind you.",
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
    "Yes. After your pay-in has gone through, the dashboard shows if you are first or waiting.",
  ],
];

const problemCards = [
  {
    icon: <GridIcon />,
    title: "The mempool is public",
    copy: "Anyone watching Creditcoin can see your pay-in before it lands, including an MEV bot.",
  },
  {
    icon: <RelayIcon />,
    title: "A higher fee wins the race",
    copy: "The bot pays more gas, lands in an earlier slot, and takes the front of the same loan.",
  },
  {
    icon: <ShieldIcon />,
    title: "Payout follows that slot",
    copy: "When the borrower pays CTC back, the front of the line is paid, so the bot takes your money if its payment went through first.",
  },
];

const pillPrimary =
  "rounded-full bg-brand px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-brandDark";
const pillSecondary =
  "inline-flex items-center rounded-full border border-border bg-background/60 px-8 py-4 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:border-foreground";

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
              More than one wallet can put CTC into the same loan. The first
              payment that goes through is the first one paid back. Veridex
              stops an MEV bot from cutting in after your money has gone
              through.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <ConnectWalletButton className={pillPrimary} />
              <Link href="/dashboard" className={pillSecondary}>
                Open the dashboard
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
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                What goes wrong on a shared loan
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-mutedForeground">
                You and other wallets put CTC into one loan. Your pay-in sits
                in the open until it goes through, so an MEV bot can outbid you,
                get in first, and collect first when the borrower pays back.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8">
              <p className="text-sm font-semibold text-foreground">A line after two pay-ins</p>
              <ol className="mt-5 space-y-3 font-mono text-sm">
                <li className="flex items-center justify-between rounded-[10px] border border-brand bg-background px-4 py-3">
                  <span className="text-brand">#1  0xA4f…91B</span>
                  <span className="text-mutedForeground">you</span>
                </li>
                <li className="flex items-center justify-between rounded-[10px] border border-border bg-background px-4 py-3 text-mutedForeground">
                  <span>#2  0x9Ff…7aA</span>
                  <span>later</span>
                </li>
              </ol>
              <p className="mt-5 text-sm leading-6 text-mutedForeground">
                #1 is paid when the borrower puts CTC back in. #2 waits.
              </p>
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
        <div className="page-wrap">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How you run it
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-mutedForeground">
            One wallet can play both sides. Step 2 is the borrower paying the
            loan back. Skip it and nobody gets CTC out.
          </p>
          <ol className="mt-10 grid gap-6 sm:grid-cols-3">
            <li className="border-t border-border pt-4">
              <p className="font-mono text-xs text-mutedForeground">01</p>
              <p className="mt-2 text-lg font-semibold text-foreground">Pay in</p>
              <p className="mt-2 text-sm leading-6 text-mutedForeground">
                Send CTC to the clearinghouse. After it goes through you stand
                in line.
              </p>
            </li>
            <li className="border-t border-border pt-4">
              <p className="font-mono text-xs text-mutedForeground">02</p>
              <p className="mt-2 text-lg font-semibold text-foreground">Pay the loan back</p>
              <p className="mt-2 text-sm leading-6 text-mutedForeground">
                Send the same amount again. You are pretending to be the
                borrower so the pot has money.
              </p>
            </li>
            <li className="border-t border-border pt-4">
              <p className="font-mono text-xs text-mutedForeground">03</p>
              <p className="mt-2 text-lg font-semibold text-foreground">Get my money back</p>
              <p className="mt-2 text-sm leading-6 text-mutedForeground">
                Only the next unpaid wallet can collect, and only that wallet
                gets the CTC.
              </p>
            </li>
          </ol>
          <Link
            href="/dashboard"
            className="mt-10 inline-block text-sm font-semibold text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-brand"
          >
            Open the dashboard
          </Link>
        </div>
      </section>

      <ProtocolGrid />

      <section id="faq" className="scroll-mt-20 border-t border-border py-24 sm:py-32">
        <div className="page-wrap grid items-start gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">FAQ</h2>
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

      <section className="border-t border-border py-20 sm:py-24">
        <div className="page-wrap flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <p className="max-w-lg text-lg font-semibold text-foreground">
            The clearinghouse is on Creditcoin CC3. You need CTC in the wallet.
          </p>
          <ConnectWalletButton className={pillPrimary} />
        </div>
      </section>
    </Shell>
  );
}
