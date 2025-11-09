"use client";

import { useEffect, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

interface DataTableProps<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  searchColumn?: string;
  searchPlaceholder?: string;
  tabs?: { value: string; label: string; count: number }[];
  defaultTab?: string;
  onAdd?: () => void;
  addButtonLabel?: string;
  enableColumnVisibility?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  page?: number;
  totalCount?: number;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onTabChange?: (tabValue: string) => void;
  onPageChange?: (page: number) => void;
}

export function DataTable<TData, TValue>({
  data,
  columns,
  searchColumn,
  searchPlaceholder = "Search...",
  tabs,
  defaultTab = "all",
  onAdd,
  addButtonLabel = "Add New",
  enableColumnVisibility = true,
  enablePagination = true,
  pageSize = 10,
  page = 1,
  totalCount = 0,
  isLoading = false,
  error = null,
  onRetry,
  onTabChange,
  onPageChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [selectedTab, setSelectedTab] = useState(defaultTab);

  const [pageIndex, setPageIndex] = useState(page - 1);

  useEffect(() => {
    setPageIndex(page - 1);
  }, [page]);

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalCount / pageSize),
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function" ? updater({ pageIndex }) : updater;
      const newPageIndex = newState.pageIndex;
      setPageIndex(newPageIndex);
      onPageChange?.(newPageIndex + 1);
    },
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize,
        pageIndex,
      },
    },
  });

  const handleTabChange = (tabValue: string) => {
    setSelectedTab(tabValue);
    onTabChange?.(tabValue);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    onPageChange?.(p);
  };

  const prevPage = () => goToPage(page - 1);
  const nextPage = () => goToPage(page + 1);

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Data</h1>
            <p className="text-muted-foreground">Failed to load data</p>
          </div>
        </div>
        <div className="rounded-lg border border-dashed border-red-200 p-8 text-center">
          <div className="text-red-600 mb-2">Failed to load data</div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={onRetry} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tabs && tabs.length > 0 && (
        <div className="border-b">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.value
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 bg-muted rounded-full px-2 py-0.5 text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {searchColumn && (
          <div className="flex-1 w-full sm:w-auto">
            <Input
              placeholder={searchPlaceholder}
              value={
                (table.getColumn(searchColumn)?.getFilterValue() as string) ??
                ""
              }
              onChange={(event) =>
                table
                  .getColumn(searchColumn)
                  ?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {onAdd && <Button onClick={onAdd}>{addButtonLabel}</Button>}

          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Columns</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {enablePagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
          <div className="text-sm text-muted-foreground">
            Showing page {page} of {totalPages} — {totalCount} item(s)
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevPage}
              disabled={page <= 1}
            >
              <IconChevronLeft />
            </Button>

            {(() => {
              const visiblePages: number[] = [];
              const maxVisible = 5;

              if (totalPages <= maxVisible + 2) {
                for (let i = 1; i <= totalPages; i++) visiblePages.push(i);
              } else {
                visiblePages.push(1);

                let start = Math.max(2, page - 1);
                let end = Math.min(totalPages - 1, page + 1);

                if (page <= 3) {
                  start = 2;
                  end = 4;
                } else if (page >= totalPages - 2) {
                  start = totalPages - 3;
                  end = totalPages - 1;
                }

                if (start > 2) visiblePages.push(-1);

                for (let i = start; i <= end; i++) visiblePages.push(i);

                if (end < totalPages - 1) visiblePages.push(-1);
                visiblePages.push(totalPages);
              }

              return visiblePages.map((p, i) =>
                p === -1 ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="px-2 text-muted-foreground"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                      p === page
                        ? "bg-primary text-white"
                        : "hover:bg-muted text-foreground"
                    }`}
                    aria-current={p === page ? "page" : undefined}
                  >
                    {p}
                  </button>
                )
              );
            })()}

            <Button
              variant="ghost"
              size="icon"
              onClick={nextPage}
              disabled={page >= totalPages}
            >
              <IconChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
