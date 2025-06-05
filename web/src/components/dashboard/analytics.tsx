import { handleGetBalanceAndReserve } from "@/hooks/balance";
import { useAuth } from "@clerk/clerk-react";
import type React from "react";
import { useEffect } from "react";

export const Analytics = (): React.ReactElement => {

  const { getToken } = useAuth();

  useEffect(() => {
    const getAnalytics = async () => {
      const token = await getToken();
      if (!token) {
        return
      }
      const { balance, reserve } = await handleGetBalanceAndReserve(token);
      console.log('inside analytics ', balance, reserve);
    }
    getAnalytics()
  }, [])

  return (
    <div>
      Analytics
    </div>
  )
}
