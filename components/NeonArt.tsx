import type { ComponentProps } from "react";

type SvgProps = Omit<ComponentProps<"svg">, "viewBox"> & {
  className?: string;
};

export function NeonBrain(props: SvgProps) {
  return (
    <svg viewBox="0 0 420 240" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <radialGradient id="nb_g1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(310 70) rotate(130) scale(190 210)">
          <stop stopColor="#60A5FA" stopOpacity="0.65" />
          <stop offset="1" stopColor="#1D4ED8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="nb_g2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(280 170) rotate(155) scale(220 210)">
          <stop stopColor="#22D3EE" stopOpacity="0.20" />
          <stop offset="1" stopColor="#0EA5E9" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="nb_stroke" x1="115" y1="30" x2="340" y2="210" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7DD3FC" stopOpacity="0.95" />
          <stop offset="1" stopColor="#60A5FA" stopOpacity="0.55" />
        </linearGradient>
        <filter id="nb_glow" x="-80" y="-80" width="580" height="400" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="10" result="b" />
          <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 0.9 0 0 0  0 0 1 0 0  0 0 0 0.55 0" result="c" />
          <feMerge>
            <feMergeNode in="c" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="nb_soft" x="-80" y="-80" width="580" height="400" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="22" result="b" />
          <feColorMatrix in="b" type="matrix" values="0 0 0 0 0.20  0 0 0 0 0.60  0 0 0 0 1  0 0 0 0.35 0" />
        </filter>
      </defs>

      <g opacity="0.95">
        <path d="M322 24C374 46 402 86 402 126c0 52-44 94-104 94H194c-82 0-148-56-148-124C46 48 106 8 184 8c54 0 94 20 118 46 8-16 18-26 20-30Z" fill="url(#nb_g1)" />
        <path d="M20 170c46 44 110 70 186 70h88c54 0 96-14 126-42-22 18-58 30-102 30H204c-70 0-138-34-184-88Z" fill="url(#nb_g2)" />
      </g>

      <g filter="url(#nb_soft)">
        <ellipse cx="292" cy="194" rx="100" ry="22" fill="#0EA5E9" />
      </g>

      <g filter="url(#nb_glow)">
        <path
          d="M272 52c34 0 60 22 60 54 0 18-9 34-24 43 2 5 3 11 3 17 0 26-22 46-52 46-16 0-30-6-39-15-10 8-24 13-40 13-34 0-60-22-60-54 0-11 3-21 9-30-13-10-21-24-21-41 0-30 26-54 60-54 11 0 21 2 30 7 8-16 24-26 44-26 19 0 36 10 44 25 10-6 22-9 36-9Z"
          stroke="url(#nb_stroke)"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="rgba(2,6,23,0.10)"
        />
        <path d="M156 112c10-10 22-16 36-16 22 0 40 14 46 33" stroke="rgba(125,211,252,0.45)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M206 70c18 4 32 18 34 36" stroke="rgba(125,211,252,0.35)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M250 98c14 2 24 12 26 26" stroke="rgba(125,211,252,0.35)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M206 156c-8 10-20 16-34 16" stroke="rgba(125,211,252,0.35)" strokeWidth="2.5" strokeLinecap="round" />

        <path d="M258 32c40 8 74 28 98 58" stroke="rgba(96,165,250,0.22)" strokeWidth="2" strokeLinecap="round" />
        <path d="M286 14c54 10 98 38 122 82" stroke="rgba(96,165,250,0.14)" strokeWidth="2" strokeLinecap="round" />
        <path d="M240 196c44 0 78-6 106-18" stroke="rgba(34,211,238,0.22)" strokeWidth="2" strokeLinecap="round" />
        <path d="M230 206c54 0 96-8 126-24" stroke="rgba(34,211,238,0.14)" strokeWidth="2" strokeLinecap="round" />

        <circle cx="318" cy="106" r="3" fill="#7DD3FC" />
        <circle cx="356" cy="82" r="2.5" fill="#60A5FA" opacity="0.85" />
        <circle cx="300" cy="174" r="2.5" fill="#22D3EE" opacity="0.85" />
        <circle cx="336" cy="176" r="2" fill="#22D3EE" opacity="0.65" />
      </g>
    </svg>
  );
}

