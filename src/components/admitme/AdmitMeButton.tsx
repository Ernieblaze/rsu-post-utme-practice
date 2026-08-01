import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'tertiary';

interface AdmitMeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

/**
 * AdmitMe's deliberate button system (see .mt-btn* in index.css):
 *  - primary   → warm gold, slightly taller, inner top highlight, glow on hover
 *  - secondary → surface + precise border
 *  - tertiary  → text with an accent underline that draws in on hover
 * Press state (scale) and reduced-motion are handled in CSS.
 */
export function AdmitMeButton({ variant = 'primary', className = '', children, ...rest }: AdmitMeButtonProps) {
  return (
    <button className={`mt-btn mt-btn-${variant} ${className}`} {...rest}>
      {children}
    </button>
  );
}
