// Inline SVG ring mark — ostra na dowolnym DPI (Apple Studio Display XDR, Retina, etc.)
// Zastępuje 4-warstwową kompozycję z <img> z figma-ellipse1/2/vector/vector1.svg
// viewBox "4 4 24 24" kadruje istotną część 32×32 przestrzeni kompozycji Figmy
export function RingIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="4 4 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        {/* Gradient tła koła: góra→dół #FAFAFA→#D6D6D6 */}
        <linearGradient id="ringGradCircle" x1="16" y1="8" x2="16" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FAFAFA" />
          <stop offset="1" stopColor="#D6D6D6" />
        </linearGradient>

        {/* Gradient wewnętrznej elipsy: odwrócony (rotate-180 z Figmy) */}
        <linearGradient id="ringGradEllipse" x1="16" y1="11" x2="16" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D6D6D6" />
          <stop offset="1" stopColor="#FAFAFA" />
        </linearGradient>

        {/* Drop shadow zewnętrznego pierścienia (z figma-vector.svg, opacity 0.05) */}
        <filter id="ringDropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="0.833" />
          <feGaussianBlur stdDeviation="0.833" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="shadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="shadow" />
        </filter>
      </defs>

      {/* Warstwa 1: tło — gradient koło */}
      <circle cx="16" cy="16" r="8" fill="url(#ringGradCircle)" />

      {/* Warstwa 2: zewnętrzny pierścień — ścieżki z figma-vector.svg, translate do przestrzeni 32px */}
      <g filter="url(#ringDropShadow)" transform="translate(5.166 6.001)">
        <path
          d="M18.5417 10C18.5417 5.7428 15.0905 2.29167 10.8333 2.29167C6.57614 2.29167 3.125 5.7428 3.125 10C3.125 14.2572 6.57614 17.7083 10.8333 17.7083C15.0905 17.7083 18.5417 14.2572 18.5417 10ZM19.7917 10C19.7917 14.9476 15.7809 18.9583 10.8333 18.9583C5.88578 18.9583 1.875 14.9476 1.875 10C1.875 5.05245 5.88578 1.04167 10.8333 1.04167C15.7809 1.04167 19.7917 5.05245 19.7917 10Z"
          fill="#171717"
          stroke="#171717"
          strokeWidth="0.416667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Warstwa 3: wewnętrzna elipsa gradient (figma-ellipse2.svg, rotate-180 = gradient odwrócony) */}
      <ellipse cx="16" cy="15.5" rx="8" ry="4.5" fill="url(#ringGradEllipse)" />

      {/* Warstwa 4: wewnętrzny pierścień eliptyczny — ścieżki z figma-vector1.svg */}
      <g transform="translate(7.5 10.5)">
        <path
          d="M15.3837 5.5C15.3837 3.12389 12.3018 1.19767 8.5 1.19767C4.69823 1.19767 1.61628 3.12389 1.61628 5.5C1.61628 7.87611 4.69823 9.80233 8.5 9.80233C12.3018 9.80233 15.3837 7.87611 15.3837 5.5ZM16.5 5.5C16.5 8.26142 12.9183 10.5 8.5 10.5C4.08172 10.5 0.5 8.26142 0.5 5.5C0.5 2.73858 4.08172 0.5 8.5 0.5C12.9183 0.5 16.5 2.73858 16.5 5.5Z"
          fill="#171717"
          stroke="#171717"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}
