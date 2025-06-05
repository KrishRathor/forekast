import { useWebSocket } from '@/context/WebSocketContext';
import { useEffect, useState, type ReactElement } from 'react';
import { XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, ResponsiveContainer, } from 'recharts';

interface DataType {
  time: string,
  price: number
}

export const Chart = (): ReactElement => {


  const { trades } = useWebSocket();

  const [data, setData] = useState<DataType[]>([]);

  useEffect(() => {
    console.log("here")
    if (!trades || trades.length == 0) return;
    const d = trades.map(trade => {
      return {
        time: trade.Timestamp,
        price: trade.YesPrice
      }
    })
    setData(_ => d)

  }, [trades])




  return (
    <div className="w-full mt-10 h-[400px] sm:h-[500px] md:h-[600px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" interval={1} />
          <YAxis domain={['auto', 'auto']} interval={1} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#00C951"
            fill="#091F1A"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
