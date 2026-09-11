"use client";

import { useState, type ReactNode } from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Active une barre de recherche globale. */
  searchPlaceholder?: string;
  emptyMessage?: ReactNode;
  pageSize?: number;
  /** Rendu carte pour un écran étroit (< sm) : remplace le tableau par une liste de cartes empilées. */
  renderCard?: (row: TData) => ReactNode;
}

/** Table générique : recherche globale, tri, pagination, vue cards en dessous de `sm`. Réutilisée par tous les modules. */
export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder,
  emptyMessage = "Aucune donnée.",
  pageSize = 10,
  renderCard,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  return (
    <div className="space-y-3">
      {searchPlaceholder && (
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" aria-hidden />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-8"
            aria-label={searchPlaceholder}
          />
        </div>
      )}

      {renderCard && (
        <div className="flex flex-col gap-3 sm:hidden">
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => <div key={row.id}>{renderCard(row.original)}</div>)
          ) : (
            <div className="rounded-md border bg-card px-4 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          )}
        </div>
      )}

      <div className={cn("overflow-x-auto rounded-md border bg-card", renderCard && "hidden sm:block")}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Précédent
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
