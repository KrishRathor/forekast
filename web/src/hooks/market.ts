import { BACKEND_URL } from "@/lib/BackendUrl";
import { useQuery, type UseQueryResult } from "@tanstack/react-query"

interface MarketType {
  ID: string;
  Question: string;
  Expiry: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export const useMarkets = (): {
  liveMarkets: UseQueryResult<MarketType[], Error>,
} => {

  return {
    liveMarkets: useQuery({
      queryKey: ['livemarkets'],
      queryFn: () => getAllLiveMarkets()
    })
  }
}

export const useMarketByID = (id: string): {
  marketByID: UseQueryResult<MarketType | null, Error>
} => {

  return {
    marketByID: useQuery({
      queryKey: ['marketByID', id],
      queryFn: () => getMarketByID(id),
      enabled: !!id
    })
  }

}

const getMarketByID = async (id: string): Promise<MarketType | null> => {
  const response = await fetch(`${BACKEND_URL}/markets/getMarketByID?id=${id}`)
  const json = await response.json()

  if (!response.ok) {
    console.log(json)
    return null
  }

  return json.response as MarketType

}

const getAllLiveMarkets = async (): Promise<MarketType[]> => {
  const response = await fetch(`${BACKEND_URL}/markets/getAllLiveMarkets`);
  const json = await response.json()

  if (!response.ok) {
    console.log(json)
  }

  return json.response as MarketType[]
}
