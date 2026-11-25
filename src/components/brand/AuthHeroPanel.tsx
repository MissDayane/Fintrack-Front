import { FinTrackLogo } from './FinTrackLogo';

export function AuthHeroPanel() {
  const dotRows = 6;
  const dotCols = 7;

  return (
    <aside className="auth-hero" aria-label="Identidade visual FinTrack">
      <svg
        className="auth-hero-artwork"
        viewBox="0 0 800 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="hero-gold" x1="0" y1="0" x2="340" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6D28D9" stopOpacity="0.15" />
            <stop offset="55%" stopColor="#F4B400" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#FFC933" />
          </linearGradient>
          <linearGradient id="hero-purple-ribbon" x1="0" y1="180" x2="360" y2="390" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3B0F8C" />
            <stop offset="100%" stopColor="#7A3FF2" />
          </linearGradient>
          <linearGradient id="hero-wave" x1="0" y1="620" x2="800" y2="900" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#43109E" stopOpacity="0.2" />
            <stop offset="65%" stopColor="#6C2AE6" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#8E54FF" stopOpacity="0.88" />
          </linearGradient>
        </defs>

        {/* Top-left flowing diagonal gold & purple brand ribbons (inspired by image_4.png) */}
        <path
          d="M-60 220L140 20H370L245 145C205 185 155 210 95 215L-60 220Z"
          fill="url(#hero-gold)"
        />
        <path
          d="M-80 390L125 185C160 150 205 132 255 132H345L265 245H170C125 245 85 268 55 305L-80 430V390Z"
          fill="url(#hero-purple-ribbon)"
          opacity="0.92"
        />
        <path
          d="M320 132H356C368 132 378 142 378 154V226L325 279V184H284L320 132Z"
          fill="#F4B400"
        />

        {/* Subtle geometric contour line */}
        <path
          d="M-40 480L195 245C245 195 310 170 382 170H480"
          stroke="rgba(167, 139, 250, 0.22)"
          strokeWidth="2"
        />

        {/* Bottom-left subtle dot matrix */}
        <g opacity="0.45">
          {Array.from({ length: dotRows }).map((_, r) =>
            Array.from({ length: dotCols }).map((__, c) => {
              const cx = 56 + c * 38;
              const cy = 620 + r * 38;
              const isGoldDot = (r === 1 && c === 4) || (r === 4 && c === 1);
              return (
                <circle
                  key={`${r}-${c}`}
                  cx={cx}
                  cy={cy}
                  r={isGoldDot ? 4 : 3.2}
                  fill={isGoldDot ? '#F4B400' : '#9B6BFF'}
                  opacity={isGoldDot ? 0.9 : 0.45}
                />
              );
            }),
          )}
        </g>

        {/* Bottom sweeping wave */}
        <path
          d="M-20 620C140 530 270 670 430 740C575 804 700 720 820 580V920H-20V620Z"
          fill="url(#hero-wave)"
        />
        <path
          d="M-20 612C140 522 270 662 430 732C575 796 700 712 820 572"
          stroke="rgba(182, 148, 255, 0.45)"
          strokeWidth="2.5"
        />
      </svg>

      <div className="auth-hero-content">
        <FinTrackLogo variant="dark" size="lg" showTagline />
        <p className="auth-hero-caption">
          Acompanhe contas, registre receitas e despesas com clareza e conte com a FinTrack IA
          para planejar suas decisões financeiras.
        </p>
      </div>
    </aside>
  );
}
