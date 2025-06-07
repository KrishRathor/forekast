import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { type OrderBookEntry } from "./data";
import { useWebSocket } from "@/context/WebSocketContext";
import { useEffect, useState } from "react";

interface OrderBookProps {
  marketID: string
}

const columnHelper = createColumnHelper<OrderBookEntry>();

const columns = [
  columnHelper.accessor("price", {
    header: () => "Price",
    cell: (info) => info.getValue().toFixed(1),
  }),
  columnHelper.accessor("quantity", {
    header: () => "Quantity",
    cell: (info) => info.getValue().toFixed(5),
  }),
  columnHelper.accessor("total", {
    header: () => "Total",
    cell: (info) => info.getValue().toFixed(5),
  }),
];

export const OrderBook = (props: OrderBookProps) => {

  const { marketID } = props;

  const { orderBookData } = useWebSocket();

  const [yesOrders, setYesOrders] = useState<OrderBookEntry[]>([]);
  const [noOrders, setNoOrders] = useState<OrderBookEntry[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  useEffect(() => {
    if (!orderBookData) return;
    if (orderBookData.marketID !== marketID) return;

    setYesOrders(orderBookData.yesOrders);
    setNoOrders(orderBookData.noOrders);
    setCurrentPrice(orderBookData.currentPrice);
  }, [orderBookData, marketID]);

  const yesTable = useReactTable({
    data: yesOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const noTable = useReactTable({
    data: noOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (


    <div className="w-full max-w-4xl mx-auto mt-10 font-mono text-sm px-2">
      <div className="text-center text-lg font-semibold mb-2">Order Book</div>

      <div className="rounded overflow-hidden border border-gray-700">
        <div className="overflow-x-auto md:overflow-x-visible">
          <table className="w-full table-fixed whitespace-nowrap text-sm sm:text-base">
            <thead className="text-white bg-transparent border-none">
              {yesTable.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`p-2 text-left bg-transparent border-none ${header.column.id === "price"
                        ? "w-24 md:w-auto"
                        : header.column.id === "quantity" || header.column.id === "total"
                          ? "w-28 md:w-auto"
                          : "w-auto"
                        }`}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {yesTable.getRowModel().rows.map((row) => (
                <tr key={row.id} className="text-green-500">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`p-1 truncate ${cell.column.id === "price"
                        ? "w-24 md:w-auto"
                        : cell.column.id === "quantity" || cell.column.id === "total"
                          ? "w-28 md:w-auto"
                          : "w-auto"
                        }`}
                      title={String(flexRender(cell.column.columnDef.cell, cell.getContext()))}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center bg-yellow-900 text-yellow-300 py-1 border-y border-gray-600 text-sm sm:text-base">
          Market Price: {currentPrice.toFixed(1)}
        </div>

        <div className="overflow-x-auto md:overflow-x-visible">
          <table className="w-full table-fixed whitespace-nowrap text-sm sm:text-base">
            <tbody>
              {noTable.getRowModel().rows.map((row) => (
                <tr key={row.id} className="text-red-500">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`p-1 truncate ${cell.column.id === "price"
                        ? "w-24 md:w-auto"
                        : cell.column.id === "quantity" || cell.column.id === "total"
                          ? "w-28 md:w-auto"
                          : "w-auto"
                        }`}
                      title={String(flexRender(cell.column.columnDef.cell, cell.getContext()))}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

