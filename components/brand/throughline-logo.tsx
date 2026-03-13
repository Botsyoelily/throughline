type ThroughlineLogoProps = {
  compact?: boolean;
  iconOnly?: boolean;
};

export function ThroughlineLogo({
  compact = false,
  iconOnly = false
}: ThroughlineLogoProps) {
  const size = compact ? 30 : 44;
  const gradientId = compact ? "throughline-compact" : "throughline-full";

  return (
    <div
      className={compact ? "brand-lockup compact" : "brand-lockup"}
      aria-label="Throughline"
    >
      <svg
        aria-hidden="true"
        className={compact ? "logo-icon compact" : "logo-icon"}
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
      >
        <circle cx="22" cy="22" r="20" className="logo-ring" />
        <line x1="2" y1="22" x2="42" y2="22" stroke={`url(#${gradientId})`} className="logo-thread" />
        <circle cx="12" cy="22" r="2.5" className="logo-node-muted" />
        <circle cx="22" cy="22" r="3.5" className="logo-node" />
        <circle cx="32" cy="22" r="2.5" className="logo-node-deep" />
        <polyline points="29,18 34,22 29,26" className="logo-arrow" />
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="44" y2="0">
            <stop offset="0%" stopColor="#0E7490" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#164E63" />
          </linearGradient>
        </defs>
      </svg>
      {iconOnly ? null : (
        <div className="logo-text">
          <span className="logo-through">through</span>
          <span className="logo-line-word">line</span>
        </div>
      )}
    </div>
  );
}
