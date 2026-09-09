import type { ReactNode } from "react";
import type { ThemeId } from "./registry";
import { contractCheckScript } from "./contract";

type ThemeShellProps = {
  theme: ThemeId;
  /** next/font `.variable` classNames for this theme, space separated. */
  fontVars?: string;
  children: ReactNode;
};

/**
 * Wraps a theme's layout in the element that carries its tokens.
 *
 * The default theme deliberately renders NO element at all. The orb's fixed
 * layer is only correct while nothing between <body> and #hero establishes a
 * containing block, and the cheapest way to guarantee that permanently is to
 * add nothing rather than to add a div and remember never to give it a
 * transform, filter, backdrop-filter, contain or container-type. See the
 * ancestor walker in src/three/OrbScene.tsx.
 *
 * The font classNames and the token block have to land on the same element:
 * a theme sets `--font-sans: var(--font-anton)`, and that var only resolves
 * where the next/font class is applied.
 */
export function ThemeShell({ theme, fontVars = "", children }: ThemeShellProps) {
  const check =
    process.env.NODE_ENV === "production" ? null : (
      <script dangerouslySetInnerHTML={{ __html: contractCheckScript() }} />
    );

  if (theme === "default") {
    return (
      <>
        {children}
        {check}
      </>
    );
  }

  return (
    <div data-theme={theme} className={fontVars}>
      {children}
      {check}
    </div>
  );
}
