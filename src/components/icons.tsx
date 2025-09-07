import type { SVGProps } from "react";

export const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M50 10L95 90H5L50 10Z" stroke="currentColor" strokeWidth="10" strokeLinejoin="round"/>
    <path d="M30 65H70" stroke="currentColor" strokeWidth="10" strokeLinecap="round"/>
  </svg>
);
