import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export function Shell({ children, footer = true }: { children: ReactNode; footer?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 pt-16">{children}</main>
      {footer ? <SiteFooter /> : null}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`geo-panel bg-card ${className}`}>{children}</section>;
}
