export function VeridexLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      role="img"
      aria-label="Veridex logo"
    >
      <rect width="32" height="32" rx="7" fill="#D25611" />
      <rect x="8" y="8" width="16" height="3.4" rx="1.7" fill="#FFFFFF" />
      <rect x="8" y="14.3" width="11" height="3.4" rx="1.7" fill="#FFFFFF" opacity="0.66" />
      <rect x="8" y="20.6" width="6.5" height="3.4" rx="1.7" fill="#FFFFFF" opacity="0.38" />
    </svg>
  );
}
