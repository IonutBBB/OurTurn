'use client';

interface OrganicBlobsProps {
  variant?: 'default' | 'subtle' | 'warm' | 'hero';
  className?: string;
}

export function OrganicBlobs({ variant = 'default', className = '' }: OrganicBlobsProps) {
  const opacity = variant === 'subtle' ? 0.08 : variant === 'warm' ? 0.18 : variant === 'hero' ? 0.22 : 0.12;

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      {/* Large organic blob — top right, flowing form */}
      <svg
        className="absolute -top-24 -right-24 w-[520px] h-[520px] animate-float"
        viewBox="0 0 520 520"
        fill="none"
      >
        <path
          d="M260 20C340 10 430 60 470 140C510 220 490 310 440 380C390 450 310 490 230 480C150 470 80 420 40 350C0 280 -10 190 30 120C70 50 180 30 260 20Z"
          fill="var(--brand-200)"
          fillOpacity={opacity}
        />
      </svg>

      {/* Large organic blob — bottom left, amorphous */}
      <svg
        className="absolute -bottom-36 -left-36 w-[560px] h-[560px]"
        style={{ animationDelay: '-3s', animationDuration: '10s' }}
        viewBox="0 0 560 560"
        fill="none"
      >
        <path
          d="M280 10C380 0 480 70 520 170C560 270 540 380 470 450C400 520 300 560 210 530C120 500 50 430 20 340C-10 250 10 150 70 80C130 10 180 20 280 10Z"
          fill="var(--brand-100)"
          fillOpacity={opacity}
        />
      </svg>

      {/* Medium accent blob — center right */}
      <svg
        className="absolute top-1/4 -right-8 w-56 h-56"
        style={{ animationDelay: '-5s', animationDuration: '12s' }}
        viewBox="0 0 240 240"
        fill="none"
      >
        <path
          d="M120 10C170 0 220 30 240 80C260 130 240 190 200 220C160 250 100 250 60 220C20 190 0 130 20 80C40 30 70 20 120 10Z"
          fill="var(--brand-300)"
          fillOpacity={opacity * 0.6}
        />
      </svg>

      {/* Small dot cluster — top left (adds visual rhythm) */}
      {variant === 'hero' && (
        <svg
          className="absolute top-16 left-16 w-32 h-32 opacity-30"
          viewBox="0 0 128 128"
          fill="none"
        >
          <circle cx="20" cy="20" r="3" fill="var(--brand-400)" />
          <circle cx="50" cy="12" r="2" fill="var(--brand-300)" />
          <circle cx="80" cy="24" r="4" fill="var(--brand-200)" />
          <circle cx="32" cy="50" r="2.5" fill="var(--brand-300)" />
          <circle cx="65" cy="55" r="3" fill="var(--brand-400)" />
          <circle cx="100" cy="48" r="2" fill="var(--brand-200)" />
          <circle cx="18" cy="85" r="2" fill="var(--brand-200)" />
          <circle cx="48" cy="90" r="3.5" fill="var(--brand-300)" />
          <circle cx="85" cy="80" r="2" fill="var(--brand-400)" />
          <circle cx="110" cy="95" r="3" fill="var(--brand-200)" />
        </svg>
      )}
    </div>
  );
}
