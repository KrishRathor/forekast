export interface OrderBookEntry {
  price: number;
  size: number;
  total: number; 
}

export const generateNoSideData = (count: number): OrderBookEntry[] => {
  const basePrice = 103828.0;
  const data: OrderBookEntry[] = [];
  let currentTotal = 0;

  for (let i = 0; i < count; i++) {
    const price = basePrice - i * 0.5 + (Math.random() * 0.4 - 0.2);
    const size = parseFloat((Math.random() * (i < 3 ? 0.05 : 0.005)).toFixed(5));
    currentTotal += size;
    data.push({
      price: parseFloat(price.toFixed(1)),
      size: size,
      total: parseFloat(currentTotal.toFixed(5)),
    });
  }
  return data.reverse();
};

export const generateYesSideData = (count: number): OrderBookEntry[] => {
  const basePrice = 103817.0;
  const data: OrderBookEntry[] = [];
  let currentTotal = 0;

  for (let i = 0; i < count; i++) {
    const price = basePrice + i * 0.5 + (Math.random() * 0.4 - 0.2); 
    const size = parseFloat((Math.random() * (i < 3 ? 1.0 : 0.05)).toFixed(5));
    currentTotal += size;
    data.push({
      price: parseFloat(price.toFixed(1)),
      size: size,
      total: parseFloat(currentTotal.toFixed(5)),
    });
  }
  return data;
};

export const noSideData: OrderBookEntry[] = generateNoSideData(8);
export const yesSideData: OrderBookEntry[] = generateYesSideData(8);

export const centralPrice = 103817.2;
export const marketPrice = 103823.4;


