import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table } from "@tanstack/react-table";

interface TableSearchProps<TData> {
  table: Table<TData>;
}

export function TableSearch<TData>({ table }: TableSearchProps<TData>) {
  const [selectedColumn, setSelectedColumn] = useState("title");

  const handleColumnChange = (newColumn: string) => {
    table.getAllColumns().forEach((column) => {
      if (column.getCanFilter()) {
        column.setFilterValue(undefined);
      }
    });

    setSelectedColumn(newColumn);
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder={`Filter ${selectedColumn}...`}
        value={
          (table.getColumn(selectedColumn)?.getFilterValue() as string) ?? ""
        }
        onChange={(event) =>
          table.getColumn(selectedColumn)?.setFilterValue(event.target.value)
        }
        className="max-w-sm"
      />
      <Select value={selectedColumn} onValueChange={handleColumnChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Select Column" />
        </SelectTrigger>
        <SelectContent>
          {table
            .getAllColumns()
            .filter(
              (column) =>
                column.getCanFilter() &&
                !["tags", "dateUploaded", "origin"].includes(column.id)
            )
            .map((column) => (
              <SelectItem key={column.id} value={column.id}>
                {column.id.charAt(0).toUpperCase() + column.id.slice(1)}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}
