import type { LucideIcon } from "lucide-react";

interface DataTableColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortField?: string;
  isPrimary?: boolean;
}

// Declared as data rather than JSX so the table can render compact icon
// buttons on desktop and labelled full-width buttons on mobile cards.
type DataTableAction<T> = {
  label: string;
  icon: LucideIcon;
  destructive?: boolean;
  // Lets callers declare every action once and hide the ones the user can't use.
  hidden?: boolean;
} &({ href: (row: T) => string } | { onClick: (row: T) => void });

export type { DataTableAction, DataTableColumn };
