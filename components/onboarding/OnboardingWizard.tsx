
import React, { useState, useEffect } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ChevronRight, Check, TrendingUp, TrendingDown, DollarSign, Target, PieChart, Shield } from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
    const { completeOnboarding } = useFinance();
    const { setCurrency, currency } = useTheme();
    const [step, setStep] = useState(1);
    const [budget, setBudget] = useState('50000');
    const [shouldWipe, setShouldWipe] = useState(true);
    const [randomInsight, setRandomInsight] = useState<any>(null);

    const currencies = [ '₹', '$', '€', '£', 'AED', '¥' ];

    // INSIGHTS DATABASE
    const insights = [
        {
            title: "Assets vs Liabilities",
            icon: TrendingUp,
            color: "emerald",
            content: (
                <div className="space-y-4 mb-6">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center gap-4 text-left">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-800/50 rounded-full text-emerald-600 dark:text-emerald-400"><TrendingUp size={24}/></div>
                        <div>
                            <h4 className="font-bold text-emerald-900 dark:text-emerald-100">Assets</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Put money IN your pocket (Savings, Investments).</p>
                        </div>
                    </div>
                    <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center gap-4 text-left">
                        <div className="p-3 bg-rose-100 dark:bg-rose-800/50 rounded-full text-rose-600 dark:text-rose-400"><TrendingDown size={24}/></div>
                        <div>
                            <h4 className="font-bold text-rose-900 dark:text-rose-100">Liabilities</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Take money OUT (Loans, Credit Cards).</p>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">Emerald tracks both to find your <span className="text-emerald-500 font-bold">Net Worth</span>.</p>
                </div>
            )
        },
        {
            title: "The 50/30/20 Rule",
            icon: PieChart,
            color: "indigo",
            content: (
                <div className="text-center space-y-4 mb-6">
                    <div className="flex justify-center gap-2">
                        <div className="h-20 w-12 bg-emerald-500 rounded-xl flex items-end justify-center pb-2 text-white text-xs font-bold">50%</div>
                        <div className="h-14 w-12 bg-indigo-500 rounded-xl flex items-end justify-center pb-2 text-white text-xs font-bold">30%</div>
                        <div className="h-8 w-12 bg-rose-500 rounded-xl flex items-end justify-center pb-2 text-white text-xs font-bold">20%</div>
                    </div>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Needs • Wants • Savings</p>
                    <p className="text-xs text-slate-400 leading-relaxed">A simple budgeting framework. Aim to save 20% of your income before spending on wants.</p>
                </div>
            )
        },
        {
            title: "Snowball Method",
            icon: Target,
            color: "rose",
            content: (
                <div className="text-center space-y-4 mb-6">
                    <div className="p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                        <div className="flex items-center gap-2 justify-center mb-2">
                            <div className="w-4 h-4 rounded-full bg-rose-400"></div>
                            <div className="w-6 h-6 rounded-full bg-rose-500"></div>
                            <div className="w-8 h-8 rounded-full bg-rose-600"></div>
                        </div>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Pay smallest debts first</p>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">Focus on clearing small debts completely to build psychological momentum, then attack the big ones.</p>
                </div>
            )
        },
        {
            title: "Emergency Fund",
            icon: Shield,
            color: "emerald",
            content: (
                <div className="text-center space-y-4 mb-6">
                    <Shield size={48} className="mx-auto text-emerald-500 mb-2"/>
                    <h4 className="font-bold text-lg">3-6 Months</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">Before investing, save 3-6 months of expenses in a liquid account. This is your financial airbag.</p>
                </div>
            )
        }
    ];

    useEffect(() => {
        setRandomInsight(insights[Math.floor(Math.random() * insights.length)]);
    }, []);

    const handleNext = () => {
        if (step < 4) setStep(step + 1);
        else {
            // Finish - pass budget to context to avoid race condition
            const budgetAmount = parseInt(budget) || 0;
            completeOnboarding(shouldWipe, budgetAmount);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-emerald-50 dark:bg-[#021c17] flex items-center justify-center p-6">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <div className="w-20 h-20 bg-emerald-100 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-emerald-500/20">
                        <img src="https://api.dicebear.com/9.x/shapes/svg?seed=Emerald&backgroundColor=10b981" className="w-12 h-12"/>
                    </div>
                    <h1 className="text-3xl font-black text-emerald-950 dark:text-emerald-50 mb-2">Emerald Finance</h1>
                    <p className="text-slate-400 font-medium">Your personal wealth companion.</p>
                </div>

                <div className="bg-white dark:bg-[#0a3831] p-6 rounded-[2.5rem] shadow-2xl border border-emerald-100 dark:border-emerald-800/30">
                    {/* STEP 1: CURRENCY */}
                    {step === 1 && (
                        <div className="animate-in slide-in-from-right-8 duration-500">
                            <h3 className="font-bold text-lg mb-4 text-center dark:text-white">Choose Currency</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {currencies.map(c => (
                                    <button 
                                        key={c}
                                        onClick={() => setCurrency(c)}
                                        className={`p-4 rounded-2xl font-bold text-xl transition-all ${currency === c ? 'bg-emerald-500 text-white shadow-lg scale-105' : 'bg-slate-50 dark:bg-black/20 text-slate-400 hover:bg-slate-100'}`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: DYNAMIC FINANCIAL INSIGHT */}
                    {step === 2 && randomInsight && (
                        <div className="animate-in slide-in-from-right-8 duration-500 text-center">
                            <h3 className="font-bold text-lg mb-6 dark:text-white flex items-center justify-center gap-2">
                                <Sparkles size={18} className={`text-${randomInsight.color}-500`}/> 
                                {randomInsight.title}
                            </h3>
                            {randomInsight.content}
                        </div>
                    )}

                    {/* STEP 3: BUDGET */}
                    {step === 3 && (
                        <div className="animate-in slide-in-from-right-8 duration-500">
                            <h3 className="font-bold text-lg mb-4 text-center dark:text-white">Monthly Budget Goal</h3>
                            <div className="relative mb-6">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-emerald-500">{currency}</span>
                                <input 
                                    type="number" 
                                    value={budget} 
                                    onChange={e => setBudget(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-black/20 p-4 pl-12 rounded-2xl text-2xl font-bold outline-none text-emerald-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 transition-all"
                                />
                            </div>
                            <p className="text-center text-xs text-slate-400">This helps us track your spending limit. You can change it anytime.</p>
                        </div>
                    )}

                    {/* STEP 4: DATA SETUP */}
                    {step === 4 && (
                        <div className="animate-in slide-in-from-right-8 duration-500">
                            <h3 className="font-bold text-lg mb-4 text-center dark:text-white">Start Fresh?</h3>
                            <button 
                                onClick={() => setShouldWipe(true)}
                                className={`w-full p-4 rounded-2xl mb-3 flex items-center gap-3 transition-all ${shouldWipe ? 'bg-emerald-100 border-2 border-emerald-500 text-emerald-800' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                            >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${shouldWipe ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>
                                    {shouldWipe && <Check size={14}/>}
                                </div>
                                <div className="text-left">
                                    <span className="block font-bold">Yes, Clean Slate</span>
                                    <span className="block text-xs opacity-70">Remove mock data</span>
                                </div>
                            </button>

                            <button 
                                onClick={() => setShouldWipe(false)}
                                className={`w-full p-4 rounded-2xl flex items-center gap-3 transition-all ${!shouldWipe ? 'bg-emerald-100 border-2 border-emerald-500 text-emerald-800' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                            >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${!shouldWipe ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>
                                    {!shouldWipe && <Check size={14}/>}
                                </div>
                                <div className="text-left">
                                    <span className="block font-bold">No, Keep Demo Data</span>
                                    <span className="block text-xs opacity-70">I want to explore first</span>
                                </div>
                            </button>
                        </div>
                    )}

                    <button 
                        onClick={handleNext}
                        className="w-full mt-8 py-4 bg-emerald-950 dark:bg-emerald-100 text-white dark:text-emerald-950 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-emerald-900/10"
                    >
                        {step === 4 ? "Let's Go!" : "Next"} <ChevronRight size={20}/>
                    </button>
                </div>
                
                <div className="flex justify-center gap-2 mt-8">
                    {[1,2,3,4].map(i => <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-300'}`}></div>)}
                </div>
            </div>
        </div>
    );
};

function Sparkles({ size, className }: { size: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        </svg>
    )
}
