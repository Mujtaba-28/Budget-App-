
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Sparkles, AlertOctagon } from 'lucide-react';
import { Transaction } from './types';
import { HomeView } from './components/views/HomeView';
import { StatsView } from './components/views/StatsView';
import { HistoryView } from './components/views/HistoryView';
import { AccountsView } from './components/views/AccountsView';
import { Navigation } from './components/Navigation';
import { BudgetModal } from './components/modals/BudgetModal';
import { TransactionModal } from './components/modals/TransactionModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { SubscriptionsModal } from './components/modals/SubscriptionsModal';
import { GoalsModal } from './components/modals/GoalsModal';
import { DebtsModal } from './components/modals/DebtsModal';
import { AIChatModal } from './components/modals/AIChatModal';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { AppLock } from './components/security/AppLock';
import { useFinance } from './contexts/FinanceContext';
import { useTheme } from './contexts/ThemeContext';
import { useHashLocation } from './utils/router';

export default function App() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, budgets, updateBudget, dataError, isOnboarded } = useFinance();
  const { isDark, currency } = useTheme();
  
  // Hash Router
  const [activeTab, navigate] = useHashLocation();
  
  // Local UI State
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  
  // Modal Visibility State
  const [showTxModal, setShowTxModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSubsModal, setShowSubsModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showDebtsModal, setShowDebtsModal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Security State
  const [isLocked, setIsLocked] = useState(false);
  const [savedPin, setSavedPin] = useState<string | null>(null);

  useEffect(() => {
      const pin = localStorage.getItem('emerald_pin');
      if (pin) {
          setSavedPin(pin);
          setIsLocked(true);
      }
  }, []);

  // Derived Values for Home View
  const currentMonthKey = currentDate.getFullYear() + '-' + String(currentDate.getMonth() + 1).padStart(2, '0');
  const totalBudget = budgets[currentMonthKey] || budgets['default'] || 60000;

  const changeMonth = (offset: number) => {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + offset);
      setCurrentDate(newDate);
  };

  const changeBudgetMonth = (offset: number) => {
      const newDate = new Date(currentDate); 
      newDate.setMonth(newDate.getMonth() + offset);
      setCurrentDate(newDate);
  };

  const handleSaveTransaction = async (txData: Transaction) => {
    if (editingTx) await updateTransaction(txData);
    else await addTransaction(txData);
    setShowTxModal(false); setEditingTx(null);
  };

  const handleDeleteTransaction = (id: number) => {
    if (window.confirm("Are you sure you want to delete this transaction? This cannot be undone.")) {
        // Do not await here. Let the context handle it asynchronously/optimistically.
        deleteTransaction(id);
        setShowTxModal(false);
    }
  };

  const handleUpdateBudget = (newAmount: number, monthKey: string) => {
    updateBudget(newAmount, monthKey);
    setShowBudgetModal(false);
  };

  if (isLocked && savedPin) {
      return <div className={`${isDark ? 'dark' : ''}`}><AppLock savedPin={savedPin} onUnlock={() => setIsLocked(false)} /></div>;
  }

  if (dataError) {
      return (
          <div className="h-screen w-screen flex flex-col items-center justify-center bg-rose-50 text-rose-900 p-6 text-center">
              <AlertOctagon size={48} className="mb-4 text-rose-600"/>
              <h1 className="text-2xl font-bold mb-2">Data Integrity Error</h1>
              <p className="max-w-xs mx-auto mb-6">We detected a problem with your saved data. To prevent data loss, the app has entered Safe Mode.</p>
              <button 
                onClick={() => { localStorage.clear(); window.location.reload(); }} 
                className="bg-rose-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-rose-700 transition-colors"
              >
                  Reset App Data (Warning: Clears All)
              </button>
          </div>
      )
  }

  // --- RENDER ONBOARDING IF NEW USER ---
  if (!isOnboarded) {
      return (
          <div className={`${isDark ? 'dark' : ''}`}>
            <OnboardingWizard />
          </div>
      )
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'home':
        return (
          <HomeView 
            currentDate={currentDate}
            changeMonth={changeMonth}
            totalBudget={totalBudget}
            onEditBudget={() => setShowBudgetModal(true)}
            onEditTx={(tx) => { setEditingTx(tx); setShowTxModal(true); }}
            onGoToStats={() => navigate('stats')}
            onViewHistory={() => navigate('history')}
            isPrivacyMode={isPrivacyMode}
          />
        );
      case 'stats':
        return (
          <StatsView 
            isPrivacyMode={isPrivacyMode}
            currentDate={currentDate}
            changeMonth={changeMonth}
          />
        );
      case 'history':
        return <HistoryView onEditTx={(tx) => { setEditingTx(tx); setShowTxModal(true); }} isPrivacyMode={isPrivacyMode} />;
      case 'accounts':
        return (
            <AccountsView 
                onOpenSettings={() => setShowSettingsModal(true)} 
                onOpenSubscriptions={() => setShowSubsModal(true)}
                onOpenGoals={() => setShowGoalsModal(true)}
                onOpenDebts={() => setShowDebtsModal(true)}
            />
        );
      default:
        return (
          <HomeView 
            currentDate={currentDate}
            changeMonth={changeMonth}
            totalBudget={totalBudget}
            onEditBudget={() => setShowBudgetModal(true)}
            onEditTx={(tx) => { setEditingTx(tx); setShowTxModal(true); }}
            onGoToStats={() => navigate('stats')}
            onViewHistory={() => navigate('history')}
            isPrivacyMode={isPrivacyMode}
          />
        );
    }
  };

  return (
    <div className={`${isDark ? 'dark' : ''} transition-colors duration-300`}>
      <div className="h-screen w-screen bg-emerald-50 dark:bg-[#021c17] flex flex-col relative overflow-hidden text-slate-900 dark:text-emerald-50">
        
        {/* Header */}
        <div className="relative pt-12 px-6 flex justify-between items-center z-20 mb-6 shrink-0 max-w-md mx-auto w-full">
            <div className="flex items-center gap-3 cursor-pointer active:scale-95 transition-transform" onClick={() => navigate('accounts')}>
              <div className="w-12 h-12 rounded-full bg-emerald-100 overflow-hidden border border-emerald-200">
                 <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Mujtaba" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-600/70 dark:text-emerald-400/70 tracking-wider">Welcome</p>
                <h2 className="text-xl font-bold text-emerald-950 dark:text-emerald-50">Mujtaba M</h2>
              </div>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => setShowAIChat(true)}
                    aria-label="Open AI Assistant"
                    className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors backdrop-blur-sm"
                >
                    <Sparkles size={20} />
                </button>
                <button 
                    onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                    aria-label={isPrivacyMode ? "Show sensitive info" : "Hide sensitive info"}
                    className="p-3 rounded-full bg-white/50 dark:bg-black/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors text-emerald-800 dark:text-emerald-300 backdrop-blur-sm"
                >
                   {isPrivacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-32 px-6 scrollbar-hide z-10 w-full">
            {renderContent()}
        </div>
        
        <Navigation 
            activeTab={activeTab} 
            setActiveTab={navigate} 
            onAddClick={() => { setEditingTx(null); setShowTxModal(true); }}
        />
        
        {/* Modals */}
        {showTxModal && <TransactionModal onClose={() => setShowTxModal(false)} onSave={handleSaveTransaction} onDelete={handleDeleteTransaction} initialData={editingTx} currency={currency} />}
        
        {showBudgetModal && (
            <BudgetModal 
                currentBudget={totalBudget} 
                onSave={handleUpdateBudget} 
                onClose={() => setShowBudgetModal(false)} 
                currency={currency}
                currentDate={currentDate}
                changeBudgetMonth={changeBudgetMonth}
            />
        )}
        
        {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}
        {showSubsModal && <SubscriptionsModal onClose={() => setShowSubsModal(false)} />}
        {showGoalsModal && <GoalsModal onClose={() => setShowGoalsModal(false)} />}
        {showDebtsModal && <DebtsModal onClose={() => setShowDebtsModal(false)} />}
        {showAIChat && <AIChatModal onClose={() => setShowAIChat(false)} totalBudget={totalBudget} />}
      </div>
    </div>
  );
}
