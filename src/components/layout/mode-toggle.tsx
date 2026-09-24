"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const subscribe = () => () => {};

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  // false during SSR and hydration, true once on the client, so the
  // theme-dependent icon never mismatches the server-rendered HTML
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button variant="outline" size="icon" onClick={cycleTheme}>
      {theme === "light" && <Sun className="size-[1.2rem]" />}
      {theme === "dark" && <Moon className="size-[1.2rem]" />}
      {theme === "system" && <Monitor className="size-[1.2rem]" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
