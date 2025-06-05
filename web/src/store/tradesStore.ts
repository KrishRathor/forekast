import type { TradeCrud } from "@/hooks/getAllTrades";
import { atom } from "recoil";

export const tradeStore = atom<TradeCrud[]>({
  key: "tradestore",
  default: [],
});

