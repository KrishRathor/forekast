import { BACKEND_URL } from "@/lib/BackendUrl"
import { useQuery, type UseQueryResult } from "@tanstack/react-query"

export interface BalanceAndReserve {
  balance: number,
  reserve: number
}

export const useBalanceAndReserve = (userID: string): {
  balance: UseQueryResult<BalanceAndReserve | null>
} => {
  return {
    balance: useQuery({
      queryKey: ['useBalanceAndReserve'],
      queryFn: () => handleGetBalanceAndReserve(userID)
    })
  }
}

export const handleGetBalanceAndReserve = async (userID: string) => {

  const response = await fetch(`${BACKEND_URL}/wallet/getBalanceAndReserve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userID}`
    }
  })

  const json = await response.json()

  if (!response.ok) {
    // handle this error here
  }


  return {
    balance: parseInt(json.balance) ?? 0,
    reserve: parseInt(json.reserve) ?? 0
  }

}
