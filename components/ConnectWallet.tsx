"use client";

import { ConnectKitButton, useModal } from "connectkit";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

/**
 * Primary CTA. Never redirects to connect: it opens the wallet modal in
 * place. Once a wallet is connected, the same button enters the app.
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
  const { setOpen } = useModal();
  const router = useRouter();

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
  const { setOpen } = useModal();

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
