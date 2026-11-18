import type { SelectHTMLAttributes } from 'react';

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
  wrapperClassName?: string;
};

export default function SelectField({ invalid = false, wrapperClassName = '', className = '', children, ...props }: SelectFieldProps) {
  const border = invalid
    ? 'border-error-500 focus:border-error-500 focus:ring-error-500/10'
    : 'border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700';

  return (
    <div className={`relative w-full ${wrapperClassName}`}>
      <select
        {...props}
        className={`dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border bg-transparent bg-none pl-3 pr-10 text-sm text-gray-800 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 ${border} ${className}`}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-500 dark:text-gray-400">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}
