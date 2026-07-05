import * as React from "react";

export type IconProps = React.SVGProps<SVGSVGElement>;
export type Icon = React.ComponentType<IconProps>;

function createIcon(name: string): Icon {
  const Component = ({ className, ...props }: IconProps) => (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
      <title>{name}</title>
    </svg>
  );
  Component.displayName = name;
  return Component;
}

export const AlertCircle = createIcon("AlertCircle");
export const ArrowDown = createIcon("ArrowDown");
export const ArrowUp = createIcon("ArrowUp");
export const Check = createIcon("Check");
export const ChevronLeft = createIcon("ChevronLeft");
export const ChevronRight = createIcon("ChevronRight");
export const ChevronsLeft = createIcon("ChevronsLeft");
export const ChevronsRight = createIcon("ChevronsRight");
export const ChevronsUpDown = createIcon("ChevronsUpDown");
export const EyeOff = createIcon("EyeOff");
export const Inbox = createIcon("Inbox");
export const PlusCircle = createIcon("PlusCircle");
export const Search = createIcon("Search");
export const Settings2 = createIcon("Settings2");
export const ShieldAlert = createIcon("ShieldAlert");
export const X = createIcon("X");
