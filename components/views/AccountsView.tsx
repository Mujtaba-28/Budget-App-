
import React, { useRef } from 'react';
import { Upload, Download, Settings, ChevronDown, Repeat, Wallet, Target, TrendingDown, Save, FolderOpen, FileText } from 'lucide-react';
import { Transaction } from '../../types';
import { useFinance } from '../../contexts/FinanceContext';
import { useTheme } from '../../contexts/ThemeContext';
import { parseCSV } from '../../utils';
import { generateMonthlyReport } from '../../utils/pdf';

interface AccountsViewProps {
  onOpenSettings: () => void;
  onOpenSubscriptions: () => void;
  onOpenGoals: () => void;
  onOpenDebts: () => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({ onOpenSettings, onOpenSubscriptions, onOpenGoals, onOpenDebts }) => {
    const { transactions, budgets, importTransactions, createBackup, restoreBackup } = useFinance();
    const { currency } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const backupInputRef = useRef<HTMLInputElement>(null);

    const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const parsed = parseCSV(text);
            if (parsed.length > 0) {
                // Merge with existing, assigning new IDs
                const newTxs = parsed.map((p, idx) => ({
                    id: Date.now() + idx,
                    title: p.title || 'Imported',
                    category: p.category || 'Other',
                    amount: p.amount || 0,
                    date: p.date || new Date().toISOString(),
                    type: p.type || 'expense'
                } as Transaction));
                importTransactions(newTxs);
                alert(`Successfully imported ${newTxs.length} transactions.`);
            } else {
                alert('Failed to parse CSV. Please ensure it has valid headers.');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (window.confirm("Restoring a backup will OVERWRITE all current data. Are you sure?")) {
                restoreBackup(file);
            }
        }
        e.target.value = '';
    };

    const handleGenerateReport = () => {
        generateMonthlyReport(transactions, budgets, new Date(), currency);
    };

