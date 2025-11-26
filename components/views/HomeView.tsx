import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Edit2, Wallet, Target, ArrowDownLeft, ArrowUpRight, ArrowRight } from 'lucide-react';
import { Transaction } from '../../types';
import { TransactionItem } from '../TransactionItem';
import { formatMoney } from '../../utils';
import { useFinance } from '../../contexts/FinanceContext';
import { useTheme } from '../../contexts/ThemeContext';

interface HomeViewProps {
  currentDate: Date;
  changeMonth: (offset: number) => void;
  totalBudget: number;
  onEditBudget: () => void;
  onEditTx: (tx: Transaction) => void;
  onGoToStats: () => void;
  onViewHistory: () => void;
  isPrivacyMode: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({ 
  currentDate, changeMonth, totalBudget, onEditBudget, onEditTx, 
  onGoToStats, onViewHistory, isPrivacyMode 
}) => {
    const { transactions } = useFinance();
    const { currency } = useTheme();
    const [filterType, setFilterType] = useState('all');
    
    // Derived Calculations
    const monthlyTransactions = useMemo(() => {
        return transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === currentDate.getMonth() && tDate.getFullYear() === currentDate.getFullYear();
        });
    }, [transactions, currentDate]);

    const totalIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const remainingBudget = totalBudget - totalExpense;
    const budgetProgress = Math.min((totalExpense / totalBudget) * 100, 100);

    const displayTransactions = (filterType === 'all' ? monthlyTransactions : monthlyTransactions.filter(t => t.type === filterType))
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    const handleFilterClick = (type: string) => setFilterType(prev => prev === type ? 'all' : type);

    const currentMonthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
        <div className="space-y-6 max-w-md mx-auto">
            
            {/* Month Selector */}
            <div className="flex items-center justify-between bg-white dark:bg-[#0a3831] p-4 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-800/30">
                <button onClick={() => changeMonth(-1)} aria-label="Previous Month" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><ChevronLeft size={20} className="text-emerald-900 dark:text-emerald-100"/></button>
                <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-50 flex items-center gap-2">
                    <CalendarIcon size={18} className="text-emerald-600"/>
                    {currentMonthName}
                </h2>
                <button onClick={() => changeMonth(1)} aria-label="Next Month" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><ChevronRight size={20} className="text-emerald-900 dark:text-emerald-100"/></button>
            </div>

            {/* Budget Card */}
            <div className="w-full relative rounded-[2.5rem] p-6 text-white shadow-xl shadow-emerald-900/20 overflow-hidden group animate-in zoom-in-95 duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-900 z-0"></div>
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.4)_1px,transparent_0)] bg-[length:24px_24px]"></div>
              
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex justify-between items-start">
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider opacity-80">Total Budget</p>
                        <button onClick={onEditBudget} aria-label="Edit Budget" className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                            <Edit2 size={10} className="text-emerald-100"/>
                        </button>
                      </div>
                      <h1 className="text-xl font-bold tracking-tight text-emerald-50 flex items-center gap-1">
                        {formatMoney(totalBudget, currency, isPrivacyMode)}
                      </h1>
                   </div>
                   <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <Wallet className="text-emerald-100" />
                   </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                   <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Remaining</p>
                   <h2 className="text-5xl font-black tracking-tight text-white flex items-center gap-1 drop-shadow-md">
                     {isPrivacyMode ? '****' : <><span className="text-3xl opacity-50 mt-1">{currency}</span>{remainingBudget.toLocaleString('en-IN')}</>}
                   </h2>
                </div>
              </div>
            </div>

            {/* Monthly Limit Link */}
            <div onClick={onGoToStats} className="cursor-pointer active:scale-[0.98] transition-transform animate-in slide-in-from-right-4 duration-500 delay-100">
               <div className="p-5 rounded-3xl bg-white dark:bg-[#0a3831] shadow-lg border border-emerald-100 dark:border-emerald-800/50 relative overflow-hidden group">
                  <div className="flex justify-between items-end mb-3">
                     <span className="text-emerald-900 dark:text-emerald-50 font-bold flex items-center gap-2">
                       <Target size={18} className="text-amber-500"/> Monthly Limit
                     </span>
                     <span className={`text-xs font-bold px-2 py-1 rounded-lg ${remainingBudget < 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'}`}>
                       {remainingBudget < 0 ? 'Over Budget!' : `${Math.round(100 - budgetProgress)}% Left`}
                     </span>
                  </div>
                  
                  <div className="h-4 w-full bg-slate-100 dark:bg-black/40 rounded-full overflow-hidden mb-2">
                     <div 
                        className={`h-full rounded-full transition-all duration-1000 ${remainingBudget < 0 ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-400 to-teal-600'}`}
                        style={{ width: `${budgetProgress}%` }}
                     ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs font-medium text-slate-400 dark:text-slate-500">
                     <span>Spent: {formatMoney(totalExpense, currency, isPrivacyMode)}</span>
                     <span>Limit: {formatMoney(totalBudget, currency, isPrivacyMode)}</span>
                  </div>
               </div>
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-left-4 duration-500 delay-200">
               <button onClick={() => handleFilterClick('income')} className={`p-4 rounded-3xl border transition-all duration-300 text-left relative overflow-hidden group ${filterType === 'income' ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-white dark:bg-[#0a3831] border-emerald-100 dark:border-emerald-800/50'}`}>
                 <div className="relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${filterType === 'income' ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400'}`}><ArrowDownLeft size={20} strokeWidth={2.5}/></div>
                    <p className={`text-xs font-bold mb-1 ${filterType === 'income' ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'}`}>INCOME</p>
                    <p className={`text-lg font-bold ${filterType === 'income' ? 'text-white' : 'text-emerald-900 dark:text-white'}`}>{formatMoney(totalIncome, currency, isPrivacyMode)}</p>
                 </div>
               </button>
               <button onClick={() => handleFilterClick('expense')} className={`p-4 rounded-3xl border transition-all duration-300 text-left relative overflow-hidden group ${filterType === 'expense' ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/30' : 'bg-white dark:bg-[#0a3831] border-emerald-100 dark:border-emerald-800/50'}`}>
                 <div className="relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${filterType === 'expense' ? 'bg-white/20 text-white' : 'bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-400'}`}><ArrowUpRight size={20} strokeWidth={2.5}/></div>
                    <p className={`text-xs font-bold mb-1 ${filterType === 'expense' ? 'text-rose-100' : 'text-slate-500 dark:text-slate-400'}`}>EXPENSE</p>
                    <p className={`text-lg font-bold ${filterType === 'expense' ? 'text-white' : 'text-emerald-900 dark:text-white'}`}>{formatMoney(totalExpense, currency, isPrivacyMode)}</p>
                 </div>
               </button>
            </div>

            {/* Recent Transactions */}
            <div className="animate-in slide-in-from-bottom-8 duration-500 delay-300">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">Recent Transactions</h3>
                  <button onClick={onViewHistory} aria-label="View Transaction History" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 opacity-80 hover:opacity-100 flex items-center gap-1">
                      View All <ArrowRight size={12} />
                  </button>
               </div>
               <div className="space-y-3 pb-8">
                  {displayTransactions.map((tx) => (
                    <TransactionItem key={tx.id} tx={tx} onClick={onEditTx} currency={currency} isPrivacyMode={isPrivacyMode} />
                  ))}
                  {displayTransactions.length === 0 && <div className="text-center py-10 opacity-50 text-emerald-900 dark:text-emerald-100">No transactions found.</div>}
               </div>
            </div>
        </div>
    );
};