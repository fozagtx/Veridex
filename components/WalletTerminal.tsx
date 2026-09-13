"use client";

import { ConnectKitButton } from "connectkit";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectWalletButton } from "@/components/ConnectWallet";
import {
  depositValue,
  explorerTx,
  formatCtc,
  stillOwed,
  waitForTransaction,
  type DealState,
} from "@/lib/clearinghouse";
import {
  creditcoinId,
  getInjectedChainId,
  getInjectedProvider,
  sendClearinghouseFund,
  sendClearinghousePayout,
  sendClearinghouseRepay,
  switchToCreditcoin,
  waitForCreditcoin,
  walletErrorMessage,
} from "@/lib/injectedWallet";

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function swapText(el: HTMLElement | null, next: string) {
  if (!el) {
    return;
  }
  if (el.textContent === next) {
    return;
  }
  const dur = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--text-swap-dur"),
  ) || 150;
  el.classList.add("is-exit");
  window.setTimeout(() => {
    el.textContent = next;
    el.classList.remove("is-exit");
    el.classList.add("is-enter-start");
    void el.offsetHeight;
    el.classList.remove("is-enter-start");
  }, dur);
}

export function WalletTerminal({
  deal,
  onChanged,
}: {
  deal: DealState | null;
  onChanged?: () => void;
}) {
  const [amount, setAmount] = useState("0.01");
  const [status, setStatus] = useState("Connect your wallet to pay in and get paid back.");
  const [error, setError] = useState("");
  const [isError, setIsError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [walletChainId, setWalletChainId] = useState<number | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [lastHash, setLastHash] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const revertTimer = useRef<number | null>(null);
  const shakeTimer = useRef<number | null>(null);

  const { address, isConnected } = useAccount();
  const onCreditcoin = walletChainId === creditcoinId;
  const canSendAmount = Boolean(isConnected && address && Number(amount) > 0);
  const nextUnpaid = deal?.places.find((place) => !place.paidBack) ?? null;
  const yourTurn = Boolean(
    address && nextUnpaid && nextUnpaid.funder.toLowerCase() === address.toLowerCase(),
  );
  const youGotPaid = Boolean(
    address && deal?.places.some((place) => place.funder.toLowerCase() === address.toLowerCase() && place.paidBack),
  );
  const owed = deal ? stillOwed(deal) : BigInt(0);
  const dealPaidEnough = Boolean(nextUnpaid && owed === BigInt(0));

  function ms(name: string, fallback: number) {
    const value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
    return Number.isFinite(value) ? value : fallback;
  }

  function clearErrorVisual() {
    if (revertTimer.current) {
      window.clearTimeout(revertTimer.current);
      revertTimer.current = null;
    }
    if (shakeTimer.current) {
      window.clearTimeout(shakeTimer.current);
      shakeTimer.current = null;
    }
    setIsError(false);
    setIsShaking(false);
    setError("");
  }

  function showError(message: string) {
    setError(message);
    setIsError(true);
    setIsShaking(false);
    requestAnimationFrame(() => {
      void inputRef.current?.offsetWidth;
      setIsShaking(true);
    });

    const shakeMs = ms("--shake-dur-a", 80) * 2 + ms("--shake-dur-b", 60) * 2;
    if (shakeTimer.current) window.clearTimeout(shakeTimer.current);
    shakeTimer.current = window.setTimeout(() => setIsShaking(false), shakeMs + 20);

    if (revertTimer.current) window.clearTimeout(revertTimer.current);
    revertTimer.current = window.setTimeout(() => {
      setIsError(false);
      setError("");
      revertTimer.current = null;
    }, shakeMs + ms("--revert-hold", 3000));
  }

  useEffect(() => {
    swapText(statusRef.current, status);
  }, [status]);

  useEffect(() => {
    const provider = getInjectedProvider();
    if (!provider) {
      setWalletChainId(null);
      return;
    }

    let cancelled = false;

    async function syncChain() {
      const chainId = await getInjectedChainId();
      if (!cancelled) {
        setWalletChainId(chainId);
      }
    }

    function onChainChanged(hex: unknown) {
      const parsed = Number.parseInt(String(hex), 16);
      setWalletChainId(Number.isFinite(parsed) ? parsed : null);
    }

    void syncChain();
    provider.on?.("chainChanged", onChainChanged);
    return () => {
      cancelled = true;
      provider.removeListener?.("chainChanged", onChainChanged);
    };
  }, [isConnected, address]);

  useEffect(() => {
    if (!isConnected || !address) {
      setStatus("Connect your wallet to pay in and get paid back.");
      return;
    }
    if (youGotPaid && !nextUnpaid) {
      setStatus("You got your money back. The line is clear.");
      return;
    }
    if (youGotPaid) {
      setStatus("You already got your money back.");
      return;
    }
    if (yourTurn && dealPaidEnough) {
      setStatus("The deal paid back. Get your money now.");
      return;
    }
    if (nextUnpaid && yourTurn) {
      setStatus(`You are first in line. The deal still owes ${formatCtc(owed)} CTC.`);
      return;
    }
    if (nextUnpaid) {
      setStatus(`${shortAddress(nextUnpaid.funder)} gets paid back first.`);
      return;
    }
    setStatus(`Connected as ${shortAddress(address)}. Pay in to join the line.`);
  }, [isConnected, address, youGotPaid, nextUnpaid, yourTurn, dealPaidEnough, owed]);

  useEffect(() => {
    return () => {
      if (revertTimer.current) window.clearTimeout(revertTimer.current);
      if (shakeTimer.current) window.clearTimeout(shakeTimer.current);
    };
  }, []);

  async function ensureCreditcoin() {
    const current = await getInjectedChainId();
    setWalletChainId(current);
    if (current === creditcoinId) {
      return;
    }
    setStatus("Check MetaMask and switch to Creditcoin Testnet.");
    await switchToCreditcoin();
    await waitForCreditcoin();
    setWalletChainId(creditcoinId);
  }

  async function parseAmount() {
    let value: bigint;
    try {
      value = depositValue(amount);
    } catch {
      showError("Enter a valid CTC amount.");
      return null;
    }
    if (value <= BigInt(0)) {
      showError("Enter a valid CTC amount.");
      return null;
    }
    return value;
  }

  async function run(label: string, send: () => Promise<string>) {
    if (!address || isWorking) {
      return;
    }
    setIsWorking(true);
    clearErrorVisual();
    try {
      await ensureCreditcoin();
      setStatus(`Check MetaMask: ${label}`);
      const hash = await send();
      setLastHash(hash);
      setStatus("Waiting for the block…");
      await waitForTransaction(hash);
      onChanged?.();
      setStatus("Done. The line updated.");
    } catch (cause) {
      const message = walletErrorMessage(cause);
      showError(message);
      setStatus(message);
    } finally {
      setIsWorking(false);
    }
  }

  async function payIn() {
    const value = await parseAmount();
    if (!value || !address) {
      return;
    }
    await run("pay in", () => sendClearinghouseFund(address, value));
  }

  async function payDealBack() {
    const value = await parseAmount();
    if (!value || !address) {
      return;
    }
    if (!deal?.places.length) {
      showError("Nobody has paid in yet.");
      return;
    }
    await run("pay the deal back", () => sendClearinghouseRepay(address, value));
  }

  async function collect() {
    if (!address) {
      return;
    }
    await run("get your money back", () => sendClearinghousePayout(address));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <ConnectKitButton />
        <button
          type="button"
          className={`rounded-[8px] border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            onCreditcoin
              ? "border-border bg-background text-mutedForeground hover:bg-muted/60"
              : "border-brand bg-brand text-white hover:bg-brandDark"
          }`}
          disabled={isWorking}
          onClick={() => {
            void (async () => {
              if (isWorking) return;
              setIsWorking(true);
              clearErrorVisual();
              try {
                await ensureCreditcoin();
                setStatus("Wallet is on Creditcoin Testnet.");
              } catch (cause) {
                const message = walletErrorMessage(cause);
                showError(message);
                setStatus(message);
              } finally {
                setIsWorking(false);
              }
            })();
          }}
        >
          {isWorking ? "Check MetaMask" : onCreditcoin ? "On Creditcoin" : "Use Creditcoin"}
        </button>
      </div>

      <div className={`t-input-wrap mt-5 ${isError ? "is-error" : ""}`}>
        <label className="block font-mono text-xs uppercase tracking-[0.5px] text-mutedForeground" htmlFor="amount">
          Amount (CTC)
        </label>
        <input
          id="amount"
          ref={inputRef}
          className={`t-input mt-2 w-full rounded-[8px] border bg-background px-4 py-3 font-mono text-foreground outline-none focus:border-ring ${isError ? "is-error border-destructive" : "border-input"} ${isShaking ? "is-shaking" : ""}`}
          inputMode="decimal"
          onChange={(event) => {
            setAmount(event.target.value);
            if (isError) clearErrorVisual();
          }}
          value={amount}
        />
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            className="rounded-[8px] bg-foreground px-4 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canSendAmount || isWorking}
            onClick={() => void payIn()}
          >
            Pay in
          </button>
          <button
            type="button"
            className="rounded-[8px] border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canSendAmount || isWorking || !deal?.places.length}
            onClick={() => void payDealBack()}
          >
            Pay the deal back
          </button>
          <button
            type="button"
            className="rounded-[8px] bg-brand px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brandDark disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!address || isWorking || !yourTurn || !dealPaidEnough}
            onClick={() => void collect()}
          >
            Get my money back
          </button>
        </div>
        <p className="t-error-msg mt-2 text-xs text-destructive">
          {error || "Pay in puts money in the pot. Pay the deal back fills the pot. First in line gets paid first."}
        </p>
      </div>

      <p ref={statusRef} className="t-text-swap mt-3 font-mono text-xs text-mutedForeground">
        Connect your wallet to pay in and get paid back.
      </p>
      {lastHash && lastHash !== "0x" ? (
        <a
          className="mt-2 inline-block font-mono text-xs text-brand underline-offset-2 hover:underline"
          href={explorerTx(lastHash)}
          rel="noreferrer"
          target="_blank"
        >
          Open this on Blockscout
        </a>
      ) : null}
    </div>
  );
}

export function WalletGate({ children }: { children: ReactNode }) {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-mutedForeground">Wallet required</p>
        <h2 className="mt-2 text-xl font-bold text-foreground">
          Connect a wallet to enter the deal.
        </h2>
        <p className="mt-2 max-w-lg text-sm leading-6 text-mutedForeground">
          Pay in, pay the deal back, then the first person in line gets their
          money back first.
        </p>
        <ConnectWalletButton className="mt-5 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brandDark" />
      </div>
    );
  }

  return <>{children}</>;
}
