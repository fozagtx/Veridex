"use client";

import { ConnectKitButton } from "connectkit";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectWalletButton } from "@/components/ConnectWallet";
import { depositValue } from "@/lib/clearinghouse";
import {
  creditcoinId,
  getInjectedChainId,
  getInjectedProvider,
  sendClearinghouseFund,
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

export function WalletTerminal() {
  const [amount, setAmount] = useState("0.01");
  const [status, setStatus] = useState("Connect your wallet to choose a facility and check your place in line.");
  const [error, setError] = useState("");
  const [isError, setIsError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [walletChainId, setWalletChainId] = useState<number | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const revertTimer = useRef<number | null>(null);
  const shakeTimer = useRef<number | null>(null);

  const { address, isConnected } = useAccount();
  const onCreditcoin = walletChainId === creditcoinId;

  const canPrepare = useMemo(() => {
    return Boolean(isConnected && address && Number(amount) > 0);
  }, [address, amount, isConnected]);

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
    if (isConnected && address) {
      setStatus(`Connected as ${shortAddress(address)}. Enter an amount and prepare your deposit.`);
    } else {
      setStatus("Connect your wallet to choose a facility and check your place in line.");
    }
  }, [isConnected, address]);

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

  async function useCreditcoin() {
    if (isWorking) {
      return;
    }
    setIsWorking(true);
    clearErrorVisual();
    try {
      await ensureCreditcoin();
      setStatus("Wallet network set to Creditcoin Testnet.");
    } catch (cause) {
      const message = walletErrorMessage(cause);
      showError(message);
      setStatus(message);
    } finally {
      setIsWorking(false);
    }
  }

  async function prepareDeposit() {
    if (!canPrepare || !address || isWorking) {
      showError("Connect a wallet and enter an amount first.");
      return;
    }

    let value: bigint;
    try {
      value = depositValue(amount);
    } catch {
      showError("Enter a valid CTC amount.");
      return;
    }
    if (value <= BigInt(0)) {
      showError("Enter a valid CTC amount.");
      return;
    }

    setIsWorking(true);
    clearErrorVisual();
    try {
      await ensureCreditcoin();
      setStatus("Check MetaMask and confirm the deposit to the clearinghouse.");
      const hash = await sendClearinghouseFund(address, value);
      setStatus(`Deposit sent to the clearinghouse. Tx ${hash.slice(0, 10)}…`);
    } catch (cause) {
      const message = walletErrorMessage(cause);
      showError(message);
      setStatus(message);
    } finally {
      setIsWorking(false);
    }
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
          onClick={() => void useCreditcoin()}
        >
          {isWorking ? "Check MetaMask" : onCreditcoin ? "On Creditcoin" : "Use Creditcoin"}
        </button>
      </div>

      <div className={`t-input-wrap mt-5 ${isError ? "is-error" : ""}`}>
        <label className="block font-mono text-xs uppercase tracking-[0.5px] text-mutedForeground" htmlFor="amount">
          Amount (CTC)
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="amount"
            ref={inputRef}
            className={`t-input min-w-0 flex-1 rounded-[8px] border bg-background px-4 py-3 font-mono text-foreground outline-none focus:border-ring ${isError ? "is-error border-destructive" : "border-input"} ${isShaking ? "is-shaking" : ""}`}
            inputMode="decimal"
            onChange={(event) => {
              setAmount(event.target.value);
              if (isError) clearErrorVisual();
            }}
            value={amount}
          />
          <button
            type="button"
            className="rounded-[8px] bg-foreground px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canPrepare || isWorking}
            onClick={() => void prepareDeposit()}
          >
            {isWorking ? "Check MetaMask" : "Prepare deposit"}
          </button>
        </div>
        <p className="t-error-msg mt-2 text-xs text-destructive">{error || "Prepare sends CTC to the live Creditcoin clearinghouse."}</p>
      </div>

      <p ref={statusRef} className="t-text-swap mt-3 font-mono text-xs text-mutedForeground">Connect your wallet to choose a facility and check your place in line.</p>
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
          Connect a wallet to enter the clearing room.
        </h2>
        <p className="mt-2 max-w-lg text-sm leading-6 text-mutedForeground">
          Facility terms, queue rank, and deposit controls appear after
          connection. Nothing is submitted without your signature.
        </p>
        <ConnectWalletButton className="mt-5 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brandDark" />
      </div>
    );
  }

  return <>{children}</>;
}
