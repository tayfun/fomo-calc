'use client';

import { useState, useEffect, useMemo } from 'react';
import { investments, years, calculateReturns, formatCurrency, formatLargeCurrency, Investment } from './data/investments';

export default function Home() {
  const [amount, setAmount] = useState<string>('1000');
  const [selectedInvestment, setSelectedInvestment] = useState<Investment>(investments[0]);
  const [selectedYear, setSelectedYear] = useState<number>(2015);
  const [showResults, setShowResults] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(0);
  const [regretCount, setRegretCount] = useState(2100000);

  const results = useMemo(() => {
    const numAmount = parseFloat(amount) || 0;
    return calculateReturns(numAmount, selectedInvestment, selectedYear);
  }, [amount, selectedInvestment, selectedYear]);

  // Animate the counter
  useEffect(() => {
    if (showResults) {
      const duration = 2000;
      const steps = 60;
      const increment = results.currentValue / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= results.currentValue) {
          setAnimatedValue(results.currentValue);
          clearInterval(timer);
        } else {
          setAnimatedValue(current);
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [showResults, results.currentValue]);

  // Increment regret counter
  useEffect(() => {
    const interval = setInterval(() => {
      setRegretCount(prev => prev + Math.floor(Math.random() * 3));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setShowResults(true);
      setIsCalculating(false);
    }, 800);
  };

  const handleReset = () => {
    setShowResults(false);
    setAnimatedValue(0);
  };

  const isProfit = results.profit > 0;
  const availableYears = years.filter(y => selectedInvestment.historicalPrices[y] !== undefined);

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
        <div className="glass-card rounded-3xl p-8 md:p-12 w-full max-w-2xl animate-slide-up delay-200">
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

              {/* Investment Select */}
              <div className="space-y-3">
                <label className="text-white/60 text-sm font-medium uppercase tracking-wider">
                  In
                </label>
                <div className="relative">
                  <select
                    value={selectedInvestment.id}
                    onChange={(e) => {
                      const inv = investments.find(i => i.id === e.target.value);
                      if (inv) setSelectedInvestment(inv);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-lg font-semibold text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  >
                    {investments.map((inv) => (
                      <option key={inv.id} value={inv.id} className="bg-slate-900">
                        {inv.icon} {inv.name} ({inv.symbol})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                {/* Investment quick tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {investments.slice(0, 6).map((inv) => (
                    <button
                      key={inv.id}
                      onClick={() => setSelectedInvestment(inv)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedInvestment.id === inv.id
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
                    {availableYears.map((year) => (
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

              {/* Calculate Button */}
              <button
                onClick={handleCalculate}
                disabled={isCalculating || !amount || parseFloat(amount) <= 0}
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
                <p className="text-white/60 text-sm uppercase tracking-wider">
                  If you invested{' '}
                  <span className="text-white font-semibold">{formatLargeCurrency(parseFloat(amount) || 0)}</span>
                  {' '}in{' '}
                  <span className="text-white font-semibold">{selectedInvestment.name}</span>
                  {' '}back in{' '}
                  <span className="text-white font-semibold">{selectedYear}</span>
                </p>
              </div>

              {/* Main Result */}
              <div className="text-center space-y-4">
                <p className="text-white/60 text-lg">You would have today:</p>
                <div className={`text-5xl md:text-6xl lg:text-7xl font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'} animate-count-up`}>
                  {formatLargeCurrency(animatedValue)}
                </div>
                <div className={`text-xl font-semibold ${isProfit ? 'text-emerald-400/80' : 'text-red-400/80'}`}>
                  {isProfit ? '+' : ''}{formatLargeCurrency(results.profit)}
                  {' '}
                  <span className="text-white/40">
                    ({isProfit ? '+' : ''}{results.percentageReturn.toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Initial Price</p>
                  <p className="text-white font-semibold">
                    ${selectedInvestment.historicalPrices[selectedYear]?.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Current Price</p>
                  <p className="text-white font-semibold">
                    ${selectedInvestment.currentPrice.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Shares Owned</p>
                  <p className="text-white font-semibold">
                    {results.initialShares.toFixed(4)}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Return Multiplier</p>
                  <p className={`font-semibold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                    {results.multiplier.toFixed(2)}x
                  </p>
                </div>
              </div>

              {/* Emotional Message */}
              <div className={`text-center p-6 rounded-xl ${isProfit ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                <p className="text-lg font-medium">
                  {results.multiplier > 100 ? (
                    <span className="text-emerald-300">🏆 Generational wealth. You missed out on history.</span>
                  ) : results.multiplier > 10 ? (
                    <span className="text-emerald-300">🔥 Life-changing money. Hope you&apos;re sitting down.</span>
                  ) : results.multiplier > 2 ? (
                    <span className="text-emerald-300">💎 Solid gains. Could&apos;ve been nice.</span>
                  ) : results.multiplier > 1 ? (
                    <span className="text-yellow-300">📈 Better than the bank, at least.</span>
                  ) : (
                    <span className="text-red-300">🛡️ Bullet dodged. Sometimes doing nothing wins.</span>
                  )}
                </p>
              </div>

              {/* Share/Reset Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleReset}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-xl transition-all border border-white/10"
                >
                  Calculate Again
                </button>
                <button
                  onClick={() => {
                    const text = `If I had invested ${formatLargeCurrency(parseFloat(amount) || 0)} in ${selectedInvestment.name} back in ${selectedYear}, I'd have ${formatLargeCurrency(results.currentValue)} today... 💀\n\nCalculate your regret at shouldabought.com`;
                    navigator.clipboard.writeText(text);
                    alert('Copied to clipboard!');
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-4 px-6 rounded-xl transition-all glow-purple"
                >
                  Share Regret 💔
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
    </main>
  );
}
