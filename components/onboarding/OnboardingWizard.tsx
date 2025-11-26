
import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ChevronRight, Check, Sparkles, Shield, LayoutGrid, User, ArrowRight } from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
    const { completeOnboarding } = useFinance();
    const { setCurrency, currency } = useTheme();
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [budget, setBudget] = useState('50000');
    const [shouldWipe, setShouldWipe] = useState(true);

    const currencies = [ '₹', '$', '€', '£', 'AED', '¥' ];

    // TOUR STEPS
    const tourSteps = [
        {
            title: "Smart AI Entry",
            desc: "Snap a receipt or paste a text. Our AI fills in the details for you automatically.",
            icon: Sparkles,
            color: "indigo"
        },
        {
            title: "Private & Secure",
            desc: "Your financial data stays on your device. Offline-first and encrypted locally.",
            icon: Shield,
            color: "emerald"
        },
        {
            title: "Visual Analytics",
            desc: "Beautiful charts and predictive insights to help you save more every month.",
            icon: LayoutGrid,
            color: "teal"
        }
    ];
    const [tourIndex, setTourIndex] = useState(0);

    const handleNext = () => {
        if (step === 2 && tourIndex < tourSteps.length - 1) {
            setTourIndex(prev => prev + 1);
            return;
        }
        
        if (step === 3 && !name.trim()) return;

        if (step < 5) setStep(step + 1);
        else {
            const budgetAmount = parseInt(budget) || 0;
            completeOnboarding(name, shouldWipe, budgetAmount);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-emerald-50 dark:bg-[#021c17] flex items-center justify-center p-6">
            <div className="w-full max-w-sm">
                
                {/* STEP 1: WELCOME */}
                {step === 1 && (
                    <div className="text-center animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-emerald-100 rounded-[2rem] mx-auto mb-8 flex items-center justify-center shadow-xl shadow-emerald-500/20">
                             <img src="https://api.dicebear.com/9.x/shapes/svg?seed=Emerald&backgroundColor=10b981" className="w-16 h-16"/>
                        </div>
                        <h1 className="text-4xl font-black text-emerald-950 dark:text-emerald-50 mb-4 tracking-tight">Emerald</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mb-12">Your personal wealth companion.</p>
                        <button onClick={handleNext} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-600/30 active:scale-95 transition-transform flex items-center justify-center gap-2">
                            Get Started <ArrowRight size={20}/>
                        </button>
                    </div>
                )}

                {/* STEP 2: TOUR */}
                {step === 2 && (
                    <div className="bg-white dark:bg-[#0a3831] p-8 rounded-[2.5rem] shadow-2xl border border-emerald-100 dark:border-emerald-800/30 min-h-[400px] flex flex-col items-center text-center animate-in slide-in-from-right-8">
                        <div className="flex-1 flex flex-col items-center justify-center">
                            {tourSteps.map((s, idx) => (
                                idx === tourIndex && (
                                    <div key={idx} className="animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className={`w-20 h-20 bg-${s.color}-100 dark:bg-${s.color}-900/40 rounded-full flex items-center justify-center text-${s.color}-600 dark:text-${s.color}-400 mb-6 mx-auto`}>
                                            <s.icon size={36}/>
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{s.title}</h2>
                                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                                    </div>
                                )
                            ))}
                        </div>
                        <div className="flex gap-2 mt-8 mb-6">
                            {tourSteps.map((_, i) => (
                                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === tourIndex ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-200 dark:bg-slate-700'}`}></div>
                            ))}
                        </div>
                        <button onClick={handleNext} className="w-full py-4 bg-emerald-950 dark:bg-emerald-100 text-white dark:text-emerald-950 rounded-2xl font-bold">
                            {tourIndex === tourSteps.length - 1 ? 'Next' : 'Continue'}
                        </button>
                    </div>
                )}

                {/* STEP 3: PROFILE */}
                {step === 3 && (
                    <div className="bg-white dark:bg-[#0a3831] p-8 rounded-[2.5rem] shadow-2xl border border-emerald-100 dark:border-emerald-800/30 animate-in slide-in-from-right-8">
                        <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-8">About You</h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Your Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. John Doe" 
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-black/20 p-4 pl-12 rounded-2xl font-bold outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 transition-all"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Currency</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {currencies.map(c => (
                                        <button 
                                            key={c}
                                            onClick={() => setCurrency(c)}
                                            className={`p-3 rounded-xl font-bold text-lg transition-all ${currency === c ? 'bg-emerald-500 text-white shadow-lg scale-105' : 'bg-slate-50 dark:bg-black/20 text-slate-400 hover:bg-slate-100 dark:hover:bg-black/40'}`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button onClick={handleNext} disabled={!name.trim()} className="w-full mt-8 py-4 bg-emerald-950 dark:bg-emerald-100 text-white dark:text-emerald-950 rounded-2xl font-bold disabled:opacity-50">
                            Continue
                        </button>
                    </div>
                )}

                {/* STEP 4: BUDGET */}
                {step === 4 && (
                    <div className="bg-white dark:bg-[#0a3831] p-8 rounded-[2.5rem] shadow-2xl border border-emerald-100 dark:border-emerald-800/30 animate-in slide-in-from-right-8">
                        <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">Monthly Budget</h2>
                        <p className="text-center text-slate-400 text-sm mb-8">Set a spending limit to track your progress.</p>
                        
                        <div className="relative mb-8">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-bold text-emerald-500">{currency}</span>
                            <input 
                                type="number" 
                                value={budget} 
                                onChange={e => setBudget(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-black/20 p-6 pl-14 rounded-3xl text-3xl font-bold outline-none text-emerald-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 transition-all text-center"
                            />
                        </div>

                        <button onClick={handleNext} className="w-full py-4 bg-emerald-950 dark:bg-emerald-100 text-white dark:text-emerald-950 rounded-2xl font-bold">
                            Set Budget
                        </button>
                    </div>
                )}

                {/* STEP 5: DATA */}
                {step === 5 && (
                    <div className="bg-white dark:bg-[#0a3831] p-8 rounded-[2.5rem] shadow-2xl border border-emerald-100 dark:border-emerald-800/30 animate-in slide-in-from-right-8">
                        <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-8">All Set!</h2>
                        
                        <div className="space-y-4 mb-8">
                            <button 
                                onClick={() => setShouldWipe(true)}
                                className={`w-full p-4 rounded-2xl flex items-center gap-3 transition-all ${shouldWipe ? 'bg-emerald-100 border-2 border-emerald-500 text-emerald-800' : 'bg-slate-50 dark:bg-black/20 text-slate-500 dark:text-slate-400'}`}
                            >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${shouldWipe ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>
                                    {shouldWipe && <Check size={14}/>}
                                </div>
                                <div className="text-left">
                                    <span className="block font-bold">Start Fresh</span>
                                    <span className="block text-xs opacity-70">Clean slate, no data</span>
                                </div>
                            </button>

                            <button 
                                onClick={() => setShouldWipe(false)}
                                className={`w-full p-4 rounded-2xl flex items-center gap-3 transition-all ${!shouldWipe ? 'bg-emerald-100 border-2 border-emerald-500 text-emerald-800' : 'bg-slate-50 dark:bg-black/20 text-slate-500 dark:text-slate-400'}`}
                            >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${!shouldWipe ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>
                                    {!shouldWipe && <Check size={14}/>}
                                </div>
                                <div className="text-left">
                                    <span className="block font-bold">Keep Demo Data</span>
                                    <span className="block text-xs opacity-70">Explore with sample entries</span>
                                </div>
                            </button>
                        </div>

                        <button onClick={handleNext} className="w-full py-4 bg-emerald-950 dark:bg-emerald-100 text-white dark:text-emerald-950 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-900/10">
                            Launch App
                        </button>
                    </div>
                )}
                
                {step > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                        {[2,3,4,5].map(i => <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-300 dark:bg-slate-700'}`}></div>)}
                    </div>
                )}
            </div>
        </div>
    );
};
