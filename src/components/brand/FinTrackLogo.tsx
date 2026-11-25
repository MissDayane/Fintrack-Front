interface FinTrackMarkProps {
  size?: number;
  variant?: 'color' | 'white';
}

export function FinTrackMark({ size = 38, variant = 'color' }: FinTrackMarkProps) {
  const barFill = variant === 'white' ? '#FFFFFF' : 'url(#ft-bar-grad)';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="ft-bar-grad" x1="8" y1="54" x2="46" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B0F8C" />
          <stop offset="100%" stopColor="#5E17EB" />
        </linearGradient>
      </defs>
      {/* Upper sweeping F bar */}
      <path
        d="M11 33.5C11 20.8 19.6 12 33.4 12H45.2L38.4 21.6H32.6C25.2 21.6 20.6 25.5 19.4 32.5L11 33.5Z"
        fill={barFill}
      />
      {/* Lower sweeping F bar */}
      <path
        d="M11 52V45C11 35 18.6 29 29.8 29H43L37.4 37.8H29.4C24.2 37.8 21.4 40.5 21.4 45.6V52H11Z"
        fill={barFill}
      />
      {/* Gold upward-right arrow head */}
      <path
        d="M46.4 12H52.2C54.1 12 55.6 13.5 55.6 15.4V29.6L46.4 38.8V21.6H38.6L46.4 12Z"
        fill="#F4B400"
      />
    </svg>
  );
}

interface FinTrackLogoProps {
  variant?: 'light' | 'dark';
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function FinTrackLogo({
  variant = 'light',
  showTagline = false,
  size = 'md',
}: FinTrackLogoProps) {
  const iconSize = size === 'lg' ? 54 : size === 'sm' ? 30 : 38;
  const wordSize = size === 'lg' ? '2.35rem' : size === 'sm' ? '1.25rem' : '1.55rem';
  const taglineSize = size === 'lg' ? '0.96rem' : '0.74rem';

  const finColor = variant === 'dark' ? '#FFFFFF' : '#2D0B6B';
  const trackColor = variant === 'dark' ? '#FFFFFF' : '#7A3FF2';
  const taglineColor = variant === 'dark' ? 'rgba(233, 227, 255, 0.88)' : '#2D0B6B';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: size === 'lg' ? 14 : 10 }}>
      <FinTrackMark size={iconSize} variant={variant === 'dark' ? 'white' : 'color'} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: wordSize,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            display: 'inline-flex',
            alignItems: 'baseline',
          }}
        >
          <span style={{ color: finColor }}>F</span>
          <span style={{ position: 'relative', display: 'inline-block', color: finColor }}>
            ı
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: '50%',
                top: size === 'lg' ? '-0.04em' : '-0.02em',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: `${size === 'lg' ? 5 : 3.5}px solid transparent`,
                borderRight: `${size === 'lg' ? 5 : 3.5}px solid transparent`,
                borderBottom: `${size === 'lg' ? 8 : 5.5}px solid #F4B400`,
              }}
            />
          </span>
          <span style={{ color: finColor }}>n</span>
          <span style={{ color: trackColor }}>Track</span>
        </span>
        {showTagline && (
          <span
            style={{
              marginTop: size === 'lg' ? 7 : 4,
              fontSize: taglineSize,
              fontWeight: 500,
              letterSpacing: '0.02em',
              color: taglineColor,
            }}
          >
            Seu dinheiro, Seu Caminho.
          </span>
        )}
      </div>
    </div>
  );
}
