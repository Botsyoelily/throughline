type ThroughlineLogoProps = {
  compact?: boolean;
};

export function ThroughlineLogo({ compact = false }: ThroughlineLogoProps) {
  const size = compact ? 44 : 70;

  return (
    <div className="brand-lockup" aria-label="Throughline">
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 96 96"
        fill="none"
      >
        <circle cx="48" cy="48" r="35" className="logo-ring" />
        <path
          className="logo-thread"
          d="M16 50C25 30 39 28 48 40C56 50 67 53 80 46"
        />
        <circle cx="28" cy="42" r="4.5" className="logo-node-muted" />
        <circle cx="48" cy="40" r="5" className="logo-node" />
        <circle cx="69" cy="48" r="4.5" className="logo-node-muted" />
        <path className="logo-arrow" d="M76 42L86 46L77 52" />
      </svg>
      <div>
        <div className="brand-wordmark brand-wordmark-top">through</div>
        <div className="brand-wordmark brand-wordmark-bottom">line</div>
      </div>
    </div>
  );
}

