import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Save } from 'lucide-react';

interface BudgetModalProps {
  currentBudget: number;
  onSave: (amount: number, monthKey: string) => void;
  onClose: () => void;
  currency: string;
  currentDate: Date;
  changeBudgetMonth: (offset: number) => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({ currentBudget, onSave, onClose, currency, currentDate, changeBudgetMonth }) => {
    const [amount, setAmount] = useState(currentBudget);

    const currentMonthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const monthKey = currentDate.getFullYear() + '-' + String(currentDate.getMonth() + 1).padStart(2, '0');
    
    const canSave = amount > 0;
    
    const adjustAmount = (percentage: number) => {
        setAmount(prev => Math.round(prev * (1 + percentage / 100)));
    };

    return (
        <div className="absolute inset-0 z-[100] flex items-end sm:items-center justify-center bg-emerald-950/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-[#f0fdf4] dark:bg-[#062c26] rounded-[2.5rem] p-6 shadow-2xl border border-white/20 animate-in slide-in-from-bottom-10 duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-emerald-950 dark:text-emerald-50">Set Budget Limit</h3>
                    <button onClick={onClose} aria-label="Close Budget Modal" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X size={24} className="opacity-60 text-emerald-900 dark:text-emerald-100"/></button>
                </div>

                {/* Month Navigator */}
                <div className="flex items-center justify-between mb-8 bg-white dark:bg-[#0a3831] p-2 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                    <button onClick={() => changeBudgetMonth(-1)} aria-label="Previous Month" className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-emerald-900 dark:text-emerald-100"><ChevronLeft size={20}/></button>
                    <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100 uppercase tracking-widest">{currentMonthName}</span>
                    <button onClick={() => changeBudgetMonth(1)} aria-label="Next Month" className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-emerald-900 dark:text-emerald-100"><ChevronRight size={20}/></button>
                </div>
                
                <div className="flex flex-col items-center justify-center mb-8">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Maximum Spending</label>
                    <div className="flex items-center gap-2">
                         <span className="text-4xl font-bold text-emerald-900/30 dark:text-emerald-100/30">{currency}</span>
                         <input 
                            type="number" 
                            value={amount} 
                            onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                            className="bg-transparent text-5xl font-black text-emerald-900 dark:text-emerald-50 outline-none text-center w-48"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex gap-2 mb-8">
                     <button onClick={() => adjustAmount(5)} className="flex-1 py-3 bg-white dark:bg-[#0a3831] rounded-xl border border-emerald-100 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs active:scale-95 transition-transform">+5%</button>
                     <button onClick={() => adjustAmount(10)} className="flex-1 py-3 bg-white dark:bg-[#0a3831] rounded-xl border border-emerald-100 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs active:scale-95 transition-transform">+10%</button>
                     <button onClick={() => adjustAmount(-5)} className="flex-1 py-3 bg-white dark:bg-[#0a3831] rounded-xl border border-emerald-100 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs active:scale-95 transition-transform">-5%</button>
                </div>

                <button 
                    onClick={() => onSave(amount, monthKey)} 
                    disabled={!canSave}
                    className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                >
                    <Save size={20}/> Save Limit
                </button>
            </div>
        </div>
    )
};