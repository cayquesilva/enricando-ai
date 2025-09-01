"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

type SeparatorRow = { isSeparator?: boolean };

function isSeparator<TData>(data: TData): data is TData & SeparatorRow {
  return (data as SeparatorRow)?.isSeparator === true;
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
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
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              // --- INÍCIO DA CORREÇÃO ---
              // Fazemos uma verificação segura para ver se a propriedade 'isSeparator' existe e é verdadeira.
              // Usamos 'as any' porque TData é genérico, mas esta verificação garante a segurança.
              const isSeparatorRow = isSeparator(row.original);
              // --- FIM DA CORREÇÃO ---

              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  // Agora usamos a nossa variável segura para aplicar a classe.
                  className={isSeparatorRow ? "bg-muted hover:bg-muted" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    // Adicionamos um 'colspan' à célula do separador para que ela ocupe a linha inteira.
                    <TableCell
                      key={cell.id}
                      className={isSeparatorRow ? "text-center" : ""}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Sem resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
