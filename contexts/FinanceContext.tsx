
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, BudgetMap, Subscription, Goal, Debt, BackupData } from '../types';
import { INITIAL_TRANSACTIONS, INITIAL_BUDGETS, INITIAL_SUBSCRIPTIONS, INITIAL_GOALS, INITIAL_DEBTS } from '../constants';
import { saveAttachment, deleteAttachment, clearDB, getAllAttachments, restoreAttachments } from '../utils/db';

interface FinanceContextType {
  // State
  transactions: Transaction[];
  budgets: BudgetMap;
  subscriptions: Subscription[];
  goals: Goal[];
  debts: Debt[];
  dataError: boolean; // Flag for Safe Mode
  isOnboarded: boolean;
  
  // Actions
  addTransaction: (tx: Transaction) => Promise<void>;
  updateTransaction: (tx: Transaction) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  importTransactions: (txs: Transaction[]) => void;
  
  updateBudget: (amount: number, monthKey: string) => void;
  
  addSubscription: (sub: Subscription) => void;
  updateSubscription: (sub: Subscription) => void;
  deleteSubscription: (id: string) => void;
  
  addGoal: (goal: Goal) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  
  addDebt: (debt: Debt) => void;
  updateDebt: (debt: Debt) => void;
  deleteDebt: (id: string) => void;

