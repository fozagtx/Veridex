import Link from "next/link";
import { ConnectWalletButton } from "@/components/ConnectWallet";
import { HeroWaves } from "@/components/HeroWaves";
import { GridIcon, RelayIcon, ShieldIcon } from "@/components/Icons";
import { HeroSteps, ProtocolGrid } from "@/components/LandingSections";
import { Shell } from "@/components/Shell";

const faqs = [
  [
    "What is seniority?",
    "Your place in the repayment line. Senior lenders are repaid first and earn less. Junior lenders are repaid last, absorb losses first, and earn more. Veridex proves that place before you commit.",
  ],
  [
    "What does Veridex actually prove?",
    "The order in which deposits were confirmed. Once a block is final, that order is locked into the block's math, so no one can rewrite it.",
  ],
  [
    "Which chains are supported?",
    "Deposits run on Ethereum Sepolia today. Veridex settles and checks proofs on Creditcoin CC3.",
  ],
  [
    "Do I need to deposit to see my rank?",
    "No. Connect a wallet and your queue position is visible before any capital moves. Preparing a deposit never submits a transaction.",
  ],
  [
    "What stops a bot from taking my place?",
    "Your place comes from the order the block finalized, not from who relays fastest. A copied or reordered deposit lands in a different slot, so it can never take yours.",
  ],
  [
    "What does preparing a deposit do?",
    "It checks the amount, the network, and the vault before anything happens. Nothing is signed or sent until you confirm it in your wallet.",
  ],
];

const problemCards = [
  {
    icon: <GridIcon />,
    title: "Pending is public",
    copy: "Every deposit waiting to confirm is visible to bots before it lands.",
  },
  {
    icon: <RelayIcon />,
    title: "Middleman discretion",
    copy: "Deposits moving between chains pass through middlemen who can reorder them.",
  },
  {
    icon: <ShieldIcon />,
    title: "Lost priority",
    copy: "The wallet that paid in first can end up last in line.",
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
      {/* Hero — full-bleed waves under the floating header */}
      <section className="relative -mt-16 overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <HeroWaves className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/70 to-background/30" />
        </div>
        <div className="page-wrap relative grid min-h-[92vh] items-center gap-12 pb-24 pt-32 sm:pt-36 lg:grid-cols-2 lg:gap-10">
          <div>
            <h1 className="text-5xl font-extrabold leading-[0.98] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              <span className="block">Stop bots from</span>
              <span className="block">jumping ahead in</span>
              <span className="block font-serif font-normal italic text-brand">the repayment line.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-mutedForeground">
              When several lenders fund the same deal, automated bots try to
              jump ahead in the repayment line. Veridex proves who paid in
              first and locks that order for good. Connect a wallet to see
              your place before you send money.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <ConnectWalletButton className={pillPrimary} />
              <Link href="/proofs/tx-892a-c4e" className={pillSecondary}>
                Inspect a proof
              </Link>
            </div>
          </div>
          <HeroSteps />
        </div>
      </section>

      {/* The problem */}
      <section className="py-24 sm:py-32">
        <div className="page-wrap">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow>The problem</Eyebrow>
              <h2 className="mt-4 text-4xl font-extrabold leading-[1.02] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Every public deal is{" "}
                <span className="font-serif font-normal italic text-brand">leaking priority.</span>
              </h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-mutedForeground">
                When several wallets fund the same deal, only one is first in
                line. Today that order is decided by whoever relays fastest,
                not by who paid in first. Bots watch the public queue of
                pending deposits, copy yours, and jump ahead. Veridex locks
                the order the moment your deposit confirms, so your place
                cannot be bought after the fact.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8">
              <Eyebrow>Proof in plain terms</Eyebrow>
              <p className="mt-5 font-serif text-7xl italic leading-none text-brand">#3 in line</p>
              <p className="mt-5 text-sm leading-6 text-mutedForeground">
                When your deposit confirms, it takes one exact slot in the
                block, like a numbered ticket at a counter. After finality,
                that ticket cannot be swapped, bribed, or reordered. That
                number is your place in the repayment line.
              </p>
              <div className="mt-7 grid grid-cols-4 gap-2">
                {["1", "2", "3", "4"].map((position) => {
                  const you = position === "3";
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
                        {you ? "You" : "Taken"}
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

      {/* Seniority in plain terms */}
      <section id="about" className="scroll-mt-20 border-t border-border py-24 sm:py-32">
        <div className="page-wrap grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow>Seniority in plain terms</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold leading-[1.02] tracking-tight text-foreground sm:text-5xl">
              Seniority is your place in the{" "}
              <span className="font-serif font-normal italic text-brand">repayment line.</span>
            </h2>
            <div className="mt-6 space-y-4 text-base leading-7 text-mutedForeground">
              <p>
                When several lenders fund the same shipment, they queue up to
                get repaid. First in line is called senior: paid first, least
                risk, lowest yield. Last in line is junior: paid last, eats
                any loss first, and earns more for taking that risk.
              </p>
              <p>
                Veridex proves your place in that line from confirmed
                blockchain data. Once your rank is set, no bot or middleman
                can jump in front of you.
              </p>
            </div>
            <Link
              href="/proofs/tx-892a-c4e"
              className="mt-7 inline-block text-sm font-semibold text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-brand"
            >
              Inspect a proof
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
                  <p className="text-sm font-semibold text-foreground">Senior tranche</p>
                  <p className="mt-0.5 text-xs text-mutedForeground">Paid first</p>
                </div>
                <span className="font-mono text-sm text-mutedForeground">Lower rate</span>
              </li>
              <li className="flex items-center gap-4 rounded-[10px] border border-border bg-background px-5 py-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border font-mono text-xs text-mutedForeground">
                  2
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">Junior tranche</p>
                  <p className="mt-0.5 text-xs text-mutedForeground">Paid after seniors</p>
                </div>
                <span className="font-mono text-sm text-mutedForeground">Higher rate</span>
              </li>
            </ol>
            <p className="mt-6 border-t border-border pt-5 text-xs leading-5 text-mutedForeground">
              If the deal loses money, the junior tranche absorbs the loss
              before the senior. That is why junior pays more.
            </p>
          </div>
        </div>
      </section>

      <ProtocolGrid />

      {/* FAQ */}
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

      {/* CTA */}
      <section className="border-t border-border py-28 sm:py-36">
        <div className="page-wrap text-center">
          <h2 className="mx-auto max-w-3xl text-5xl font-extrabold leading-[1.02] tracking-tight text-foreground sm:text-6xl">
            Check your position{" "}
            <span className="font-serif font-normal italic text-brand">before you fund.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-mutedForeground">
            Connection takes one click. Your rank is shown before any capital
            moves.
          </p>
          <ConnectWalletButton className={`mt-10 ${pillPrimary}`} />
        </div>
      </section>
    </Shell>
  );
}
