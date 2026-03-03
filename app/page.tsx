'use client';

import { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toPng } from 'html-to-image';
import {
  investments,
  fetchAssetValuation,
  searchStocks,
  formatLargeCurrency,
  Investment,
  AssetValuationResponse,
  SearchResult
} from './data/investments';
import SuspenseLoader from './components/SuspenseLoader';

// Generate years from 2010 to current year
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 2010 + 1 }, (_, i) => 2010 + i);

// Main page component wrapped in Suspense
export default function Home() {
  return (
    <Suspense fallback={
      <main className="min-h-screen animated-gradient relative overflow-hidden flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </main>
    }>
      <HomeContent />
    </Suspense>
  );
}

// Inner component that uses useSearchParams
function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [amount, setAmount] = useState<string>('1000');
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2015);
  const [showResults, setShowResults] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(0);
  const [regretCount, setRegretCount] = useState(2100000);
  const [apiResponse, setApiResponse] = useState<AssetValuationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [counterAnimationComplete, setCounterAnimationComplete] = useState(false);

  // Search/autocomplete state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Debounce search
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate results from API response
  const results = useMemo(() => {
    if (!apiResponse) {
      return {
        numberOfShares: 0,
        currentValue: 0,
        valueAtPurchase: 0,
        netReturn: 0,
        multiplier: 1,
        roi: 0,
        pricePerShareAtPurchase: 0,
        pricePerShareCurrent: 0,
      };
    }
    const numAmount = parseFloat(amount) || 0;
    return {
      numberOfShares: apiResponse.number_of_shares,
      currentValue: apiResponse.current_value,
      valueAtPurchase: apiResponse.value_at_purchase,
      netReturn: apiResponse.net_return,
      multiplier: apiResponse.current_value / numAmount,
      roi: apiResponse.roi,
      pricePerShareAtPurchase: apiResponse.price_per_share_at_purchase,
      pricePerShareCurrent: apiResponse.price_per_share_current,
    };
  }, [apiResponse, amount]);

  // Animate the counter
  useEffect(() => {
    if (showResults && results.currentValue > 0) {
      setCounterAnimationComplete(false);
      const duration = 2000;
      const steps = 60;
      const startValue = results.valueAtPurchase;
      const endValue = results.currentValue;
      const totalChange = endValue - startValue;
      const increment = totalChange / steps;
      let current = startValue;
      setAnimatedValue(startValue);
      const timer = setInterval(() => {
        current += increment;
        if ((increment >= 0 && current >= endValue) || (increment < 0 && current <= endValue)) {
          setAnimatedValue(endValue);
          setCounterAnimationComplete(true);
          clearInterval(timer);
        } else {
          setAnimatedValue(current);
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [showResults, results.currentValue, results.valueAtPurchase]);

  // Increment regret counter
  useEffect(() => {
    const interval = setInterval(() => {
      setRegretCount(prev => prev + Math.floor(Math.random() * 3));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handle click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search function
  const performSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 1) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchStocks(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);

    setShowSearchDropdown(true);
  };

  // Handle selecting a search result
  const handleSelectSearchResult = (result: SearchResult) => {
    // Find if this investment already exists in our list
    const existingInvestment = investments.find(inv => inv.symbol === result.ticker);

    if (existingInvestment) {
      setSelectedInvestment(existingInvestment);
    } else {
      // Create a temporary investment object for custom selections
      const newInvestment: Investment = {
        id: result.ticker.toLowerCase(),
        name: result.name,
        symbol: result.ticker,
        icon: '📈',
        color: '#6366f1',
        category: 'stock',
      };
      setSelectedInvestment(newInvestment);
    }

    setSearchQuery(`${result.name} (${result.ticker})`);
    setShowSearchDropdown(false);
    setSearchResults([]);
  };

  // Handle selecting from quick pick chips
  const handleSelectQuickPick = (inv: Investment) => {
    setSelectedInvestment(inv);
    setSearchQuery(`${inv.name} (${inv.symbol})`);
    setShowSearchDropdown(false);
    // Blur the search input when a quick pick is selected
    searchInputRef.current?.blur();
  };

  // Initialize search query with default selection
  useEffect(() => {
    if (selectedInvestment) {
      setSearchQuery(`${selectedInvestment.name} (${selectedInvestment.symbol})`);
    } else {
      setSearchQuery('');
    }
  }, []);

  // Load values from URL parameters on mount
  useEffect(() => {
    const ticker = searchParams.get('ticker');
    const totalAmount = searchParams.get('total_amount_invested');
    const startDate = searchParams.get('start_date');

    if (ticker) {
      const existingInvestment = investments.find(inv => inv.symbol === ticker);
      if (existingInvestment) {
        setSelectedInvestment(existingInvestment);
        setSearchQuery(`${existingInvestment.name} (${existingInvestment.symbol})`);
      } else {
        // Create a temporary investment for custom tickers
        const newInvestment: Investment = {
          id: ticker.toLowerCase(),
          name: ticker,
          symbol: ticker,
          icon: '📈',
          color: '#6366f1',
          category: 'stock',
        };
        setSelectedInvestment(newInvestment);
        setSearchQuery(`${ticker} (${ticker})`);
      }
    }

    if (totalAmount) {
      setAmount(totalAmount);
    }

    if (startDate) {
      const year = parseInt(startDate.split('-')[0]);
      if (!isNaN(year) && year >= 2010 && year <= currentYear) {
        setSelectedYear(year);
      }
    }

    // If all required params are present, auto-calculate
    if (ticker && totalAmount && startDate) {
      setTimeout(() => {
        handleCalculateFromParams(ticker, totalAmount, startDate);
      }, 100);
    }
  }, [searchParams]);

  // Helper function to calculate from URL params
  const handleCalculateFromParams = async (ticker: string, totalAmount: string, startDate: string) => {
    setIsCalculating(true);
    setError(null);

    try {
      const numAmount = parseFloat(totalAmount) || 0;

      const response = await fetchAssetValuation(
        ticker,
        numAmount,
        startDate
      );

      setApiResponse(response);
      setTimeout(() => {
        setShowResults(true);
        setIsCalculating(false);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch valuation');
      setIsCalculating(false);
    }
  };

  const handleCalculate = async () => {
    if (!selectedInvestment) return;

    setIsCalculating(true);
    setError(null);

    try {
      const numAmount = parseFloat(amount) || 0;
      const startDate = `${selectedYear}-01-01`;

      // Update URL with form parameters
      const params = new URLSearchParams();
      params.set('ticker', selectedInvestment.symbol);
      params.set('total_amount_invested', amount);
      params.set('start_date', startDate);
      router.push(`?${params.toString()}`, { scroll: false });

      const response = await fetchAssetValuation(
        selectedInvestment.symbol,
        numAmount,
        startDate
      );

      setApiResponse(response);
      // Small delay before showing results for dramatic effect
      setTimeout(() => {
        setShowResults(true);
        setIsCalculating(false);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch valuation');
      setIsCalculating(false);
    }
  };

  const handleReset = () => {
    setShowResults(false);
    setAnimatedValue(0);
    setApiResponse(null);
    setError(null);
    setCounterAnimationComplete(false);
    // Clear URL parameters
    router.push('/', { scroll: false });
  };

  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const text = `If I had invested ${formatLargeCurrency(parseFloat(amount) || 0, apiResponse?.currency)} in ${selectedInvestment?.name} back in ${selectedYear}, I'd have ${formatLargeCurrency(results.currentValue, apiResponse?.currency)} today... 💀\n\nCalculate your regret at shouldabought.com`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        backgroundColor: '#0f172a',
      });

      const link = document.createElement('a');
      link.download = `shouldabought-${selectedInvestment?.symbol}-${selectedYear}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image:', err);
    }
  };

  const isProfit = results.netReturn > 0;

  return (
    <main className="min-h-screen animated-gradient relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Logo */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-2 text-white/80 text-sm font-medium tracking-wider uppercase">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            shouldabought.com
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-12 animate-slide-up delay-100">
          If you had invested...
        </h1>

        {/* Glass Card */}
        <div className="glass-card rounded-3xl p-8 md:p-12 w-full max-w-2xl animate-slide-up delay-200" ref={showResults ? cardRef : undefined}>
          {!showResults ? (
            <div className="space-y-8">
              {/* Amount Input */}
              <div className="space-y-3">
                <label className="text-white/60 text-sm font-medium uppercase tracking-wider">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-xl font-semibold">
                    $
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-4 text-2xl md:text-3xl font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="1,000"
                    min="1"
                  />
                </div>
              </div>

              {/* Investment Select with Autocomplete */}
              <div className="space-y-3" ref={searchContainerRef}>
                <label className="text-white/60 text-sm font-medium uppercase tracking-wider">
                  In
                </label>
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onFocus={() => setShowSearchDropdown(true)}
                    placeholder="Search stocks (e.g., Apple, AAPL)..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-lg font-semibold text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    {isSearching ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </div>

                  {/* Search Results Dropdown */}
                  {showSearchDropdown && (searchResults.length > 0 || (searchQuery.trim().length > 0 && !isSearching)) && (
                    <div className="absolute z-50 w-full mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                      {searchResults.length > 0 ? (
                        searchResults.map((result, index) => (
                          <button
                            key={`${result.ticker}-${index}`}
                            onClick={() => handleSelectSearchResult(result)}
                            className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center justify-between border-b border-white/5 last:border-b-0"
                          >
                            <span className="text-white font-medium">{result.name}</span>
                            <span className="text-purple-400 font-semibold text-sm">{result.ticker}</span>
                          </button>
                        ))
                      ) : searchQuery.trim().length > 0 && !isSearching ? (
                        <div className="px-4 py-3 text-white/40 text-sm">
                          No results found
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Investment quick tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {investments.slice(0, 6).map((inv) => (
                    <button
                      key={inv.id}
                      onClick={() => handleSelectQuickPick(inv)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedInvestment?.id === inv.id
                          ? 'bg-purple-500/30 text-purple-200 border border-purple-500/50'
                          : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {inv.icon} {inv.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year Select */}
              <div className="space-y-3">
                <label className="text-white/60 text-sm font-medium uppercase tracking-wider">
                  Back in
                </label>
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-lg font-semibold text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  >
                    {years.map((year) => (
                      <option key={year} value={year} className="bg-slate-900">
                        {year}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                  Error: {error}
                </div>
              )}

              {/* Calculate Button */}
              <button
                onClick={handleCalculate}
                disabled={isCalculating || !amount || parseFloat(amount) <= 0 || !selectedInvestment}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg py-4 px-8 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] glow-purple flex items-center justify-center gap-3 group"
              >
                {isCalculating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <span className="text-2xl">💀</span>
                    Show Me The Damage
                    <svg
                      className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-slide-up">
              {/* Results Header */}
              <div className="text-center space-y-2">
                <p className="text-white/60 text-lg uppercase tracking-wider">
                  If you invested{' '}
                  <span className="text-white font-semibold">{formatLargeCurrency(parseFloat(amount) || 0, apiResponse?.currency)}</span>
                  {' '}in{' '}
                  <span className="text-white font-semibold">{selectedInvestment?.name}</span>
                  {' '}back in{' '}
                  <span className="text-white font-semibold">{selectedYear}</span>
                </p>
                {apiResponse && (
                  <p className="text-white/40 text-xs">
                    Purchase date: {apiResponse.start_date}
                  </p>
                )}
              </div>

              {/* Main Result */}
              <div className="text-center space-y-4">
                <p className="text-white/60 text-lg">You would have today:</p>
                <div className={`text-5xl md:text-6xl lg:text-7xl font-bold ${isProfit ? 'text-emerald-400 text-glow-emerald' : 'text-red-400 text-glow-red'} animate-count-up`}>
                  {formatLargeCurrency(animatedValue, apiResponse?.currency)}
                </div>
                <div className={`text-xl font-semibold ${isProfit ? 'text-emerald-400/80' : 'text-red-400/80'}`}>
                  {isProfit ? '+' : ''}{formatLargeCurrency(results.netReturn, apiResponse?.currency)}
                  {' '}
                  <span className="text-white/40">
                    ({isProfit ? '+' : ''}{results.roi.toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Initial Price</p>
                  <p className="text-white font-semibold">
                    {formatLargeCurrency(results.pricePerShareAtPurchase, apiResponse?.currency)}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Current Price</p>
                  <p className="text-white font-semibold">
                    {formatLargeCurrency(results.pricePerShareCurrent, apiResponse?.currency)}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Shares Owned</p>
                  <p className="text-white font-semibold">
                    {results.numberOfShares.toFixed(4)}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Return Multiplier</p>
                  <p className={`font-semibold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                    {results.multiplier.toFixed(2)}x
                  </p>
                </div>
              </div>

              {/* Regret Score */}
              {counterAnimationComplete && (() => {
                // Calculate regret score (0-10) based on ROI
                // ROI can be any percentage, we need to map it to 0-10 scale
                // Using a logarithmic approach: higher ROI = higher score
                // 0% or negative ROI = 0, 100% ROI = ~3, 1000% ROI = ~7, 10000% ROI = 10
                const calculateRegretScore = (roi: number): number => {
                  if (roi <= 0) return 0;
                  // Logarithmic scale: score = min(10, log10(roi + 1) * 2.5)
                  const score = Math.log10(roi + 1) * 2.5;
                  return Math.min(10, Math.max(0, score));
                };

                const regretScore = calculateRegretScore(results.roi);
                const scoreDisplay = regretScore.toFixed(1);

                // Get witty message based on regret score
                const getWittyMessage = (score: number): string => {
                  if (score >= 9) {
                    const messages = [
                      "You could have retired, instead you bought avocado toast.",
                      "Your future yacht is now someone else's reality.",
                      "Generational wealth: missed. Participation trophy: earned.",
                      "You played it safe. The billionaires thank you for that.",
                    ];
                    return messages[Math.floor(Math.random() * messages.length)];
                  } else if (score >= 7) {
                    const messages = [
                      "That money could've bought a house. Or two. Or three.",
                      "Your wallet is crying. Your future self is weeping.",
                      "You chose instant gratification. They chose compound interest.",
                      "The 'what ifs' are going to haunt you forever.",
                    ];
                    return messages[Math.floor(Math.random() * messages.length)];
                  } else if (score >= 5) {
                    const messages = [
                      "A nice car. A dream vacation. Poof. Gone.",
                      "You missed the boat, but at least you can wave from shore.",
                      "Your bank account could've been thicc. It's not.",
                      "Opportunity knocked. You ordered pizza instead.",
                    ];
                    return messages[Math.floor(Math.random() * messages.length)];
                  } else if (score >= 3) {
                    const messages = [
                      "Not life-changing, but definitely wallet-aching.",
                      "You could've had a fancy dinner. Every week. For years.",
                      "Small regrets add up. This one is medium-sized.",
                      "The FOMO is real, but at least it's not crippling.",
                    ];
                    return messages[Math.floor(Math.random() * messages.length)];
                  } else if (score > 0) {
                    const messages = [
                      "A gentle reminder that timing is everything.",
                      "Small missed opportunities. Big 'what if' energy.",
                      "You didn't miss much... but you still missed something.",
                      "The universe gave you a hint. You took a nap.",
                    ];
                    return messages[Math.floor(Math.random() * messages.length)];
                  } else {
                    const messages = [
                      "🛡️ Bullet dodged. Sometimes doing nothing wins.",
                      "Your procrastination finally paid off!",
                      "Not investing was the best investment you made.",
                      "Turns out, you made the right call. This time.",
                    ];
                    return messages[Math.floor(Math.random() * messages.length)];
                  }
                };

                const wittyMessage = getWittyMessage(regretScore);
                const scoreColor = regretScore >= 7 ? 'text-red-400' : regretScore >= 4 ? 'text-yellow-400' : regretScore > 0 ? 'text-emerald-400' : 'text-gray-400';
                const scoreBg = regretScore >= 7 ? 'bg-red-500/10 border-red-500/20' : regretScore >= 4 ? 'bg-yellow-500/10 border-yellow-500/20' : regretScore > 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-gray-500/10 border-gray-500/20';

                return (
                  <div className={`p-6 rounded-xl border ${scoreBg} animate-slide-up`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider">Regret Score</h3>
                      <div className={`text-4xl font-bold ${scoreColor}`}>
                        {scoreDisplay}<span className="text-white/30 text-xl">/10</span>
                      </div>
                    </div>
                    {/* Score Bar */}
                    <div className="w-full bg-white/10 rounded-full h-3 mb-4 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${regretScore >= 7 ? 'bg-red-500' : regretScore >= 4 ? 'bg-yellow-500' : regretScore > 0 ? 'bg-emerald-500' : 'bg-gray-500'}`}
                        style={{ width: `${(regretScore / 10) * 100}%` }}
                      />
                    </div>
                    {/* Witty Message */}
                    <p className={`text-lg font-medium text-center ${regretScore > 0 ? 'text-white/90' : 'text-gray-300'}`}>
                      {regretScore > 0 ? '🤦 ' : '🎉 '}{wittyMessage}
                    </p>
                  </div>
                );
              })()}

              {/* Share/Reset Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleReset}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-xl transition-all border border-white/10"
                >
                  Calculate Again
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-4 px-6 rounded-xl transition-all glow-purple"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Card
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="mt-12 text-center animate-slide-up delay-300">
          <p className="text-white/40 text-sm">
            <span className="text-emerald-400 font-semibold">{regretCount.toLocaleString()}</span> regrets calculated today
          </p>
        </div>

        {/* Disclaimer */}
        <p className="mt-8 text-white/20 text-xs text-center max-w-md">
          For entertainment purposes only. Past performance doesn&apos;t guarantee future results.
          Not financial advice. Please don&apos;t sue us for your FOMO.
        </p>
      </div>

      {/* Suspense Loader - Shows during calculation */}
      <SuspenseLoader isLoading={isCalculating} />
    </main>
  );
}