  resetData: () => Promise<void>;
  createBackup: () => Promise<void>;
  restoreBackup: (file: File) => Promise<void>;
  completeOnboarding: (clearData?: boolean, initialBudget?: number) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Helper to prevent IDB hangs from blocking UI updates
const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms))
    ]);
};

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dataError, setDataError] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);

  // Initialize with Defaults (Safe, Synchronous)
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [budgets, setBudgets] = useState<BudgetMap>(INITIAL_BUDGETS);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(INITIAL_SUBSCRIPTIONS);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [debts, setDebts] = useState<Debt[]>(INITIAL_DEBTS);

  // --- LOAD DATA EFFECT ---
  useEffect(() => {
    const loadData = () => {
        try {
            if (typeof window === 'undefined') return;

            const onboarded = localStorage.getItem('emerald_onboarded');
            if (onboarded) setIsOnboarded(JSON.parse(onboarded));

            const txRaw = localStorage.getItem('emerald_transactions');
            if (txRaw) setTransactions(JSON.parse(txRaw));

            const budgetsRaw = localStorage.getItem('emerald_budgets');
            if (budgetsRaw) setBudgets(JSON.parse(budgetsRaw));

            const subsRaw = localStorage.getItem('emerald_subscriptions');
            if (subsRaw) setSubscriptions(JSON.parse(subsRaw));

            const goalsRaw = localStorage.getItem('emerald_goals');
            if (goalsRaw) setGoals(JSON.parse(goalsRaw));

            const debtsRaw = localStorage.getItem('emerald_debts');
            if (debtsRaw) setDebts(JSON.parse(debtsRaw));

            // Mark as initialized so persistence can start
            setIsInitialized(true);
        } catch (e) {
            console.error("CRITICAL: Data Corruption Detected", e);
            setDataError(true);
        }
    };
    loadData();
  }, []);

  // --- PERSISTENCE EFFECTS ---
  
  useEffect(() => { 
      if (isInitialized && !dataError) localStorage.setItem('emerald_budgets', JSON.stringify(budgets)); 
  }, [budgets, isInitialized, dataError]);
  
  useEffect(() => { 
      if (isInitialized && !dataError) {
          const safeTransactions = transactions.map(t => {
              const { attachment, ...rest } = t; 
              return rest;
          });
          localStorage.setItem('emerald_transactions', JSON.stringify(safeTransactions)); 
      }
  }, [transactions, isInitialized, dataError]);
  
  useEffect(() => { if (isInitialized && !dataError) localStorage.setItem('emerald_subscriptions', JSON.stringify(subscriptions)); }, [subscriptions, isInitialized, dataError]);
  useEffect(() => { if (isInitialized && !dataError) localStorage.setItem('emerald_goals', JSON.stringify(goals)); }, [goals, isInitialized, dataError]);
  useEffect(() => { if (isInitialized && !dataError) localStorage.setItem('emerald_debts', JSON.stringify(debts)); }, [debts, isInitialized, dataError]);
  useEffect(() => { if (isInitialized && !dataError) localStorage.setItem('emerald_onboarded', JSON.stringify(isOnboarded)); }, [isOnboarded, isInitialized, dataError]);

  // --- ACTIONS ---
  
  const completeOnboarding = (clearData = false, initialBudget = 0) => {
      if (clearData) {
          setTransactions([]);
          // Initialize budget with user's choice instead of empty object
          setBudgets(initialBudget ? { 'default': initialBudget } : {});
          setSubscriptions([]);
          setGoals([]);
          setDebts([]);
      } else if (initialBudget > 0) {
          // If keeping data, still update the budget
          setBudgets(prev => ({ ...prev, 'default': initialBudget }));
      }
      setIsOnboarded(true);
  };

  const addTransaction = async (tx: Transaction) => {
      if (tx.attachment) {
          await saveAttachment(tx.id, tx.attachment);
      }
      const optimizedTx = { ...tx, attachment: undefined, hasAttachment: !!tx.attachment };
      setTransactions(prev => [optimizedTx, ...prev]);
  };

  const updateTransaction = async (tx: Transaction) => {
      if (tx.attachment) {
          await saveAttachment(tx.id, tx.attachment);
      }
      const optimizedTx = { ...tx, attachment: undefined, hasAttachment: !!tx.attachment || !!tx.hasAttachment };
      setTransactions(prev => prev.map(t => t.id === tx.id ? optimizedTx : t));
  };

  const deleteTransaction = async (id: number) => {
      // 1. Update UI State IMMEDIATELY (Optimistic Update)
      // This ensures the transaction disappears from the list instantly
      setTransactions(prev => prev.filter(t => t.id !== id));

      // 2. Attempt background cleanup of attachments
      try {
        // We don't await this for the UI, but we trigger it.
        // Using withTimeout just in case we decide to wait in future logic,
        // but strictly speaking, we can let this run loose or log errors.
        await withTimeout(deleteAttachment(id), 500);
      } catch (e) {
        console.warn("Attachment cleanup background error (non-critical)", e);
      }
  };

  const importTransactions = (txs: Transaction[]) => {
      setTransactions(prev => [...txs, ...prev]);
  };

  const updateBudget = (amount: number, monthKey: string) => {
      setBudgets(prev => ({ ...prev, [monthKey]: amount }));
  };

  const addSubscription = (sub: Subscription) => setSubscriptions(prev => [...prev, sub]);
  const updateSubscription = (sub: Subscription) => setSubscriptions(prev => prev.map(s => s.id === sub.id ? sub : s));
  const deleteSubscription = (id: string) => setSubscriptions(prev => prev.filter(s => s.id !== id));

  const addGoal = (goal: Goal) => setGoals(prev => [...prev, goal]);
  const updateGoal = (goal: Goal) => setGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
  const deleteGoal = (id: string) => setGoals(prev => prev.filter(g => g.id !== id));

  const addDebt = (debt: Debt) => setDebts(prev => [...prev, debt]);
  const updateDebt = (debt: Debt) => setDebts(prev => prev.map(d => d.id === debt.id ? debt : d));
  const deleteDebt = (id: string) => setDebts(prev => prev.filter(d => d.id !== id));

  const resetData = async () => {
      // STOP PERSISTENCE IMMEDIATELY
      setIsInitialized(false);
      
      // Clear all storage sync
      localStorage.clear();
      
      // Attempt DB clear, but don't block indefinitely
      try {
          await withTimeout(clearDB(), 1000);
      } catch (e) {
          console.error("Failed to clear IndexedDB (timeout/error)", e);
      }
      
      window.location.reload();
  };

  const createBackup = async () => {
      try {
          const attachments = await getAllAttachments();
          const backup: BackupData = {
              version: 1,
              timestamp: new Date().toISOString(),
              transactions,
              budgets,
              subscriptions,
              goals,
              debts,
              attachments,
              theme: {
                  isDark: JSON.parse(localStorage.getItem('emerald_theme') || 'false'),
                  currency: localStorage.getItem('emerald_currency') || '₹'
              }
          };
          const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `emerald_backup_${new Date().toISOString().split('T')[0]}.json`;
          a.click();
      } catch (e) {
          console.error("Backup failed", e);
          alert("Failed to create backup.");
      }
  };

  const restoreBackup = async (file: File) => {
      try {
          const text = await file.text();
          const data = JSON.parse(text) as BackupData;
          
          if (!data.transactions || !data.timestamp) throw new Error("Invalid backup file format");

          localStorage.clear();
          
          localStorage.setItem('emerald_transactions', JSON.stringify(data.transactions));
          localStorage.setItem('emerald_budgets', JSON.stringify(data.budgets));
          localStorage.setItem('emerald_subscriptions', JSON.stringify(data.subscriptions));
          localStorage.setItem('emerald_goals', JSON.stringify(data.goals));
          localStorage.setItem('emerald_debts', JSON.stringify(data.debts));
          localStorage.setItem('emerald_onboarded', 'true');
          
          if (data.theme) {
              localStorage.setItem('emerald_theme', JSON.stringify(data.theme.isDark));
              localStorage.setItem('emerald_currency', data.theme.currency);
          }

          if (data.attachments) {
              await restoreAttachments(data.attachments);
          } else {
              await clearDB();
          }

          alert("Backup restored successfully. The app will now reload.");
          window.location.reload();
      } catch (e) {
          console.error("Restore failed", e);
          alert("Failed to restore backup. The file may be corrupt or invalid.");
      }
  };

  return (
    <FinanceContext.Provider value={{
      transactions, budgets, subscriptions, goals, debts, dataError, isOnboarded,
      addTransaction, updateTransaction, deleteTransaction, importTransactions,
      updateBudget,
      addSubscription, updateSubscription, deleteSubscription,
      addGoal, updateGoal, deleteGoal,
      addDebt, updateDebt, deleteDebt,
      resetData, createBackup, restoreBackup, completeOnboarding
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};
