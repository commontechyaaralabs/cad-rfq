export const TailSpinner = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className="spinner-rotate"
    aria-hidden
  >
    <defs>
      <linearGradient id="fadeTail" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#5332FF" stopOpacity="1" />
        <stop offset="100%" stopColor="#5332FF" stopOpacity="0" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="3" fill="none" />
    <circle
      cx="12"
      cy="12"
      r="10"
      fill="none"
      stroke="url(#fadeTail)"
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray="60 200"
      strokeDashoffset="0"
    />
    <style jsx>{`
      .spinner-rotate {
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `}</style>
  </svg>
);

