export function Logo({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="OurTurn logo"
    >
      {/* Cream background */}
      <circle cx="50" cy="50" r="50" fill="#FFF8F0" />

      {/* Circular ring - two colored arcs */}

      {/* Left half - terracotta */}
      <path
        d="M 50 25
           A 25 25 0 1 0 50 75
           A 25 25 0 1 0 50 25"
        stroke="#D97757"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="78.5 78.5"
        strokeDashoffset="0"
      />

      {/* Right half - gold */}
      <path
        d="M 50 25
           A 25 25 0 1 0 50 75
           A 25 25 0 1 0 50 25"
        stroke="#E8B86D"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="78.5 78.5"
        strokeDashoffset="-78.5"
      />
    </svg>
  );
}
