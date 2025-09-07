// src/components/animated-logo.tsx

import { cn } from "@/lib/utils";

const AnimatedLogo = ({ className }: { className?: string }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("animate-spin-slow", className)}
    >
      <path
        d="M12 2V6"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ transformOrigin: 'center' }}
      />
      <path
        d="M12 18V22"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ transformOrigin: 'center' }}
      />
      <path
        d="M6 12H2"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ transformOrigin: 'center' }}
      />
      <path
        d="M22 12H18"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ transformOrigin: 'center' }}
      />
      <path
        d="M19.0711 4.92896L16.2426 7.75739"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ transformOrigin: 'center' }}
      />
      <path
        d="M7.75732 16.2426L4.92889 19.0711"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ transformOrigin: 'center' }}
      />
      <path
        d="M19.0711 19.0711L16.2426 16.2426"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ transformOrigin: 'center' }}
      />
      <path
        d="M7.75732 7.75739L4.92889 4.92896"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ transformOrigin: 'center' }}
      />
    </svg>
  );
};

export default AnimatedLogo;
