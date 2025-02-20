"use client";

import { Table } from "@tanstack/react-table";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableSearch } from "@/components/table/tableSearch";
import { TableFacetedFilter } from "@/components/table/tableFacetedFilter";
import { tags } from "@/data/tags";
import { origins } from "@/data/origins";
import { downloadSongs } from "@/utils/downloadSongs";
import { Song } from "@/data/types/song";

interface TableToolbarProps<TData extends Song> {
  table: Table<TData>;
}

export function TableToolbar<TData extends Song>({
  table,
}: TableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const selectedRows = Object.keys(table.getState().rowSelection).length;

  const handleDownload = () => {
    const selectedSongs = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);
    downloadSongs(selectedSongs);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2 flex-wrap py-4">
        <TableSearch table={table}></TableSearch>
        {table.getColumn("tags") && (
          <TableFacetedFilter
            column={table.getColumn("tags")}
            title="Tags"
            options={tags}
          />
        )}
        {table.getColumn("origin") && (
          <TableFacetedFilter
            column={table.getColumn("origin")}
            title="Origin"
            options={origins}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-10 px-2 lg:px-3"
          >
            Reset
            <X />
          </Button>
        )}
        <Button
          disabled={selectedRows === 0}
          className="h-10 px-2 lg:px-3"
          onClick={handleDownload}
        >
          {selectedRows > 0 ? `Download (${selectedRows})` : "Download"}
          <Download className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
