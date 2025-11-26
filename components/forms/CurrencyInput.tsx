import React from 'react';
import { RefreshCcw } from 'lucide-react';

interface CurrencyInputProps {
    amount: string;
    setAmount: (v: string) => void;
    originalAmount: string;
    setOriginalAmount: (v: string) => void;
    selectedCurrency: string;
    setSelectedCurrency: (v: string) => void;
    baseCurrency: string;
    currencyCodes: Record<string, string>;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
    amount, setAmount, originalAmount, setOriginalAmount,
    selectedCurrency, setSelectedCurrency, baseCurrency, currencyCodes
}) => {
    const currencies = [
        { code: '₹', name: 'INR', flag: '🇮🇳' },
        { code: '$', name: 'USD', flag: '🇺🇸' },
        { code: '€', name: 'EUR', flag: '🇪🇺' },
        { code: '£', name: 'GBP', flag: '🇬🇧' },
        { code: 'AED', name: 'AED', flag: '🇦🇪' },
        { code: '¥', name: 'JPY', flag: '🇯🇵' },
    ];

    const isBase = selectedCurrency === baseCurrency;

    return (
        <div className="w-full">
            {isBase ? (
                <div className="flex flex-col items-center justify-center py-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl border border-emerald-100 dark:border-emerald-800/20">
                    <p className="text-xs font-bold text-emerald-900/40 dark:text-emerald-100/40 uppercase tracking-widest mb-2">Amount</p>
                    <div className="flex items-center justify-center text-emerald-950 dark:text-emerald-50 w-full px-4 gap-2">
                        <div className="relative group shrink-0">
                            <select 
                                value={selectedCurrency} 
                                onChange={(e) => setSelectedCurrency(e.target.value)} 
                                className="appearance-none bg-transparent text-3xl font-bold opacity-50 outline-none text-right pr-2 cursor-pointer hover:opacity-100 transition-opacity"
                            >
                                {currencies.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                            </select>
                        </div>
                        <input 
                            type="number" 
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)} 
                            placeholder="0" 
                            className="bg-transparent text-5xl font-bold text-center w-full outline-none placeholder:text-emerald-900/20 dark:placeholder:text-emerald-100/20" 
                            style={{ maxWidth: '200px' }} 
                        />
                    </div>
                </div>
            ) : (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800/30 p-4">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Currency Converter</p>
                        <button type="button" onClick={() => setSelectedCurrency(baseCurrency)} className="text-[10px] text-slate-400 hover:text-indigo-500 font-bold underline">Reset to {baseCurrency}</button>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-3">
                        <div className="relative shrink-0">
                                <select 
                                value={selectedCurrency} 
                                onChange={(e) => setSelectedCurrency(e.target.value)} 
                                className="appearance-none bg-white dark:bg-[#021c17] text-xl font-bold p-2 px-3 rounded-xl outline-none shadow-sm border border-indigo-200 dark:border-indigo-800"
                            >
                                {currencies.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                            </select>
                        </div>
                        <input 
                            type="number" 
                            value={originalAmount} 
                            onChange={(e) => setOriginalAmount(e.target.value)} 
                            placeholder="Foreign Amount" 
                            className="flex-1 bg-transparent text-3xl font-bold text-indigo-900 dark:text-indigo-100 outline-none placeholder:text-indigo-200"
                        />
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-black/20 rounded-xl">
                        <RefreshCcw size={14} className="text-indigo-400 shrink-0"/>
                        <span className="text-xs font-bold text-indigo-800 dark:text-indigo-200">
                            {originalAmount || 0} {selectedCurrency} ≈ {baseCurrency} {amount || 0}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
