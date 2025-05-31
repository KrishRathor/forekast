import { type ReactElement } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, } from 'recharts';

const data = [
  { time: '2025-05-20T09:30:00', price: 100.5 },
  { time: '2025-05-20T10:00:00', price: 101.2 },
  { time: '2025-05-20T10:30:00', price: 102.8 },
  { time: '2025-05-20T11:00:00', price: 101.9 },
  { time: '2025-05-20T11:30:00', price: 103.4 },
  { time: '2025-05-20T12:00:00', price: 104.0 },
  { time: '2025-05-20T12:30:00', price: 103.8 },
  { time: '2025-05-20T13:00:00', price: 105.5 },
  { time: '2025-05-20T13:30:00', price: 106.2 },
  { time: '2025-05-20T14:00:00', price: 107.1 },
  { time: '2025-05-20T14:30:00', price: 106.8 },
  { time: '2025-05-20T15:00:00', price: 107.5 },
  { time: '2025-05-20T15:30:00', price: 108.3 },
  { time: '2025-05-20T16:00:00', price: 109.0 },
];


export const Chart = (): ReactElement => {
  return (
    <div className='mt-10' >
      <LineChart width={1000} height={600} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" interval={1} />
        <YAxis domain={['auto', 'auto']} interval={1} />
        <Tooltip />
        <Line type="monotone" dataKey="price" stroke="#0f62fe" dot={false} />
      </LineChart>

    </div>
  )
}
