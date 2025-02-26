"use client";

import React from "react";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  InitialTableState,
  useReactTable,
  RowSelectionState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { TablePagination } from "@/components/table/tablePagination";
import { TableToolbar } from "@/components/table/tableToolbar";

interface SongTableProps {
  data: {
    id: string;
    title: string;
    tags: string | null;
    download: string;
    source: string;
    comment: string | null;
    dateUploaded: Date | null;
    authorId: string;
    authorName: string | null;
  }[];
  columns: ColumnDef<any>[];
  showManageActions: boolean;
}

const initialState: InitialTableState = { columnVisibility: { origin: false } };

export function SongTable({
  data,
  columns,
  showManageActions,
}: SongTableProps) {
  const finalColumns = showManageActions
    ? columns
    : columns.filter((col) => col.id !== "manageActions");

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  // Process data to add unknown tag to songs without tags
  const processedData = React.useMemo(() => {
    return data.map((song: any) => ({
      ...song,
      tags: song.tags?.length ? song.tags : ["unknown"],
    }));
  }, [data]);

  const table = useReactTable({
    data: processedData,
    columns: finalColumns,
    initialState,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: {
      columnFilters,
      rowSelection,
    },
  });

  return (
    <div>
      <TableToolbar table={table}></TableToolbar>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
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
                  colSpan={finalColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination table={table} />
      </div>
    </div>
  );
}
