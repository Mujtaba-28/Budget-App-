// Analytics Web Worker Code
// This code runs in a separate thread to prevent UI freezing during heavy calculation

const workerCode = `
self.onmessage = function(e) {
    const { transactions, currentDateStr, budgets, viewType, EXPENSE_CATEGORIES, INCOME_CATEGORIES } = e.data;
    const currentDate = new Date(currentDateStr);
    
    try {
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        
        // Filter transactions for the selected date
        const monthlyTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === currentDate.getMonth() && tDate.getFullYear() === currentDate.getFullYear();
        });

        const currentBudgetKey = currentDate.getFullYear() + '-' + String(currentDate.getMonth() + 1).padStart(2, '0');
        const currentBudget = budgets[currentBudgetKey] || budgets['default'] || 60000;

        // Flatten splits
        const flatTransactions = monthlyTransactions.flatMap(t => {
            if (t.splits && t.splits.length > 0) {
                 return t.splits.map(s => ({
                     ...t,
                     category: s.category,
                     amount: s.amount
                 }));
            }
            return [t];
        });

        const activeTransactions = flatTransactions.filter(t => t.type === viewType);
        const activeTotal = activeTransactions.reduce((a, b) => a + b.amount, 0);

        // Daily Trend
        const dailySpending = new Array(daysInMonth).fill(0);
        activeTransactions.forEach(tx => {
            const day = new Date(tx.date).getDate() - 1;
            if(day >= 0 && day < daysInMonth) dailySpending[day] += tx.amount;
        });
        
        // Cumulative
        let cumulativeSpending = [];
        let runningTotal = 0;
        const today = new Date();
        const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
        const currentDayIndex = isCurrentMonth ? today.getDate() : daysInMonth;

        for (let i = 0; i < currentDayIndex; i++) {
            runningTotal += dailySpending[i];
            cumulativeSpending.push(runningTotal);
        }
        
        const daysPassed = Math.max(currentDayIndex, 1); 
        const currentDailyAverage = activeTotal / daysPassed;
        const daysLeft = daysInMonth - daysPassed;
        const predictedTotal = activeTotal + (currentDailyAverage * daysLeft);
        const isOverBudget = viewType === 'expense' && predictedTotal > currentBudget;

        // Categories
        const categoryList = viewType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
        let categoryData = categoryList.map(cat => {
            const amount = activeTransactions.filter(t => t.category === cat.name).reduce((a, b) => a + b.amount, 0);
            return { ...cat, amount, code: cat.code || '#cbd5e1' };
        }).filter(c => c.amount > 0).sort((a,b) => b.amount - a.amount);
        
        const maxCategoryVal = Math.max(...categoryData.map(c => c.amount), 1); 
        const totalForDonut = categoryData.reduce((a, b) => a + b.amount, 0);

        // Send back results
        self.postMessage({
            activeTotal,
            dailySpending,
            cumulativeSpending,
            predictedTotal,
            isOverBudget,
            currentDailyAverage,
            categoryData,
            maxCategoryVal,
            totalForDonut,
            currentBudget,
            daysInMonth,
            runningTotal
        });

    } catch (e) {
        self.postMessage({ error: e.message });
    }
};
`;

export const createAnalyticsWorker = () => {
    const blob = new Blob([workerCode], { type: "application/javascript" });
    return new Worker(URL.createObjectURL(blob));
};
