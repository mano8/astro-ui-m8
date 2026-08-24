import * as React from "react";

export interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {
  shouldFilter?: boolean;
}

export function Command({ shouldFilter: _shouldFilter, ...props }: CommandProps) {
  return <div {...props} />;
}

export function CommandEmpty(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} />;
}

export interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: React.ReactNode;
}

export function CommandGroup({ heading, children, ...props }: CommandGroupProps) {
  return (
    <div {...props}>
      {heading !== undefined ? <div>{heading}</div> : null}
      {children}
    </div>
  );
}

export function CommandInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} />;
}

export interface CommandItemProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  value?: string;
  onSelect?: (value: string) => void;
}

export function CommandItem({ value, onSelect, ...props }: CommandItemProps) {
  return <div {...props} onClick={() => onSelect?.(value ?? "")} />;
}

export function CommandList(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} />;
}

export function CommandSeparator(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} />;
}