    return (
        <div className="animate-in fade-in duration-500 space-y-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-emerald-950 dark:text-emerald-50">Accounts</h2>
            <div className="bg-white dark:bg-[#0a3831] p-6 rounded-[2.5rem] shadow-sm border border-emerald-100 dark:border-emerald-800/30 flex flex-col items-center text-center relative overflow-hidden">
                <div className="relative w-24 h-24 mb-4 group">
                    <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Mujtaba" alt="Avatar" className="w-full h-full rounded-full bg-emerald-50 object-cover" />
                    <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer">
                        <span className="text-white text-xs font-bold">Edit</span>
                    </div>
                </div>
                <h3 className="text-xl font-bold text-emerald-950 dark:text-emerald-50">Mujtaba M</h3>
                <p className="text-slate-400 text-sm">mujtaba@example.com</p>
                <div className="mt-4 flex gap-4">
                    <div className="text-center">
                        <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">{transactions.length}</p>
                        <p className="text-[10px] uppercase text-slate-400 font-bold">Entries</p>
                    </div>
                </div>
            </div>
            
            <h3 className="font-bold text-lg text-emerald-950 dark:text-emerald-50 px-2">Data & Planning</h3>

            <div className="grid grid-cols-2 gap-4">
                <button onClick={onOpenGoals} aria-label="Savings Goals" className="col-span-2 p-4 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20 flex items-center justify-between active:scale-95 transition-transform">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl"><Target size={20}/></div>
                        <div className="text-left">
                            <span className="block text-sm font-bold">Savings Goals</span>
                            <span className="block text-[10px] opacity-80">Track your dreams</span>
                        </div>
                    </div>
                    <ChevronDown className="-rotate-90 opacity-60" size={20} />
                </button>

                <button onClick={onOpenDebts} aria-label="Debt Planner" className="col-span-2 p-4 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-500/20 flex items-center justify-between active:scale-95 transition-transform">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl"><TrendingDown size={20}/></div>
                        <div className="text-left">
                            <span className="block text-sm font-bold">Debt Planner</span>
                            <span className="block text-[10px] opacity-80">Snowball / Avalanche</span>
                        </div>
                    </div>
                    <ChevronDown className="-rotate-90 opacity-60" size={20} />
                </button>

                <button onClick={onOpenSubscriptions} aria-label="Manage Subscriptions" className="col-span-2 p-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-between active:scale-95 transition-transform">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl"><Repeat size={20}/></div>
                        <div className="text-left">
                            <span className="block text-sm font-bold">Subscriptions</span>
                            <span className="block text-[10px] opacity-80">Manage recurring bills</span>
                        </div>
                    </div>
                    <ChevronDown className="-rotate-90 opacity-60" size={20} />
                </button>

                {/* BACKUP & RESTORE SECTION */}
                <div className="col-span-2 grid grid-cols-2 gap-4 pt-2 border-t border-emerald-100 dark:border-emerald-800/30">
                    <button onClick={createBackup} aria-label="Full Backup" className="p-4 bg-white dark:bg-[#0a3831] rounded-2xl border border-emerald-100 dark:border-emerald-800/30 flex flex-col items-center gap-2 active:scale-95 transition-transform hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                        <div className="p-2 bg-teal-50 text-teal-600 rounded-xl"><Save size={20}/></div>
                        <span className="text-xs font-bold text-emerald-900 dark:text-emerald-100">Full Backup</span>
                    </button>

                    <button onClick={() => backupInputRef.current?.click()} aria-label="Restore Backup" className="p-4 bg-white dark:bg-[#0a3831] rounded-2xl border border-emerald-100 dark:border-emerald-800/30 flex flex-col items-center gap-2 active:scale-95 transition-transform hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><FolderOpen size={20}/></div>
                        <span className="text-xs font-bold text-emerald-900 dark:text-emerald-100">Restore</span>
                        <input type="file" ref={backupInputRef} onChange={handleRestoreBackup} accept=".json" className="hidden" />
                    </button>
                </div>
                
                {/* PDF REPORT */}
                <button onClick={handleGenerateReport} aria-label="Export PDF" className="col-span-2 p-4 bg-white dark:bg-[#0a3831] rounded-2xl border border-emerald-100 dark:border-emerald-800/30 flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                    <FileText size={20} className="text-rose-500"/>
                    <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Download Monthly Report (PDF)</span>
                </button>

                {/* LEGACY CSV EXPORT/IMPORT */}
                <button onClick={() => {}} aria-label="Export CSV" className="p-4 bg-white dark:bg-[#0a3831] rounded-2xl border border-emerald-100 dark:border-emerald-800/30 flex flex-col items-center gap-2 active:scale-95 transition-transform hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Upload size={20}/></div>
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-100">Export CSV</span>
                </button>

                <button onClick={() => fileInputRef.current?.click()} aria-label="Import CSV" className="p-4 bg-white dark:bg-[#0a3831] rounded-2xl border border-emerald-100 dark:border-emerald-800/30 flex flex-col items-center gap-2 active:scale-95 transition-transform hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-xl"><Download size={20}/></div>
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-100">Import CSV</span>
                    <input type="file" ref={fileInputRef} onChange={handleImportData} accept=".csv" className="hidden" />
                </button>
            </div>

            <div className="space-y-3">
                <button onClick={onOpenSettings} aria-label="Open Settings" className="w-full p-4 bg-white dark:bg-[#0a3831] rounded-2xl border border-emerald-100 dark:border-emerald-800/30 flex items-center justify-between active:scale-98 transition-transform hover:bg-emerald-50 dark:hover:bg-emerald-900/20 group">
                    <div className="flex items-center gap-3">
                        {/* Enhanced Contrast for Dark Mode */}
                        <div className="p-2 rounded-xl bg-slate-100 text-slate-600 dark:bg-emerald-600 dark:text-emerald-50 group-hover:scale-110 transition-transform shadow-sm">
                            <Settings size={20} />
                        </div>
                        <span className="font-bold text-emerald-900 dark:text-emerald-100">Settings</span>
                    </div>
                    <ChevronDown className="-rotate-90 text-slate-300" size={20} />
                </button>
            </div>
        </div>
    )
};