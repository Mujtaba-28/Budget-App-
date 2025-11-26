

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Sparkles, AlertOctagon, LayoutGrid, LogOut } from 'lucide-react';
import { Transaction, BudgetContext } from './types';
import { HomeView } from './components/views/HomeView';
import { StatsView } from './components/views/StatsView';
import { HistoryView } from './components/views/HistoryView';
import { AccountsView } from './components/views/AccountsView';
import { PlanView } from './components/views/PlanView';
import { Navigation } from './components/Navigation';
import { BudgetModal } from './components/modals/BudgetModal';
import { TransactionModal } from './components/modals/TransactionModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { SubscriptionsModal } from './components/modals/SubscriptionsModal';
import { GoalsModal } from './components/modals/GoalsModal';
import { DebtsModal } from './components/modals/DebtsModal';
import { AIChatModal } from './components/modals/AIChatModal';
import { TutorialModal } from './components/modals/TutorialModal';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { BudgetSelector } from './components/onboarding/BudgetSelector';
import { AppLock } from './components/security/AppLock';
import { useFinance } from './contexts/FinanceContext';
import { useTheme } from './contexts/ThemeContext';
import { useHashLocation } from './utils/router';
import { triggerHaptic } from './utils';

export default function App() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, budgets, updateBudget, dataError, isOnboarded, userName, activeContext, setActiveContext } from useFinance();
  const { isDark, currency } = useTheme();
  
  // Hash Router
  const [activeTab, navigate] = useHashLocation();
  
  // Local UI State
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [showContextPicker, setShowContextPicker] = useState(true);
  
  // Modal Visibility State
  const [showTxModal, setShowTxModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSubsModal, setShowSubsModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showDebtsModal, setShowDebtsModal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Security State
  const [isLocked, setIsLocked] = useState(false);
  const [savedPin, setSavedPin] = useState<string | null>(null);

  // --- STORAGE HARDENING ---
  useEffect(() => {
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then(persistent => {
        console.log(persistent ? 'Storage is persistent' : 'Storage is not persistent');
      });
    }
    const pin = localStorage.getItem('emerald_pin');
    if (pin) {
        setSavedPin(pin);
        setIsLocked(true);
    }
  }, []);

  // Derived Values for Home View
  const currentMonthKey = currentDate.getFullYear() + '-' + String(currentDate.getMonth() + 1).padStart(2, '0');
  
  // Budget Key logic must match FinanceContext
  const budgetKey = `${activeContext}-${currentMonthKey}`;
  const defaultBudgetKey = `${activeContext}-default`;
  
  // Fallback to 60000 only for Personal if not set, else 0 to trigger setup prompt
  const totalBudget = budgets[budgetKey] || budgets[defaultBudgetKey] || (activeContext === 'personal' ? 60000 : 0);

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
    triggerHaptic(20); // Success haptic
    setShowTxModal(false); setEditingTx(null);
  };

  const handleDeleteTransaction = (id: number) => {
    // UI Confirmation is handled inside TransactionModal
    deleteTransaction(id);
    triggerHaptic(50); // Delete haptic
    setShowTxModal(false);
  };

  const handleUpdateBudget = (newAmount: number, monthKey: string, category?: string) => {
    updateBudget(newAmount, monthKey, category);
    triggerHaptic(20);
    setShowBudgetModal(false);
  };
  
  const handleContextSelect = (ctx: BudgetContext) => {
      setActiveContext(ctx);
      setShowContextPicker(false);
      triggerHaptic(10);

      // Check if budget is set for this context
      const d = new Date();
      const mKey = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      const bKey = `${ctx}-${mKey}`;
      const defKey = `${ctx}-default`;
      // Access budgets directly from context scope
      const budgetExists = budgets[bKey] || budgets[defKey] || (ctx === 'personal' ? 60000 : 0);
      
      if (!budgetExists) {
          setTimeout(() => setShowBudgetModal(true), 300);
      }
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
  
  // --- RENDER BUDGET SELECTOR (GATEWAY) ---
  if (showContextPicker) {
      return (
          <div className={`${isDark ? 'dark' : ''}`}>
              <BudgetSelector onSelect={handleContextSelect} userName={userName} />
          </div>
      );
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'home':
        return (
          <HomeView 
            currentDate={currentDate}
            changeMonth={changeMonth}
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
      case 'plan':
          return (
              <PlanView 
                  onOpenSubscriptions={() => setShowSubsModal(true)}
                  onOpenGoals={() => setShowGoalsModal(true)}
                  onOpenDebts={() => setShowDebtsModal(true)}
                  isPrivacyMode={isPrivacyMode}
              />
          );
      case 'profile':
      case 'accounts': // Keep legacy key just in case
        return (
            <AccountsView 
                onOpenSettings={() => setShowSettingsModal(true)} 
            />
        );
      default:
        return (
          <HomeView 
            currentDate={currentDate}
            changeMonth={changeMonth}
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
            <div className="flex items-center gap-3 cursor-pointer active:scale-95 transition-transform" onClick={() => navigate('profile')}>
              <div className="w-12 h-12 rounded-full bg-emerald-100 overflow-hidden border border-emerald-200">
                 <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${userName}`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-600/70 dark:text-emerald-400/70 tracking-wider uppercase">
                    Welcome
                </p>
                <h2 className="text-xl font-bold text-emerald-950 dark:text-emerald-50">{userName}</h2>
              </div>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => { setShowContextPicker(true); triggerHaptic(10); }}
                    aria-label="Switch Budget"
                    className="p-3 rounded-full bg-slate-100 dark:bg-black/20 text-slate-500 hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 transition-colors backdrop-blur-sm"
                >
                    <LayoutGrid size={20} />
                </button>
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
            activeTab={activeTab === 'accounts' ? 'profile' : activeTab} 
            setActiveTab={(tab) => { triggerHaptic(5); navigate(tab); }} 
            onAddClick={() => { triggerHaptic(10); setEditingTx(null); setShowTxModal(true); }}
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
        
        {showSettingsModal && (
            <SettingsModal 
                onClose={() => setShowSettingsModal(false)} 
                onOpenTutorial={() => { setShowSettingsModal(false); setShowTutorialModal(true); }}
            />
        )}
        {showSubsModal && <SubscriptionsModal onClose={() => setShowSubsModal(false)} />}
        {showGoalsModal && <GoalsModal onClose={() => setShowGoalsModal(false)} />}
        {showDebtsModal && <DebtsModal onClose={() => setShowDebtsModal(false)} />}
        {showAIChat && <AIChatModal onClose={() => setShowAIChat(false)} totalBudget={totalBudget} />}
        {showTutorialModal && <TutorialModal onClose={() => setShowTutorialModal(false)} />}
      </div>
    </div>
  );
}
