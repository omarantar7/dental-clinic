import * as React from "react";

import { cn } from "@/lib/utils";

function Text({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="text"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Text };
