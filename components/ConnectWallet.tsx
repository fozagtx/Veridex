"use client";

import { ConnectKitButton, useModal } from "connectkit";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

/**
 * Drop lingering WalletConnect session keys on disconnect so a stale
 * "shadow" session cannot block or hijack the next connect attempt.
 */
function clearStaleWalletSessions() {
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith("wc@2")) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    // Storage unavailable, nothing to clear.
  }
}

/**
 * Primary CTA. Opens the wallet modal in place; a completed connection
 * routes straight to the app. Already connected: enters the app directly.
 */
export function ConnectWalletButton({
  label = "Connect wallet",
  connectedLabel = "Open dashboard",
  connectedHref = "/dashboard",
  className = "",
}: {
  label?: string;
  connectedLabel?: string;
  connectedHref?: string;
  className?: string;
}) {
  const { isConnected } = useAccount();
  const router = useRouter();
  const { setOpen } = useModal({
    onConnect: () => router.push(connectedHref),
    onDisconnect: clearStaleWalletSessions,
  });

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center ${className}`}
      onClick={() => {
        if (isConnected) {
          router.push(connectedHref);
        } else {
          setOpen(true);
        }
      }}
    >
      {isConnected ? connectedLabel : label}
    </button>
  );
}

/** Header slot: connect button, or the account chip once connected. */
export function AccountOrConnect({ className = "" }: { className?: string }) {
  const { isConnected } = useAccount();
  const router = useRouter();
  const { setOpen } = useModal({
    onConnect: () => router.push("/dashboard"),
    onDisconnect: clearStaleWalletSessions,
  });

  if (isConnected) {
    return <ConnectKitButton />;
  }

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center ${className}`}
      onClick={() => setOpen(true)}
    >
      Connect wallet
    </button>
  );
}
