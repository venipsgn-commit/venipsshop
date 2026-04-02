interface VenipsLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function VenipsLogo({ size = 36, showText = true, className = '' }: VenipsLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Icon mark */}
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="8" fill="#080b3b" />
        <defs>
          <linearGradient id="venips-grad" x1="6" y1="8" x2="30" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00d4e8" />
            <stop offset="100%" stopColor="#00897b" />
          </linearGradient>
        </defs>
        {/* Stylized V shape */}
        <path
          d="M6 9 L13 9 L18 21 L23 9 L30 9 L18 29 Z"
          fill="url(#venips-grad)"
        />
      </svg>

      {/* Text */}
      {showText && (
        <span
          style={{ fontWeight: 900, fontSize: size * 0.58, letterSpacing: '-0.02em', lineHeight: 1 }}
          className="text-white"
        >
          VENIPS
        </span>
      )}
    </div>
  );
}
