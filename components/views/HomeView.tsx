import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Edit2, Wallet, Target, ArrowDownLeft, ArrowUpRight, ArrowRight, ShieldAlert, DownloadCloud, X, Zap, Check } from 'lucide-react';
import { Transaction } from '../../types';
import { TransactionItem } from '../TransactionItem';
import { formatMoney, triggerHaptic, calculateNextDate } from '../../utils';
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
    const { transactions, createBackup, lastBackupDate, subscriptions, addTransaction, updateSubscription } = useFinance();
    const { currency } = useTheme();
    const [filterType, setFilterType] = useState('all');
    const [showBackupAlert, setShowBackupAlert] = useState(false);

    // Backup Health Check Effect
    useEffect(() => {
        // Only annoy users who actually have data to lose (> 5 transactions)
        if (transactions.length > 5) {
            if (!lastBackupDate) {
                setShowBackupAlert(true); // Never backed up
            } else {
                const diff = new Date().getTime() - new Date(lastBackupDate).getTime();
                const daysSince = diff / (1000 * 3600 * 24);
                if (daysSince > 7) {
                    setShowBackupAlert(true);
                }
            }
        }
    }, [transactions.length, lastBackupDate]);
    
    // Check for Due Subscriptions
    const dueSubscription = useMemo(() => {
        const today = new Date();
        today.setHours(0,0,0,0);
        
        // Sort by due date, filter for ones due today/tomorrow or overdue
        const due = subscriptions.filter(sub => {
            const nextDate = new Date(sub.nextBillingDate);
            nextDate.setHours(0,0,0,0);
            const diffTime = nextDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 1; // Due today, tomorrow, or overdue
        }).sort((a,b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());

        return due.length > 0 ? due[0] : null;
    }, [subscriptions]);

    const handlePaySubscription = async () => {
        if (!dueSubscription) return;
        
        // 1. Create Transaction
        await addTransaction({
            id: Date.now(),
            title: dueSubscription.name,
            amount: dueSubscription.amount,
            category: dueSubscription.category || 'Bills',
            date: new Date().toISOString(),
            type: 'expense'
        });

        // 2. Update Next Billing Date
        const newNextDate = calculateNextDate(dueSubscription.nextBillingDate, dueSubscription.billingCycle);
        updateSubscription({
            ...dueSubscription,
            nextBillingDate: newNextDate
        });

        triggerHaptic(20);
    };

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

    const handleFilterClick = (type: string) => {
        triggerHaptic(5);
        setFilterType(prev => prev === type ? 'all' : type);
    };

    const currentMonthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
        <div className="space-y-6 max-w-md mx-auto">
            
            {/* SMART SUBSCRIPTION REMINDER */}
            {dueSubscription && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-700/30 rounded-3xl animate-in slide-in-from-top-4 duration-500 shadow-sm relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Zap size={80} className="text-indigo-500" />
                    </div>
                    <div className="flex gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                            <Zap size={22} fill="currentColor" />
                        </div>
                        <div className="flex-1">
                             <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-indigo-950 dark:text-indigo-50 text-sm">Upcoming Bill</h3>
                                <span className="text-[10px] font-bold bg-white/60 dark:bg-black/30 px-2 py-0.5 rounded-lg text-indigo-800 dark:text-indigo-200">
                                    {new Date(dueSubscription.nextBillingDate).toDateString() === new Date().toDateString() ? 'Due Today' : 'Due Tomorrow'}
                                </span>
                            </div>
                            <p className="text-2xl font-black text-indigo-900 dark:text-indigo-100 mb-3">
                                {formatMoney(dueSubscription.amount, currency, isPrivacyMode)}
                                <span className="text-sm font-medium opacity-60 ml-1">for {dueSubscription.name}</span>
                            </p>
                            <button 
                                onClick={handlePaySubscription}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-lg shadow-indigo-600/20"
                            >
                                <Check size={14} strokeWidth={3} /> Pay Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SMART BACKUP REMINDER */}
            {showBackupAlert && !dueSubscription && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/30 rounded-3xl animate-in slide-in-from-top-4 duration-500 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <ShieldAlert size={80} className="text-amber-500" />
                    </div>
                    <div className="flex gap-4 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                            <ShieldAlert size={20} />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-amber-900 dark:text-amber-100 text-sm mb-1">Data Safety Check</h3>
                                <button onClick={() => setShowBackupAlert(false)} className="text-amber-400 hover:text-amber-600"><X size={16}/></button>
                            </div>
                            <p className="text-xs text-amber-800/70 dark:text-amber-200/60 font-medium mb-3">
                                You haven't backed up your finance data recently. Create a local backup now to prevent data loss.
                            </p>
                            <button 
                                onClick={() => { createBackup(); setShowBackupAlert(false); }}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors active:scale-95"
                            >
                                <DownloadCloud size={14} /> Backup Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Month Selector */}
            <div className="flex items-center justify-between bg-white dark:bg-[#0a3831] p-4 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-800/30">
                <button onClick={() => { triggerHaptic(5); changeMonth(-1); }} aria-label="Previous Month" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><ChevronLeft size={20} className="text-emerald-900 dark:text-emerald-100"/></button>
                <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-50 flex items-center gap-2">
                    <CalendarIcon size={18} className="text-emerald-600"/>
                    {currentMonthName}
                </h2>
                <button onClick={() => { triggerHaptic(5); changeMonth(1); }} aria-label="Next Month" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><ChevronRight size={20} className="text-emerald-900 dark:text-emerald-100"/></button>
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