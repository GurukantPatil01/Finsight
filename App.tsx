import React, { useState, useEffect } from 'react';
import { Icons } from './components/Icons';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import { extractDataFromDocument, generateFinancialAdvice } from './services/geminiService';
import { Transaction, FinancialAdvice, ProcessingStatus } from './types';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [advice, setAdvice] = useState<FinancialAdvice | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>({ isProcessing: false, message: '' });

  // Handle Theme Toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleFileSelect = async (file: File) => {
    setStatus({ isProcessing: true, message: 'Reading file...' });

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;

          setStatus({ isProcessing: true, message: 'Extracting data points...' });
          // Parallelize extraction if we had multiple files, but for now linear is fine for single file
          // The optimization happens inside geminiService with thinkingBudget: 0
          const extractedData = await extractDataFromDocument(base64Data, file.type);

          const updatedTransactions = [...transactions, ...extractedData];
          setTransactions(updatedTransactions);

          setStatus({ isProcessing: true, message: 'Analyzing spending patterns...' });
          const newAdvice = await generateFinancialAdvice(updatedTransactions);
          setAdvice(newAdvice);

          setStatus({ isProcessing: false, message: 'Complete!' });
        } catch (error) {
          console.error(error);
          setStatus({ isProcessing: false, message: '', error: 'Failed to process file.' });
        }
      };
    } catch (error) {
      setStatus({ isProcessing: false, message: '', error: 'Error reading file.' });
    }
  };

  const clearData = () => {
    setTransactions([]);
    setAdvice(null);
  };

  return (
    <div className={`relative min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-dark-bg' : 'bg-neutral-50'}`}>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white dark:bg-dark-card border-b border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="bg-primary-500 p-2 rounded-sm transition-colors">
                <Icons.Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                FinSight<span className="text-primary-500">.ai</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-400 transition-colors"
                aria-label="Toggle Theme"
              >
                {isDarkMode ? <Icons.Sun className="w-5 h-5" /> : <Icons.Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 animate-fadeIn">
          <div>
            <h1 className="text-3xl font-medium text-slate-900 dark:text-white tracking-tight mb-3">
              Financial <span className="text-primary-600 dark:text-primary-400">Overview</span>
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-xl">
              Turn your messy receipts and bank statements into clear, actionable financial insights in seconds.
            </p>
          </div>
          {transactions.length > 0 && (
            <button
              onClick={clearData}
              className="px-5 py-2.5 rounded-sm text-sm font-normal text-slate-700 dark:text-slate-300 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Clear Dashboard
            </button>
          )}
        </div>

        {/* Upload Section */}
        <div className="mb-16 animate-fadeIn" style={{ animationDelay: '100ms' }}>
          <div className="bg-white dark:bg-dark-card rounded-sm p-1 border border-neutral-200 dark:border-neutral-800">
            <FileUpload
              onFileSelect={handleFileSelect}
              isProcessing={status.isProcessing}
            />
          </div>

          <div className="mt-4 flex flex-col items-center justify-center min-h-[2rem]">
            {status.error && (
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-sm bg-white dark:bg-dark-card px-4 py-2 rounded-sm border border-rose-300 dark:border-rose-800 animate-fadeIn">
                <Icons.Alert className="w-4 h-4" />
                {status.error}
              </div>
            )}
            {status.isProcessing && (
              <div className="flex items-center gap-3 text-primary-600 dark:text-primary-400 text-sm font-medium animate-fadeIn">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                </div>
                {status.message}
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Section */}
        <Dashboard transactions={transactions} advice={advice} />

      </main>
    </div>
  );
}

export default App;