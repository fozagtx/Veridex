"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AccountOrConnect } from "@/components/ConnectWallet";
import { VeridexLogo } from "@/components/VeridexLogo";

const links = [
  { href: "/#about", label: "About" },
  { href: "/#faq", label: "FAQ" },
  { href: "/dashboard", label: "The line" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<number | null>(null);

  function closeMs() {
    const value = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--dropdown-close-dur"),
    );
    return Number.isFinite(value) ? value : 150;
  }

  function openMenu() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setClosing(false);
    setOpen(true);
  }

  function closeMenu() {
    if (!open) return;
    setOpen(false);
    setClosing(true);
    closeTimer.current = window.setTimeout(() => {
      setClosing(false);
      closeTimer.current = null;
    }, closeMs());
  }

  function toggleMenu() {
    if (open) closeMenu();
    else openMenu();
  }

  useEffect(() => {
    setOpen(false);
    setClosing(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenu();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  const menuState = open ? "is-open" : closing ? "is-closing" : "";

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background/70 backdrop-blur-md">
      <div className="page-wrap flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 text-foreground">
          <VeridexLogo className="h-8 w-8 shrink-0" />
          <span className="text-base font-bold tracking-tight">Veridex</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-mutedForeground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <AccountOrConnect className="hidden rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-foreground sm:inline-flex" />

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-border bg-background text-foreground md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={toggleMenu}
          >
            <span className="t-icon-swap" data-state={open ? "b" : "a"}>
              <span className="t-icon" data-icon="a">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
              <span className="t-icon" data-icon="b">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M5 5l8 8M13 5l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
            </span>
          </button>
        </div>
      </div>

      <div className="page-wrap relative md:hidden">
        <div
          id="mobile-nav"
          className={`t-dropdown absolute right-0 top-2 z-50 w-[min(100%,18rem)] rounded-[8px] border border-border bg-card p-3 shadow-sm ${menuState}`}
          data-origin="top-right"
        >
          <nav className="grid gap-1" aria-label="Mobile">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[8px] px-3 py-2 text-sm font-medium text-mutedForeground transition-colors hover:bg-muted hover:text-foreground"
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
            <div onClick={closeMenu}>
              <AccountOrConnect className="mt-1 w-full rounded-[8px] bg-primary px-3 py-2 text-sm font-semibold text-primaryForeground" />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
