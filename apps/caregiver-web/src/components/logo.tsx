export function Logo({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="OurTurn Care logo"
    >
      {/* Cream background */}
      <circle cx="50" cy="50" r="50" fill="#FFF8F0" />

      {/* Terracotta arc (upper-left) */}
      <path
        d="M 60 22 A 28 28 0 0 0 22 54"
        stroke="#D97757"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />

      {/* Gold arc (lower-right) */}
      <path
        d="M 40 78 A 28 28 0 0 0 78 46"
        stroke="#E8B86D"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />

      {/* Center dot */}
      <circle cx="50" cy="50" r="4" fill="#3D2615" />
    </svg>
  );
}
