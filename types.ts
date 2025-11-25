export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  category: string;
  type: TransactionType;
  description?: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  topCategories: { name: string; value: number }[];
}

export interface FinancialAdvice {
  summary: string;
  actionableTips: string[];
  savingsPotential: number;
}

export interface UploadedFile {
  name: string;
  type: string;
  size: number;
  data: string; // Base64
}

export interface ProcessingStatus {
  isProcessing: boolean;
  message: string;
  error?: string;
}
