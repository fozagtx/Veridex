"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { GlobeIcon, GridIcon, KeyIcon, ShieldIcon } from "@/components/Icons";

/*
 * Storyboard (times within each loop cycle)
 * 01 Connect   period 4.4s: idle pill 0-2.2s → connected chip 2.2-4.4s → repeat
 * 02 Same loan period 4.8s: selection ring walks wallets 0 → 1 → 2, 1.6s per hop
 * 03 Line      period 5.6s: stable 0-1.4s → bot chip enters → rejected shake → exits → stable
 * 04 Pay in    period 4.8s: pay-in chip 0-2.4s → paid-in state 2.4-4.8s → repeat
 * Card entrance on scroll: y 24 → 0, opacity 0 → 1, delay i * 0.12s, spring 280/26, once.
 * Loops only run while the section is in view and motion is not reduced.
 */

const TIMING = {
  entranceStagger: 0.12,
  entranceOffsetY: 24,
  connectToggleMs: 2200,
  loanStepMs: 1600,
  rankPhaseMs: 1400,
  fundToggleMs: 2400,
};

const SPRING_BOUNCY = { type: "spring", stiffness: 280, damping: 26 } as const;
const SPRING_SNAPPY = { type: "spring", stiffness: 400, damping: 30 } as const;

const steps = [
  {
    number: "01",
    title: "Connect a wallet",
    copy: "The line only appears after a wallet connects.",
    demo: "connect",
  },
  {
    number: "02",
    title: "Same loan",
    copy: "Several wallets fund one on-chain loan. They stand in one line.",
    demo: "loan",
  },
  {
    number: "03",
    title: "See your place",
    copy: "Your place locks when the pay-in confirms. A bot cannot jump it.",
    demo: "rank",
  },
  {
    number: "04",
    title: "Pay in",
    copy: "Send CTC to the clearinghouse. Nothing moves until you confirm.",
    demo: "fund",
  },
] as const;

const wallets = [
  ["0xA4f...91B", "You"],
  ["0x3Ec...402", "Next"],
  ["0x9C1...6d2", "Waits"],
] as const;

const protocol = [
  {
    icon: <GridIcon />,
    title: "Confirm order is the line",
    copy: "Who confirms first keeps first place. Later sends append. They cannot move ahead.",
  },
  {
    icon: <KeyIcon />,
    title: "Connect to see the line",
    copy: "The live line stays hidden until a wallet connects.",
  },
  {
    icon: <GlobeIcon />,
    title: "Lives on Creditcoin",
    copy: "The line and the payout live on the same chain. You send CTC.",
  },
  {
    icon: <ShieldIcon />,
    title: "Pay-back fills the pot",
    copy: "Money does not come back by itself. Step 2 is required. Then first in line is paid.",
  },
];

