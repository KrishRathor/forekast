import { useWebSocket } from '@/context/WebSocketContext';
import { useEffect, useState, type ReactElement } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, } from 'recharts';

interface DataType {
  time: string,
  price: number
}

export const Chart = (): ReactElement => {


  const { trades } = useWebSocket();

  const [data, setData] = useState<DataType[]>([]);

  useEffect(() => {
    if (!trades || trades.length == 0) return;
    const d = trades.map(trade => {
      return {
        time: trade.Timestamp,
        price: trade.YesPrice
      }
    })
    setData(_ => d)
    console.log("trades: ", trades, " data: ", data)

  }, [trades])




  return (
    <div className="mt-10">
      <AreaChart width={1000} height={600} data={data}>
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
    </div>
  )
}
