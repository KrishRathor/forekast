import { BACKEND_URL } from "@/lib/BackendUrl"

export interface TradeCrud {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user1ID: string;
  user2ID: string;
  price: number;
  quantity: number;
  user1?: any;
  user2?: any;
}


export const handleGetAllTrades = async (token: string): Promise<TradeCrud[]> => {
  const response = await fetch(`${BACKEND_URL}/wallet/getAllTradesOfUser`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  const json = await response.json();

  if (!response.ok) {
    // TODO: handle this
  }

  return json.response as TradeCrud[]

}
