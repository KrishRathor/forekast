import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  type OrderBookEntry,
  generateYesSideData,
  generateNoSideData,
  marketPrice,
} from "./data";
import { useEffect, useState } from "react";

const columnHelper = createColumnHelper<OrderBookEntry>();

const columns = [
  columnHelper.accessor("price", {
    header: () => "Price",
    cell: (info) => info.getValue().toFixed(1),
  }),
  columnHelper.accessor("size", {
    header: () => "Size",
    cell: (info) => info.getValue().toFixed(5),
  }),
  columnHelper.accessor("total", {
    header: () => "Total",
    cell: (info) => info.getValue().toFixed(5),
  }),
];

export function OrderBook() {
  const [yesData, setYesData] = useState<OrderBookEntry[]>(() =>
    generateYesSideData(8)
  );
  const [noData, setNoData] = useState<OrderBookEntry[]>(() =>
    generateNoSideData(8)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setYesData(generateYesSideData(8));
      setNoData(generateNoSideData(8));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const yesTable = useReactTable({
    data: yesData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const noTable = useReactTable({
    data: noData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full max-w-md mx-auto mt-10 font-mono text-sm">
      <div className="text-center text-lg font-semibold mb-2">Order Book</div>

      <div className="rounded overflow-hidden">
        <table className="w-full">
          <thead className="text-white bg-transparent border-none">
            {yesTable.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-2 text-left bg-transparent border-none"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {yesTable.getRowModel().rows.map((row) => (
              <tr key={row.id} className="text-green-500">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-1">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-center bg-yellow-900 text-yellow-300 py-1 border-y border-gray-600">
          Market Price: {marketPrice.toFixed(1)}
        </div>

        <table className="w-full">
          <tbody>
            {noTable.getRowModel().rows.map((row) => (
              <tr key={row.id} className="text-red-500">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-1">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

