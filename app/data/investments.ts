// Types matching the backend schemas
export interface AssetValuationRequest {
  ticker: string;
  total_amount_invested: number;
  start_date: string; // YYYY-MM-DD format
}

export interface AssetValuationResponse {
  ticker: string;
  number_of_shares: number;
  purchase_date: string;
  price_per_share_at_purchase: number;
  value_at_purchase: number;
  price_per_share_current: number;
  current_date: string;
  current_value: number;
  net_return: number;
  roi: number;
  currency: string;
}

// Frontend display types
export interface Investment {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  color: string;
  category: 'crypto' | 'stock' | 'commodity' | 'index';
}

// Available investments for the UI (frontend-only metadata)
export const investments: Investment[] = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: '₿',
    color: '#f7931a',
    category: 'crypto',
  },
  {
    id: 'tesla',
    name: 'Tesla',
    symbol: 'TSLA',
    icon: '🔥',
    color: '#cc0000',
    category: 'stock',
  },
  {
    id: 'nvidia',
    name: 'NVIDIA',
    symbol: 'NVDA',
    icon: '🟢',
    color: '#76b900',
    category: 'stock',
  },
  {
    id: 'apple',
    name: 'Apple',
    symbol: 'AAPL',
    icon: '📱',
    color: '#555555',
    category: 'stock',
  },
  {
    id: 'amazon',
    name: 'Amazon',
    symbol: 'AMZN',
    icon: '📦',
    color: '#ff9900',
    category: 'stock',
  },
  {
    id: 'sp500',
    name: 'S&P 500',
    symbol: 'SPX',
    icon: '📈',
    color: '#1e40af',
    category: 'index',
  },
  {
    id: 'gold',
    name: 'Gold',
    symbol: 'XAU',
    icon: '🪙',
    color: '#ffd700',
    category: 'commodity',
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: '◈',
    color: '#627eea',
    category: 'crypto',
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    symbol: 'MSFT',
    icon: '🪟',
    color: '#00a4ef',
    category: 'stock',
  },
  {
    id: 'google',
    name: 'Google',
    symbol: 'GOOGL',
    icon: '🔍',
    color: '#4285f4',
    category: 'stock',
  },
];

// Years available for selection
export const years = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

// API base URL - can be configured via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://0.0.0.0:8000/api';

/**
 * Fetch asset valuation from the backend API
 */
export async function fetchAssetValuation(
  ticker: string,
  amount: number,
  startDate: string
): Promise<AssetValuationResponse> {
  const requestBody: AssetValuationRequest = {
    ticker,
    total_amount_invested: amount,
    start_date: startDate,
  };

  const response = await fetch(`${API_BASE_URL}/asset-valuation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API error: ${response.status}`);
  }

  return response.json();
}

// Calculate returns using backend API response
export function calculateReturnsFromApi(
  amount: number,
  apiResponse: AssetValuationResponse
): {
  initialShares: number;
  currentValue: number;
  profit: number;
  multiplier: number;
  percentageReturn: number;
  purchasePrice: number;
  currentPrice: number;
} {
  return {
    initialShares: apiResponse.number_of_shares,
    currentValue: apiResponse.current_value,
    profit: apiResponse.net_return,
    multiplier: apiResponse.current_value / amount,
    percentageReturn: apiResponse.roi * 100,
    purchasePrice: apiResponse.price_per_share_at_purchase,
    currentPrice: apiResponse.price_per_share_current,
  };
}

// Legacy calculateReturns function (kept for compatibility if needed)
export function calculateReturns(amount: number, investment: Investment, year: number): {
  initialShares: number;
  currentValue: number;
  profit: number;
  multiplier: number;
  percentageReturn: number;
} {
  // This is a placeholder - actual calculations should use the API
  return {
    initialShares: 0,
    currentValue: amount,
    profit: 0,
    multiplier: 1,
    percentageReturn: 0,
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
