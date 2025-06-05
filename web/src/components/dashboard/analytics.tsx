import { handleGetBalanceAndReserve } from "@/hooks/balance";
import { useAuth } from "@clerk/clerk-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export const Analytics = (): React.ReactElement => {

  const { getToken } = useAuth();

  const [balance, setBalance] = useState<number>(0);
  const [reserve, setReserve] = useState<number>(0);


  useEffect(() => {
    const getAnalytics = async () => {
      const token = await getToken();
      if (!token) {
        return
      }
      const { balance, reserve } = await handleGetBalanceAndReserve(token);
      setBalance(_ => balance);
      setReserve(_ => reserve);
    }
    getAnalytics()
  }, [])

  const data = [
    { name: "Balance", value: balance},
    { name: "Reserve", value: reserve},
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#01B06E"
          label
        />
        <Tooltip />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  )
}