export function NeonWave(props: SvgProps) {
  return (
    <svg viewBox="0 0 420 120" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="nw_g" x1="10" y1="60" x2="410" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA" stopOpacity="0" />
          <stop offset="0.2" stopColor="#60A5FA" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#22D3EE" stopOpacity="0.75" />
          <stop offset="0.8" stopColor="#60A5FA" stopOpacity="0.55" />
          <stop offset="1" stopColor="#60A5FA" stopOpacity="0" />
        </linearGradient>
        <filter id="nw_glow" x="-60" y="-60" width="540" height="240" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="10" result="b" />
          <feColorMatrix in="b" type="matrix" values="0 0 0 0 0.15  0 0 0 0 0.60  0 0 0 0 1  0 0 0 0.50 0" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#nw_glow)">
        <path
          d="M10 62c30-18 50-18 80 0s50 18 80 0 50-18 80 0 50 18 80 0 50-18 80 0"
          stroke="url(#nw_g)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export function NeonClock(props: SvgProps) {
  return (
    <svg viewBox="0 0 420 240" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <radialGradient id="nc_bg" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(240 80) rotate(120) scale(220 190)">
          <stop stopColor="#60A5FA" stopOpacity="0.22" />
          <stop offset="1" stopColor="#1D4ED8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="nc_ring" x1="110" y1="60" x2="320" y2="190" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7DD3FC" stopOpacity="0.95" />
          <stop offset="1" stopColor="#60A5FA" stopOpacity="0.55" />
        </linearGradient>
        <filter id="nc_glow" x="-80" y="-80" width="580" height="400" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="12" result="b" />
          <feColorMatrix in="b" type="matrix" values="0 0 0 0 0.10  0 0 0 0 0.60  0 0 0 0 1  0 0 0 0.55 0" result="c" />
          <feMerge>
            <feMergeNode in="c" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="0" y="0" width="420" height="240" rx="28" fill="url(#nc_bg)" />
      <g filter="url(#nc_glow)">
        <circle cx="220" cy="130" r="68" stroke="url(#nc_ring)" strokeWidth="3" fill="rgba(2,6,23,0.10)" />
        <circle cx="220" cy="130" r="46" stroke="rgba(125,211,252,0.22)" strokeWidth="2" />
        <path d="M220 130V94" stroke="rgba(125,211,252,0.95)" strokeWidth="3" strokeLinecap="round" />
        <path d="M220 130L250 146" stroke="rgba(125,211,252,0.75)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="220" cy="130" r="4.5" fill="#7DD3FC" />
        <path d="M144 188c24 14 52 22 84 22 42 0 80-14 108-38" stroke="rgba(34,211,238,0.18)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="158" cy="188" r="2.5" fill="#22D3EE" opacity="0.85" />
        <circle cx="332" cy="172" r="2.5" fill="#60A5FA" opacity="0.85" />
      </g>
    </svg>
  );
}

export function NeonParent(props: SvgProps) {
  return (
    <svg viewBox="0 0 420 240" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <radialGradient id="np_bg" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(240 70) rotate(130) scale(220 190)">
          <stop stopColor="#60A5FA" stopOpacity="0.18" />
          <stop offset="1" stopColor="#1D4ED8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="np_line" x1="140" y1="74" x2="300" y2="196" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7DD3FC" stopOpacity="0.90" />
          <stop offset="1" stopColor="#60A5FA" stopOpacity="0.55" />
        </linearGradient>
        <filter id="np_glow" x="-80" y="-80" width="580" height="400" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="12" result="b" />
          <feColorMatrix in="b" type="matrix" values="0 0 0 0 0.10  0 0 0 0 0.60  0 0 0 0 1  0 0 0 0.50 0" result="c" />
          <feMerge>
            <feMergeNode in="c" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="0" y="0" width="420" height="240" rx="28" fill="url(#np_bg)" />
      <g filter="url(#np_glow)">
        <path d="M150 170c-4-34 18-66 52-76 30-9 64 4 80 32 14 25 10 58-10 78-22 22-58 28-86 14-18-9-32-27-36-48Z" fill="rgba(2,6,23,0.14)" stroke="rgba(125,211,252,0.26)" strokeWidth="2" />
        <path d="M254 166c2-28 22-52 50-58 26-6 54 7 62 32 7 23-4 50-26 62-22 13-52 10-70-6-11-10-17-24-16-30Z" fill="rgba(2,6,23,0.12)" stroke="rgba(125,211,252,0.22)" strokeWidth="2" />
        <path d="M184 176c20-12 44-18 72-18 24 0 46 4 66 12" stroke="url(#np_line)" strokeWidth="3" strokeLinecap="round" />
        <path d="M210 126c12 10 24 16 38 18 18 2 34-2 48-12" stroke="rgba(34,211,238,0.30)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="192" cy="182" r="2.5" fill="#22D3EE" opacity="0.85" />
        <circle cx="320" cy="170" r="2.5" fill="#60A5FA" opacity="0.85" />
      </g>
    </svg>
  );
}

export function NeonHead(props: SvgProps) {
  return (
    <svg viewBox="0 0 420 240" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <radialGradient id="nh_bg" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(260 70) rotate(135) scale(240 210)">
          <stop stopColor="#60A5FA" stopOpacity="0.20" />
          <stop offset="1" stopColor="#1D4ED8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="nh_line" x1="120" y1="60" x2="300" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7DD3FC" stopOpacity="0.95" />
          <stop offset="1" stopColor="#60A5FA" stopOpacity="0.55" />
        </linearGradient>
        <filter id="nh_glow" x="-80" y="-80" width="580" height="400" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="12" result="b" />
          <feColorMatrix in="b" type="matrix" values="0 0 0 0 0.12  0 0 0 0 0.60  0 0 0 0 1  0 0 0 0.55 0" result="c" />
          <feMerge>
            <feMergeNode in="c" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="0" y="0" width="420" height="240" rx="28" fill="url(#nh_bg)" />
      <g filter="url(#nh_glow)">
        <path
          d="M206 206c-40-10-68-40-68-82 0-46 34-86 88-86 48 0 84 30 84 72 0 28-14 50-34 64 2 10 1 22-6 32-10 14-30 18-52 10-4-1-8-3-12-4Z"
          fill="rgba(2,6,23,0.12)"
          stroke="url(#nh_line)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M186 112h64" stroke="rgba(125,211,252,0.35)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M186 136h56" stroke="rgba(125,211,252,0.30)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M186 160h44" stroke="rgba(125,211,252,0.26)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="176" cy="112" r="3" fill="#7DD3FC" />
        <circle cx="176" cy="136" r="2.5" fill="#22D3EE" opacity="0.85" />
        <circle cx="176" cy="160" r="2.5" fill="#60A5FA" opacity="0.85" />
        <path d="M284 74c26 10 48 26 66 48" stroke="rgba(34,211,238,0.16)" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}
