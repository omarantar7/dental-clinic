"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { DataTableColumn } from "@/components/data-table/types";

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading: boolean;
  getRowId: (row: T) => string;
  sort?: string;
  onSortChange?: (sort: string) => void;
  actions?: (row: T) => React.ReactNode;
  emptyMessage?: string;
}

function SortIcon({ active, sort }: { active: boolean; sort: string }) {
  if (!active)
    return <ArrowUpDown className="size-3.5 text-muted-foreground" />;
  return sort.startsWith("-") ? (
    <ArrowDown className="size-3.5" />
  ) : (
    <ArrowUp className="size-3.5" />
  );
}

function DataTable<T>({
  columns,
  data,
  isLoading,
  getRowId,
  sort = "",
  onSortChange,
  actions,
  emptyMessage = "No results found.",
}: DataTableProps<T>) {
  const activeSortField = sort.startsWith("-") ? sort.slice(1) : sort;

  const handleSort = (field: string) => {
    if (!onSortChange) return;
    if (activeSortField === field) {
      onSortChange(sort.startsWith("-") ? field : `-${field}`);
    } else {
      onSortChange(field);
    }
  };

  const isEmpty = !isLoading && data.length === 0;

  return (
    <>
      {/* Desktop: table */}
      <div className="hidden rounded-lg ring-1 ring-foreground/10 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>
                  {column.sortField ? (
                    <button
                      type="button"
                      className="flex items-center gap-1 hover:text-foreground"
                      onClick={() => handleSort(column.sortField!)}
                    >
                      {column.header}
                      <SortIcon
                        active={activeSortField === column.sortField}
                        sort={sort}
                      />
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
              {actions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: data?.length ?? 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell>
                      <Skeleton className="ml-auto h-4 w-12" />
                    </TableCell>
                  )}
                </TableRow>
              ))}

            {isEmpty && (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              data.map((row) => (
                <TableRow key={getRowId(row)}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>{column.cell(row)}</TableCell>
                  ))}
                  {actions && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {actions(row)}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {isLoading &&
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="flex flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}

        {isEmpty && (
          <Card>
            <CardContent>
              <Text className="text-center">{emptyMessage}</Text>
            </CardContent>
          </Card>
        )}

        {!isLoading &&
          data.map((row) => {
            const primaryColumn = columns.find((column) => column.isPrimary);
            const secondaryColumns = columns.filter(
              (column) => !column.isPrimary,
            );

            return (
              <Card key={getRowId(row)}>
                <CardContent
                  className={cn(
                    "flex flex-col gap-2",
                    actions && "flex-row items-start justify-between gap-3",
                  )}
                >
                  <div className="flex flex-1 flex-col gap-1.5 overflow-hidden">
                    {primaryColumn && (
                      <span className="truncate text-sm font-medium">
                        {primaryColumn.cell(row)}
                      </span>
                    )}
                    {secondaryColumns.map((column) => (
                      <div
                        key={column.key}
                        className="flex items-baseline gap-1 text-xs text-muted-foreground"
                      >
                        <span className="shrink-0 font-medium text-foreground">
                          {column.header}:
                        </span>
                        <span className="truncate">{column.cell(row)}</span>
                      </div>
                    ))}
                  </div>
                  {actions && (
                    <div className="flex shrink-0 gap-1">{actions(row)}</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
      </div>
    </>
  );
}

export { DataTable };
