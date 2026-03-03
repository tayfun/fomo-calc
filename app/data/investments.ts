// Types matching the backend schemas
export interface AssetValuationRequest {
  ticker: string;
  total_amount_invested: number;
  start_date: string; // YYYY-MM-DD format
}

export interface AssetValuationResponse {
  ticker: string;
  number_of_shares: number;
  start_date: string;
  price_per_share_at_purchase: number;
  value_at_purchase: number;
  price_per_share_current: number;
  current_date: string;
  current_value: number;
  net_return: number;
  roi: number;
  currency: string;
}

// Search API types
export interface SearchResult {
  ticker: string;
  name: string;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
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
    symbol: 'BTC-USD',
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
    symbol: '^GSPC',
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

/**
 * Search for stocks by name or ticker symbol
 */
export async function searchStocks(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 1) {
    return [];
  }

  const response = await fetch(`${API_BASE_URL}/search?name=${encodeURIComponent(query.trim())}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API error: ${response.status}`);
  }

  const data: SearchResponse = await response.json();
  return data.results;
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

// Currency code to symbol mapping
export const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  KRW: '₩',
  INR: '₹',
  RUB: '₽',
  BRL: 'R$',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'Fr',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  THB: '฿',
  VND: '₫',
  IDR: 'Rp',
  MYR: 'RM',
  PHP: '₱',
  SGD: 'S$',
  HKD: 'HK$',
  NZD: 'NZ$',
  MXN: '$',
  ZAR: 'R',
  TRY: '₺',
  AED: 'د.إ',
  SAR: '﷼',
  ILS: '₪',
  EGP: '£',
  NGN: '₦',
  KES: 'KSh',
  PKR: '₨',
  BDT: '৳',
  LKR: 'Rs',
  COP: '$',
  ARS: '$',
  CLP: '$',
  PEN: 'S/',
  UYU: '$',
  HUF: 'Ft',
  CZK: 'Kč',
  RON: 'lei',
  BGN: 'лв',
  HRK: 'kn',
  ISK: 'kr',
  UAH: '₴',
  MDL: 'L',
  AMD: '֏',
  GEL: '₾',
  AZN: '₼',
  KZT: '₸',
  UZS: 'soʻm',
  TMT: 'T',
  TJS: 'SM',
  KGS: 'с',
  AFN: '؋',
  IRR: '﷼',
  IQD: 'ع.د',
  SYP: '£',
  YER: '﷼',
  JOD: 'د.ا',
  LBP: 'ل.ل',
  QAR: '﷼',
  KWD: 'د.ك',
  BHD: 'د.ب',
  OMR: '﷼',
};

/**
 * Get currency symbol from 3-letter currency code
 */
export function getCurrencySymbol(currencyCode: string): string {
  return currencySymbols[currencyCode.toUpperCase()] || currencyCode;
}

export function formatLargeCurrency(value: number, currency: string = 'USD'): string {
  const symbol = getCurrencySymbol(currency);

  // Format the number without currency symbol first
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  // Prepend the symbol (handle symbols that should appear after the number)
  const suffixSymbols = ['kr', 'Ft', 'Kč', 'zł', 'lei', 'лв', 'kn', 'L', 'soʻm', 'T', 'SM', 'с'];
  if (suffixSymbols.includes(symbol)) {
    return `${formattedNumber} ${symbol}`;
  }

  return `${symbol}${formattedNumber}`;
}
