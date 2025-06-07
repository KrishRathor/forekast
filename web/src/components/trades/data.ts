export interface OrderBookDataI {
  marketID: string;
  currentPrice: number;
  yesOrders: OrderBookEntry[];
  noOrders: OrderBookEntry[];
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}



