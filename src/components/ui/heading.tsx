import * as React from "react";

import { cn } from "@/lib/utils";

const HEADING_LEVEL_STYLES = {
  1: "text-2xl",
  2: "text-xl",
  3: "text-lg",
  4: "text-base",
} as const;

type HeadingLevel = keyof typeof HEADING_LEVEL_STYLES;

type HeadingProps = React.ComponentProps<"h1"> & {
  level?: HeadingLevel;
};

function Heading({ className, level = 1, ...props }: HeadingProps) {
  const Comp = `h${level}` as const;
  return (
    <Comp
      data-slot="heading"
      className={cn(
        "font-heading font-semibold tracking-tight text-foreground",
        HEADING_LEVEL_STYLES[level],
        className,
      )}
      {...props}
    />
  );
}

export { Heading };
