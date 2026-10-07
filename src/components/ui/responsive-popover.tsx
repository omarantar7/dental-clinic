"use client";

import type { ComponentProps, ReactNode } from "react";

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type PopoverAnchor = ComponentProps<typeof PopoverContent>["anchor"];

interface ResponsivePopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Ignored on mobile, where the content renders as a bottom sheet instead.
  anchor: PopoverAnchor;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  children: ReactNode;
}

function ResponsivePopover({
  open,
  onOpenChange,
  anchor,
  title,
  description,
  className,
  children,
}: ResponsivePopoverProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
          <div className="flex flex-col gap-4 px-6 pb-6">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverContent
        anchor={anchor}
        side="right"
        align="start"
        sideOffset={8}
        className={cn("w-80", className)}
      >
        <PopoverHeader>
          <PopoverTitle>{title}</PopoverTitle>
          {description && <PopoverDescription>{description}</PopoverDescription>}
        </PopoverHeader>
        {children}
      </PopoverContent>
    </Popover>
  );
}

export { ResponsivePopover, type PopoverAnchor };
