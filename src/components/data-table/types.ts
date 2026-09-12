interface DataTableColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortField?: string;
  isPrimary?: boolean;
}

export type { DataTableColumn };
