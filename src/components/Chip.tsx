import type { ReactNode } from "react";

/** Small monospace tag used for tech stacks and labels. */
export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-hairline bg-surface-2/60 px-2.5 py-1 font-mono text-xs text-body">
      {children}
    </span>
  );
}