function ConnectDemo({ playing }: { playing: boolean }) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setConnected((value) => !value), TIMING.connectToggleMs);
    return () => window.clearInterval(id);
  }, [playing]);

  return (
    <div className="flex h-full items-center justify-center">
      <AnimatePresence mode="wait" initial={false}>
        {connected ? (
          <motion.div
            key="connected"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2"
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={SPRING_SNAPPY}
          >
            <span className="h-2 w-2 rounded-full bg-brand" />
            <span className="font-mono text-xs text-foreground">0xA4f...91B</span>
            <span className="text-xs text-mutedForeground">Connected</span>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            className="inline-flex items-center rounded-[8px] bg-primary px-3 py-2 text-xs font-semibold text-primaryForeground"
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={SPRING_SNAPPY}
          >
            Connect wallet
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoanDemo({ playing }: { playing: boolean }) {
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(
      () => setSelected((index) => (index + 1) % wallets.length),
      TIMING.loanStepMs,
    );
    return () => window.clearInterval(id);
  }, [playing]);

  return (
    <div className="flex h-full flex-col justify-center gap-1.5">
      {wallets.map(([id, meta], index) => {
        const active = index === selected;
        return (
          <div key={id} className="relative flex items-center gap-2 rounded-[8px] px-2.5 py-1.5">
            {active ? (
              <motion.span
                layoutId="loan-ring"
                transition={SPRING_SNAPPY}
                className="pointer-events-none absolute inset-0 rounded-[8px] border border-brand bg-card"
              />
            ) : null}
            <span className={`relative h-1.5 w-1.5 shrink-0 rounded-full ${active ? "bg-brand" : "bg-border"}`} />
            <span className="relative truncate font-mono text-[11px] text-foreground">{id}</span>
            <span className="relative ml-auto shrink-0 text-[10px] text-mutedForeground">{meta}</span>
          </div>
        );
      })}
    </div>
  );
}

function RankDemo({ playing }: { playing: boolean }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setPhase((value) => (value + 1) % 4), TIMING.rankPhaseMs);
    return () => window.clearInterval(id);
  }, [playing]);

  const intruderVisible = phase === 1 || phase === 2;
  const rejected = phase === 2;

  return (
    <div className="flex h-full flex-col justify-center gap-1.5">
      <AnimatePresence>
        {intruderVisible ? (
          <motion.div
            key="bot-intruder"
            className={`flex items-center gap-2 rounded-[8px] border px-2.5 py-1.5 ${
              rejected ? "border-destructive bg-card" : "border-dashed border-border bg-card"
            }`}
            initial={{ opacity: 0, x: 24 }}
            animate={rejected ? { opacity: 1, x: [0, -4, 4, -2, 0] } : { opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={rejected ? { duration: 0.4 } : SPRING_SNAPPY}
          >
            <span className={`truncate font-mono text-[11px] text-mutedForeground ${rejected ? "line-through" : ""}`}>
              Bot 0x9Ff...7aA
            </span>
            {rejected ? (
              <span className="ml-auto shrink-0 font-mono text-[10px] uppercase tracking-wide text-destructive">
                Rejected
              </span>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex items-center gap-2 rounded-[8px] border border-border bg-card px-2.5 py-1.5">
        <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary font-mono text-[9px] font-bold text-primaryForeground">
          1
        </span>
        <span className="truncate font-mono text-[11px] text-foreground">0xA4f...91B</span>
        <span className="ml-auto shrink-0 text-[10px] text-mutedForeground">First</span>
      </div>
      <div className="flex items-center gap-2 rounded-[8px] border border-border bg-card px-2.5 py-1.5">
        <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-border font-mono text-[9px] text-mutedForeground">
          2
        </span>
        <span className="truncate font-mono text-[11px] text-foreground">0x3Ec...402</span>
        <span className="ml-auto shrink-0 text-[10px] text-mutedForeground">Next</span>
      </div>
    </div>
  );
}

function FundDemo({ playing }: { playing: boolean }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setReady((value) => !value), TIMING.fundToggleMs);
    return () => window.clearInterval(id);
  }, [playing]);

  return (
    <div className="flex h-full flex-col justify-center gap-2">
      <div className="rounded-[6px] border border-border bg-card px-2.5 py-1.5 font-mono text-[11px] text-foreground">
        1.00 CTC
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {ready ? (
          <motion.div
            key="ready"
            className="inline-flex items-center gap-1.5 rounded-[6px] bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-primaryForeground"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={SPRING_SNAPPY}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2.5 6.5 5 9l4.5-5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Paid in
          </motion.div>
        ) : (
          <motion.div
            key="prepare"
            className="inline-flex items-center rounded-[6px] border border-border bg-card px-2.5 py-1.5 text-[11px] font-semibold text-mutedForeground"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={SPRING_SNAPPY}
          >
            Pay in
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const demos = {
  connect: ConnectDemo,
  loan: LoanDemo,
  rank: RankDemo,
  fund: FundDemo,
} as const;

export function HeroSteps() {
  const reduce = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, { margin: "-40px" });
  const playing = inView && !reduce;

  return (
    <div
      ref={stageRef}
      className="rounded-2xl border border-border bg-card/90 p-5 backdrop-blur-sm sm:p-7"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {steps.map((step, index) => {
          const Demo = demos[step.demo];
          return (
            <motion.div
              key={step.number}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ ...SPRING_BOUNCY, delay: index * TIMING.entranceStagger }}
            >
              <div className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border bg-background font-mono text-[10px] font-bold text-brand">
                  {step.number}
                </span>
                <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
              </div>
              <p className="mt-2 text-xs leading-5 text-mutedForeground">{step.copy}</p>
              <div
                aria-hidden="true"
                className="mt-4 h-[104px] rounded-[8px] border border-border bg-background p-2.5"
              >
                <Demo playing={playing} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function ProtocolGrid() {
  const reduce = useReducedMotion();

  return (
    <section className="border-t border-border py-24 sm:py-32">
      <div className="page-wrap">
        <div className="mb-14 max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-mutedForeground">The protocol</p>
          <h2 className="mt-4 text-4xl font-extrabold leading-[1.02] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Built so no one can{" "}
            <span className="font-serif font-normal italic text-brand">jump the line.</span>
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {protocol.map((card, index) => (
            <motion.div
              key={card.title}
              className="rounded-2xl border border-border bg-card p-8"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ ...SPRING_BOUNCY, delay: index * 0.06 }}
            >
              <div className="grid h-11 w-11 place-items-center rounded-[10px] bg-muted text-foreground">
                {card.icon}
              </div>
              <h3 className="mt-6 text-lg font-bold text-foreground">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-mutedForeground">{card.copy}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
