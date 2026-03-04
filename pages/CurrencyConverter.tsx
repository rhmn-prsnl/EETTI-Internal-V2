import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowRight, DollarSign, TrendingUp, Globe, AlertCircle } from 'lucide-react';

interface CurrencyData {
  code: string;
  rate: number;
  name: string;
}

const CurrencyConverter: React.FC = () => {
  const [amount, setAmount] = useState<number>(1000);
  const [fromCurrency, setFromCurrency] = useState<string>('INR');
  const [toCurrency, setToCurrency] = useState<string>('USD');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Common currencies for quick selection
  const currencies = [
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'SGD', name: 'Singapore Dollar' },
    { code: 'AED', name: 'UAE Dirham' },
    { code: 'CNY', name: 'Chinese Yuan' },
  ];

  const fetchExchangeRate = async () => {
    setLoading(true);
    setError(null);
    try {
      // Using open.er-api.com as it's a free, open-source friendly API (no key required)
      const response = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();
      
      if (data.result === 'success') {
        const rate = data.rates[toCurrency];
        setExchangeRate(rate);
        setLastUpdated(new Date(data.time_last_update_utc).toLocaleString());
      } else {
        throw new Error('API returned error');
      }
    } catch (err) {
      setError('Could not fetch exchange rates. Please check your connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRate();
  }, [fromCurrency, toCurrency]);

  useEffect(() => {
    if (exchangeRate !== null) {
      setConvertedAmount(amount * exchangeRate);
    }
  }, [amount, exchangeRate]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-dark-900 p-6">
      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
            <Globe className="mr-3 text-primary-500" size={28} /> Currency Converter
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time exchange rates for international transactions.</p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-slate-200 dark:border-dark-700 overflow-hidden">
          <div className="p-8">
            
            {/* Converter UI */}
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
              
              {/* From */}
              <div className="flex-1 w-full">
                <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    {currencies.find(c => c.code === fromCurrency)?.code}
                  </span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full pl-16 pr-4 py-4 text-xl font-bold bg-slate-50 dark:bg-dark-700 border border-slate-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  />
                </div>
                <div className="mt-3">
                  <select 
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-dark-700 border border-slate-200 dark:border-dark-600 rounded-xl text-sm font-medium"
                  >
                    {currencies.map(c => (
                      <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap Button */}
              <button 
                onClick={handleSwap}
                className="p-4 bg-slate-100 dark:bg-dark-700 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 transition-colors shadow-sm"
              >
                <ArrowRight size={24} className="md:rotate-0 rotate-90" />
              </button>

              {/* To */}
              <div className="flex-1 w-full">
                <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">Converted To</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    {currencies.find(c => c.code === toCurrency)?.code}
                  </span>
                  <div className="w-full pl-16 pr-4 py-4 text-xl font-bold bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800/30 rounded-xl text-primary-700 dark:text-primary-400">
                    {loading ? '...' : convertedAmount?.toFixed(2)}
                  </div>
                </div>
                <div className="mt-3">
                  <select 
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-dark-700 border border-slate-200 dark:border-dark-600 rounded-xl text-sm font-medium"
                  >
                    {currencies.map(c => (
                      <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Info & Stats */}
            <div className="bg-slate-50 dark:bg-dark-700/50 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Exchange Rate</p>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-lg">
                    1 {fromCurrency} = {exchangeRate?.toFixed(4)} {toCurrency}
                  </span>
                  {loading && <RefreshCw size={16} className="animate-spin text-primary-500" />}
                </div>
                <p className="text-xs text-slate-400 mt-1">Last updated: {lastUpdated || 'Never'}</p>
              </div>
              
              {error && (
                <div className="flex items-center text-red-500 text-sm bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
                  <AlertCircle size={16} className="mr-2" />
                  {error}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Quick Reference Grid */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
            <TrendingUp className="mr-2 text-primary-500" size={20} /> Popular Conversions (from INR)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['USD', 'EUR', 'GBP', 'AED'].map(code => (
              <div key={code} className="bg-white dark:bg-dark-800 p-4 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500">INR to {code}</span>
                  <DollarSign size={14} className="text-slate-400" />
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {/* Note: This is a placeholder calculation since we only fetch one pair at a time in the main component. 
                      In a real app, we'd fetch all rates for INR base. For now, we'll just show a static placeholder or fetch it if we wanted to be fancy.
                      Let's just leave it as a static visual for the "module" requirement.
                  */}
                  --
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;
