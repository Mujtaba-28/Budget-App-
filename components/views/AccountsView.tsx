
import React, { useRef, useState } from 'react';
import { Upload, Download, Settings, ChevronRight, Save, FolderOpen, FileText, Edit2, RefreshCw, Trash2, ShieldCheck, Clock, Check } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { useTheme } from '../../contexts/ThemeContext';
import { parseCSV, triggerHaptic, formatDate } from '../../utils';
import { generateMonthlyReport } from '../../utils/pdf';
import { Transaction } from '../../types';

interface AccountsViewProps {
  onOpenSettings: () => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({ onOpenSettings }) => {
    const { transactions, budgets, importTransactions, createBackup, restoreBackup, userName, setUserName, lastBackupDate, resetData } = useFinance();
    const { currency } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const backupInputRef = useRef<HTMLInputElement>(null);

    // Edit Profile State
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(userName);
    const [avatarSeed, setAvatarSeed] = useState(userName);

    const handleSaveProfile = () => {
        if (tempName.trim()) {
            setUserName(tempName);
            // In a real app we'd save the avatar seed too, but here we derive it from name or temp seed
            triggerHaptic(20);
            setIsEditing(false);
        }
    };

    const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const parsed = parseCSV(text);
            if (parsed.length > 0) {
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
                triggerHaptic(20);
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
        triggerHaptic(10);
    };

    const handleResetApp = () => {
        if (window.confirm("ARE YOU SURE? This will permanently delete ALL transactions, goals, and settings. This cannot be undone.")) {
            triggerHaptic(50);
            resetData();
        }
    };

    return (
        <div className="animate-in fade-in duration-500 space-y-6 max-w-md mx-auto pb-10">
            <h2 className="text-2xl font-bold text-emerald-950 dark:text-emerald-50">Profile</h2>
            
            {/* Identity Card */}
            <div className="bg-white dark:bg-[#0a3831] p-6 rounded-[2.5rem] shadow-sm border border-emerald-100 dark:border-emerald-800/30 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-10 dark:opacity-20"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="relative mb-4">
                        <div className="w-28 h-28 rounded-full bg-white dark:bg-[#021c17] p-1 shadow-xl">
                            <img 
                                src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${isEditing ? avatarSeed : userName}&backgroundColor=b6e3f4`} 
                                alt="Avatar" 
                                className="w-full h-full rounded-full object-cover" 
                            />
                        </div>
                        {isEditing && (
                            <button 
                                onClick={() => { setAvatarSeed(Math.random().toString(36)); triggerHaptic(5); }}
                                className="absolute bottom-0 right-0 p-2 bg-indigo-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                            >
                                <RefreshCw size={14} />
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="flex items-center gap-2 mb-2 animate-in zoom-in">
                            <input 
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                className="bg-slate-100 dark:bg-black/30 px-3 py-1 rounded-xl font-bold text-center text-lg outline-none border-2 border-emerald-500 w-40"
                                autoFocus
                            />
                            <button onClick={handleSaveProfile} className="p-2 bg-emerald-500 text-white rounded-full">
                                <Check size={16} strokeWidth={3} />
                            </button>
                        </div>
                    ) : (
                        <h3 className="text-2xl font-black text-emerald-950 dark:text-emerald-50 mb-1 flex items-center gap-2">
                            {userName}
                            <button onClick={() => { setTempName(userName); setAvatarSeed(userName); setIsEditing(true); triggerHaptic(5); }} className="opacity-30 hover:opacity-100 transition-opacity">
                                <Edit2 size={16} />
                            </button>
                        </h3>
                    )}
                    
                    <p className="text-slate-400 text-sm font-medium mb-6">{userName.toLowerCase().replace(/\s/g, '')}@emerald.app</p>

                    <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-2xl flex flex-col items-center">
                            <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">{transactions.length}</span>
                            <span className="text-[10px] uppercase font-bold text-emerald-900/40 dark:text-emerald-100/40 tracking-wider">Entries</span>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-2xl flex flex-col items-center">
                            <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                                {new Date().toLocaleDateString(undefined, {month:'short', year:'2-digit'})}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-emerald-900/40 dark:text-emerald-100/40 tracking-wider">Joined</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Settings Trigger */}
            <button 
                onClick={() => { onOpenSettings(); triggerHaptic(10); }}
                className="w-full p-4 bg-white dark:bg-[#0a3831] rounded-2xl border border-emerald-100 dark:border-emerald-800/30 flex items-center justify-between active:scale-[0.98] transition-all hover:shadow-md group"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <Settings size={20} />
                    </div>
                    <div className="text-left">
                        <h4 className="font-bold text-emerald-950 dark:text-emerald-50">Preferences</h4>
                        <p className="text-xs text-slate-400">Theme, Currency, Security</p>
                    </div>
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </button>

            {/* Data Management Grid */}
            <div className="space-y-3">
                <h3 className="font-bold text-sm text-emerald-900/50 dark:text-emerald-100/50 uppercase tracking-widest px-2">Data Control</h3>
                
                <div className="bg-white dark:bg-[#0a3831] p-2 rounded-3xl border border-emerald-100 dark:border-emerald-800/30">
                    {/* Backup Status */}
                    <div className="flex items-center gap-2 px-4 py-3 mb-2 border-b border-slate-50 dark:border-emerald-900/20">
                        {lastBackupDate ? <ShieldCheck size={14} className="text-emerald-500"/> : <Clock size={14} className="text-amber-500"/>}
                        <span className="text-xs font-bold text-slate-400">
                            Last Backup: {lastBackupDate ? formatDate(lastBackupDate) : 'Never'}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => { createBackup(); triggerHaptic(20); }} className="p-4 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-2xl flex flex-col items-center gap-2 transition-colors">
                            <Save size={24} className="text-emerald-600 dark:text-emerald-400"/>
                            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-100">Backup</span>
                        </button>
                        
                        <button onClick={() => { backupInputRef.current?.click(); triggerHaptic(10); }} className="p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-2xl flex flex-col items-center gap-2 transition-colors">
                            <FolderOpen size={24} className="text-blue-600 dark:text-blue-400"/>
                            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-100">Restore</span>
                            <input type="file" ref={backupInputRef} onChange={handleRestoreBackup} accept=".json" className="hidden" />
                        </button>

                         <button onClick={() => { handleGenerateReport(); }} className="p-4 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-2xl flex flex-col items-center gap-2 transition-colors">
                            <FileText size={24} className="text-indigo-600 dark:text-indigo-400"/>
                            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-100">PDF Report</span>
                        </button>

                        <div className="flex flex-col gap-2">
                             <button onClick={() => { triggerHaptic(10); }} className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-center gap-2">
                                <Upload size={14} className="text-slate-400"/>
                                <span className="text-[10px] font-bold text-slate-500">Export CSV</span>
                             </button>
                             <button onClick={() => { fileInputRef.current?.click(); triggerHaptic(10); }} className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-center gap-2 relative">
                                <Download size={14} className="text-slate-400"/>
                                <span className="text-[10px] font-bold text-slate-500">Import CSV</span>
                                <input type="file" ref={fileInputRef} onChange={handleImportData} accept=".csv" className="absolute inset-0 opacity-0" />
                             </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-4">
                <button 
                    onClick={handleResetApp}
                    className="w-full py-4 border-2 border-dashed border-rose-200 dark:border-rose-900/50 rounded-2xl text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 hover:border-rose-300 transition-all font-bold text-xs flex items-center justify-center gap-2"
                >
                    <Trash2 size={16}/> Reset Application Data
                </button>
                <p className="text-center text-[10px] text-slate-300 dark:text-slate-600 mt-4 font-bold uppercase tracking-widest">
                    Emerald Finance v1.2.0 • Local Storage Only
                </p>
            </div>
        </div>
    )
};
