"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";

// FullCalendar renders the title, day headers and "today" from the browser's
// clock, timezone and locale, which the server can't reproduce, so rendering
// it on the server always causes a hydration mismatch.
const LazySessionsCalendar = dynamic(
  () => import("./sessions-calendar").then((mod) => mod.SessionsCalendar),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[600px] w-full rounded-xl" />,
  },
);

export { LazySessionsCalendar };
