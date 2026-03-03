export interface Investment {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  color: string;
  historicalPrices: Record<number, number>; // Year -> Price per unit
  currentPrice: number;
  category: 'crypto' | 'stock' | 'commodity' | 'index';
}

export const investments: Investment[] = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: '₿',
    color: '#f7931a',
    category: 'crypto',
    currentPrice: 85000,
    historicalPrices: {
      2010: 0.08,
      2011: 4.60,
      2012: 13.45,
      2013: 770.44,
      2014: 313.92,
      2015: 430.05,
      2016: 997.69,
      2017: 13880.00,
      2018: 3689.56,
      2019: 7251.28,
      2020: 28949.00,
      2021: 46206.00,
      2022: 16547.00,
      2023: 42250.00,
      2024: 93500.00,
    },
  },
  {
    id: 'tesla',
    name: 'Tesla',
    symbol: 'TSLA',
    icon: '🔥',
    color: '#cc0000',
    category: 'stock',
    currentPrice: 248,
    historicalPrices: {
      2010: 4.78,
      2011: 5.30,
      2012: 6.62,
      2013: 10.03,
      2014: 14.43,
      2015: 15.39,
      2016: 14.25,
      2017: 20.46,
      2018: 22.19,
      2019: 14.96,
      2020: 49.67,
      2021: 235.22,
      2022: 123.18,
      2023: 248.48,
      2024: 250.22,
    },
  },
  {
    id: 'nvidia',
    name: 'NVIDIA',
    symbol: 'NVDA',
    icon: '🟢',
    color: '#76b900',
    category: 'stock',
    currentPrice: 115,
    historicalPrices: {
      2010: 2.50,
      2011: 3.06,
      2012: 3.12,
      2013: 3.65,
      2014: 5.00,
      2015: 8.00,
      2016: 11.43,
      2017: 24.67,
      2018: 33.24,
      2019: 59.47,
      2020: 52.03,
      2021: 78.26,
      2022: 14.61,
      2023: 49.52,
      2024: 81.50,
    },
  },
  {
    id: 'apple',
    name: 'Apple',
    symbol: 'AAPL',
    icon: '📱',
    color: '#555555',
    category: 'stock',
    currentPrice: 225,
    historicalPrices: {
      2010: 7.44,
      2011: 11.01,
      2012: 18.02,
      2013: 20.04,
      2014: 27.59,
      2015: 26.32,
      2016: 28.96,
      2017: 42.31,
      2018: 39.44,
      2019: 73.41,
      2020: 132.69,
      2021: 177.57,
      2022: 129.93,
      2023: 192.53,
      2024: 229.87,
    },
  },
  {
    id: 'amazon',
    name: 'Amazon',
    symbol: 'AMZN',
    icon: '📦',
    color: '#ff9900',
    category: 'stock',
    currentPrice: 198,
    historicalPrices: {
      2010: 12.10,
      2011: 9.21,
      2012: 13.39,
      2013: 19.94,
      2014: 15.89,
      2015: 33.79,
      2016: 37.96,
      2017: 58.47,
      2018: 75.35,
      2019: 92.25,
      2020: 163.31,
      2021: 166.72,
      2022: 84.00,
      2023: 151.94,
      2024: 188.00,
    },
  },
  {
    id: 'sp500',
    name: 'S&P 500',
    symbol: 'SPX',
    icon: '📈',
    color: '#1e40af',
    category: 'index',
    currentPrice: 5900,
    historicalPrices: {
      2010: 1257.64,
      2011: 1257.60,
      2012: 1426.19,
      2013: 1848.36,
      2014: 2058.90,
      2015: 2043.94,
      2016: 2238.83,
      2017: 2673.61,
      2018: 2506.85,
      2019: 3230.78,
      2020: 3756.07,
      2021: 4766.18,
      2022: 3844.82,
      2023: 4769.83,
      2024: 5881.63,
    },
  },
  {
    id: 'gold',
    name: 'Gold',
    symbol: 'XAU',
    icon: '🪙',
    color: '#ffd700',
    category: 'commodity',
    currentPrice: 2650,
    historicalPrices: {
      2010: 1421.60,
      2011: 1571.52,
      2012: 1669.51,
      2013: 1204.50,
      2014: 1199.25,
      2015: 1060.20,
      2016: 1151.70,
      2017: 1296.50,
      2018: 1282.20,
      2019: 1517.10,
      2020: 1895.10,
      2021: 1828.60,
      2022: 1824.00,
      2023: 2062.40,
      2024: 2634.50,
    },
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: '◈',
    color: '#627eea',
    category: 'crypto',
    currentPrice: 2200,
    historicalPrices: {
      2015: 0.90,
      2016: 8.07,
      2017: 755.76,
      2018: 136.82,
      2019: 132.32,
      2020: 737.80,
      2021: 3689.00,
      2022: 1196.00,
      2023: 2354.00,
      2024: 3345.00,
    },
  },
];

export const years = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

export function calculateReturns(amount: number, investment: Investment, year: number): {
  initialShares: number;
  currentValue: number;
  profit: number;
  multiplier: number;
  percentageReturn: number;
} {
  const historicalPrice = investment.historicalPrices[year];
  
  if (!historicalPrice) {
    return {
      initialShares: 0,
      currentValue: amount,
      profit: 0,
      multiplier: 1,
      percentageReturn: 0,
    };
  }

  const initialShares = amount / historicalPrice;
  const currentValue = initialShares * investment.currentPrice;
  const profit = currentValue - amount;
  const multiplier = currentValue / amount;
  const percentageReturn = ((currentValue - amount) / amount) * 100;

  return {
    initialShares,
    currentValue,
    profit,
    multiplier,
    percentageReturn,
  };
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(2)}`;
}

export function formatLargeCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
