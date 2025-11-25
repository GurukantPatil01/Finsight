import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, TransactionType, FinancialAdvice } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

/**
 * Extracts structured transaction data from a file (image/pdf) using Gemini.
 */
export const extractDataFromDocument = async (
  base64Data: string,
  mimeType: string
): Promise<Transaction[]> => {
  try {
    // Clean base64 string if it contains metadata header
    const cleanBase64 = base64Data.includes("base64,")
      ? base64Data.split("base64,")[1]
      : base64Data;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
          {
            text: `Analyze this document (receipt, invoice, or bank statement). 
            Extract all individual financial transactions. 
            If it's a receipt, extract the items or the total. 
            Determine if it is an INCOME or EXPENSE.
            Categorize each transaction (e.g., Food, Transport, Salary, Utilities).
            Ensure the amount is a positive number.
            Format the date as YYYY-MM-DD.`,
          },
        ],
      },
      config: {
        // Optimization: Disable thinking for simple extraction to speed up response
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING, description: "YYYY-MM-DD" },
              merchant: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              category: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["INCOME", "EXPENSE"] },
              description: { type: Type.STRING },
            },
            required: ["date", "merchant", "amount", "category", "type"],
          },
        },
      },
    });

    if (response.text) {
      const rawData = JSON.parse(response.text);
      // Add unique IDs to the extracted data
      return rawData.map((item: any) => ({
        ...item,
        id: crypto.randomUUID(),
        // Normalize enum just in case
        type: item.type === "INCOME" ? TransactionType.INCOME : TransactionType.EXPENSE,
      }));
    }
    return [];
  } catch (error) {
    console.error("Error extracting data:", error);
    throw new Error("Failed to process document. Please try again.");
  }
};

/**
 * Generates financial advice based on a list of transactions.
 * Optimization: Aggregates data client-side to reduce input tokens and latency.
 */
export const generateFinancialAdvice = async (
  transactions: Transaction[]
): Promise<FinancialAdvice> => {
  if (transactions.length === 0) {
    return {
      summary: "Upload documents to get analysis.",
      actionableTips: [],
      savingsPotential: 0
    };
  }

  // Pre-calculate stats client-side to save token processing time for the AI
  const income = transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);

  const categoryTotals: Record<string, number> = {};
  transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([cat, amount]) => `${cat} (₹${amount.toFixed(2)})`)
    .join(", ");

  const summaryData = `
    Total Income: ₹${income.toFixed(2)}
    Total Expense: ₹${expense.toFixed(2)}
    Net Balance: ₹${(income - expense).toFixed(2)}
    Top Spending Categories: ${topCategories}
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Act as a financial advisor. Based on this summary data:
      ${summaryData}
      
      Provide:
      1. A short, punchy summary paragraph (under 40 words) about the user's spending habits.
      2. 3 specific, short, actionable tips to improve financial health.
      3. An estimated monthly savings potential amount (number only) if they follow the tips.
    `,
    config: {
      // Optimization: Disable thinking for simple advice generation
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          actionableTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          savingsPotential: { type: Type.NUMBER },
        },
        required: ["summary", "actionableTips", "savingsPotential"],
      },
    },
  });

  if (response.text) {
    return JSON.parse(response.text) as FinancialAdvice;
  }

  throw new Error("Failed to generate advice.");
};