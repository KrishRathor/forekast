import { BACKEND_URL } from "@/lib/BackendUrl"
import { useQuery } from "@tanstack/react-query"

export const usePlaceLimitOrder = (marketid: string, price: number, quantity: number, token: string, yes: boolean) => {
  return {
    placelimitorder: useQuery({
      queryKey: ['placelimitorder', marketid, price, quantity],
      queryFn: () => handlePlaceLimitOrder(marketid, price, quantity, token, yes),
      enabled: !!marketid && !!price && !!quantity
    })
  }
}

export const handlePlaceLimitOrder = async (marketid: string, price: number, quantity: number, token: string, yes: boolean) => {

  const response = await fetch(`${BACKEND_URL}/wallet/placeLimitOrder`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    method: 'POST',
    body: JSON.stringify({
      data: {
        userid: token,
        marketid,
        price,
        quantity,
        yes
      }
    })
  })
  await response.json()
  return ""
}
