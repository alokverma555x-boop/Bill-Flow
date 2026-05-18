export type BillCategory = "electricity" | "water" | "internet" | "gas" | "dth" | "phone";
export type BillStatus = "paid" | "unpaid" | "overdue";

export interface Bill {
  id: string;
  category: BillCategory;
  amount: number;
  billDate: string;
  dueDate: string;
  status: BillStatus;
  description: string;
  provider: string;
  accountNumber: string;
  units?: number;
  previousReading?: number;
  currentReading?: number;
}

export interface PaymentRecord {
  id: string;
  billId: string;
  amount: number;
  paidDate: string;
  method: "UPI" | "Credit Card" | "Debit Card" | "Net Banking" | "Cash";
  transactionId: string;
}

export interface BudgetLimit {
  category: BillCategory;
  monthlyLimit: number;
  currentSpend: number;
}

export const categoryLabels: Record<BillCategory, string> = {
  electricity: "Electricity",
  water: "Water",
  internet: "Internet",
  gas: "Gas (PNG)",
  dth: "DTH / Cable",
  phone: "Phone",
};

export const categoryEmojis: Record<BillCategory, string> = {
  electricity: "⚡",
  water: "💧",
  internet: "🌐",
  gas: "🔥",
  dth: "📡",
  phone: "📱",
};

export const sampleBills: Bill[] = [
  // March 2026
  { id: "1", category: "electricity", amount: 2340, billDate: "2026-03-01", dueDate: "2026-03-15", status: "paid", description: "March electricity", provider: "Tata Power", accountNumber: "TP-9283746", units: 234, previousReading: 45230, currentReading: 45464 },
  { id: "2", category: "water", amount: 580, billDate: "2026-03-03", dueDate: "2026-03-20", status: "unpaid", description: "March water supply", provider: "Municipal Corp", accountNumber: "MC-1827364", units: 12000 },
  { id: "3", category: "internet", amount: 999, billDate: "2026-03-05", dueDate: "2026-03-25", status: "unpaid", description: "Broadband monthly", provider: "Jio Fiber", accountNumber: "JF-9182736" },
  { id: "4a", category: "gas", amount: 870, billDate: "2026-03-02", dueDate: "2026-03-18", status: "unpaid", description: "March PNG gas", provider: "Mahanagar Gas", accountNumber: "MGL-827364", units: 29 },
  { id: "4b", category: "dth", amount: 450, billDate: "2026-03-01", dueDate: "2026-03-15", status: "paid", description: "March DTH recharge", provider: "Tata Play", accountNumber: "TP-182736" },
  { id: "4c", category: "phone", amount: 599, billDate: "2026-03-04", dueDate: "2026-03-19", status: "paid", description: "Postpaid mobile", provider: "Airtel", accountNumber: "AIR-928374" },

  // February 2026
  { id: "5", category: "electricity", amount: 2780, billDate: "2026-02-01", dueDate: "2026-02-15", status: "paid", description: "Feb electricity", provider: "Tata Power", accountNumber: "TP-9283746", units: 278, previousReading: 44952, currentReading: 45230 },
  { id: "6", category: "water", amount: 620, billDate: "2026-02-03", dueDate: "2026-02-18", status: "paid", description: "Feb water supply", provider: "Municipal Corp", accountNumber: "MC-1827364", units: 13200 },
  { id: "7", category: "internet", amount: 999, billDate: "2026-02-05", dueDate: "2026-02-25", status: "paid", description: "Feb broadband", provider: "Jio Fiber", accountNumber: "JF-9182736" },
  { id: "7a", category: "gas", amount: 1120, billDate: "2026-02-02", dueDate: "2026-02-17", status: "paid", description: "Feb PNG gas", provider: "Mahanagar Gas", accountNumber: "MGL-827364", units: 38 },
  { id: "7b", category: "dth", amount: 450, billDate: "2026-02-01", dueDate: "2026-02-15", status: "paid", description: "Feb DTH recharge", provider: "Tata Play", accountNumber: "TP-182736" },
  { id: "7c", category: "phone", amount: 749, billDate: "2026-02-04", dueDate: "2026-02-19", status: "paid", description: "Feb postpaid", provider: "Airtel", accountNumber: "AIR-928374" },

  // January 2026
  { id: "8", category: "electricity", amount: 1980, billDate: "2026-01-01", dueDate: "2026-01-15", status: "paid", description: "Jan electricity", provider: "Tata Power", accountNumber: "TP-9283746", units: 198 },
  { id: "9", category: "water", amount: 540, billDate: "2026-01-03", dueDate: "2026-01-18", status: "paid", description: "Jan water", provider: "Municipal Corp", accountNumber: "MC-1827364" },
  { id: "10", category: "internet", amount: 999, billDate: "2026-01-05", dueDate: "2026-01-25", status: "paid", description: "Jan broadband", provider: "Jio Fiber", accountNumber: "JF-9182736" },
  { id: "10a", category: "gas", amount: 1340, billDate: "2026-01-02", dueDate: "2026-01-17", status: "paid", description: "Jan PNG gas", provider: "Mahanagar Gas", accountNumber: "MGL-827364", units: 45 },
  { id: "10b", category: "phone", amount: 599, billDate: "2026-01-04", dueDate: "2026-01-19", status: "paid", description: "Jan postpaid", provider: "Airtel", accountNumber: "AIR-928374" },

  // December 2025
  { id: "11", category: "electricity", amount: 3100, billDate: "2025-12-01", dueDate: "2025-12-15", status: "paid", description: "Dec electricity", provider: "Tata Power", accountNumber: "TP-9283746", units: 310 },
  { id: "12", category: "water", amount: 710, billDate: "2025-12-03", dueDate: "2025-12-18", status: "paid", description: "Dec water", provider: "Municipal Corp", accountNumber: "MC-1827364" },
  { id: "12a", category: "gas", amount: 980, billDate: "2025-12-02", dueDate: "2025-12-17", status: "paid", description: "Dec PNG gas", provider: "Mahanagar Gas", accountNumber: "MGL-827364" },
  { id: "12b", category: "dth", amount: 450, billDate: "2025-12-01", dueDate: "2025-12-15", status: "paid", description: "Dec DTH recharge", provider: "Tata Play", accountNumber: "TP-182736" },

  // November 2025
  { id: "13", category: "electricity", amount: 2500, billDate: "2025-11-01", dueDate: "2025-11-15", status: "paid", description: "Nov electricity", provider: "Tata Power", accountNumber: "TP-9283746", units: 250 },
  { id: "14", category: "water", amount: 490, billDate: "2025-11-03", dueDate: "2025-11-18", status: "paid", description: "Nov water", provider: "Municipal Corp", accountNumber: "MC-1827364" },
  { id: "15", category: "internet", amount: 999, billDate: "2025-11-05", dueDate: "2025-11-25", status: "paid", description: "Nov broadband", provider: "Jio Fiber", accountNumber: "JF-9182736" },
  { id: "15a", category: "gas", amount: 760, billDate: "2025-11-02", dueDate: "2025-11-17", status: "paid", description: "Nov PNG gas", provider: "Mahanagar Gas", accountNumber: "MGL-827364" },
  { id: "15b", category: "phone", amount: 599, billDate: "2025-11-04", dueDate: "2025-11-19", status: "paid", description: "Nov postpaid", provider: "Airtel", accountNumber: "AIR-928374" },

  // October 2025
  { id: "16", category: "electricity", amount: 2650, billDate: "2025-10-01", dueDate: "2025-10-15", status: "overdue", description: "Oct electricity – overdue", provider: "Tata Power", accountNumber: "TP-9283746", units: 265 },
  { id: "16a", category: "gas", amount: 680, billDate: "2025-10-02", dueDate: "2025-10-17", status: "paid", description: "Oct PNG gas", provider: "Mahanagar Gas", accountNumber: "MGL-827364" },
  { id: "16b", category: "dth", amount: 450, billDate: "2025-10-01", dueDate: "2025-10-15", status: "paid", description: "Oct DTH recharge", provider: "Tata Play", accountNumber: "TP-182736" },
];

export const monthlyTotals = [
  { month: "Oct", electricity: 2650, water: 0, internet: 0, gas: 680, dth: 450, phone: 0, total: 3780 },
  { month: "Nov", electricity: 2500, water: 490, internet: 999, gas: 760, dth: 0, phone: 599, total: 5348 },
  { month: "Dec", electricity: 3100, water: 710, internet: 0, gas: 980, dth: 450, phone: 0, total: 5240 },
  { month: "Jan", electricity: 1980, water: 540, internet: 999, gas: 1340, dth: 0, phone: 599, total: 5458 },
  { month: "Feb", electricity: 2780, water: 620, internet: 999, gas: 1120, dth: 450, phone: 749, total: 6718 },
  { month: "Mar", electricity: 2340, water: 580, internet: 999, gas: 870, dth: 450, phone: 599, total: 5838 },
];

export const paymentHistory: PaymentRecord[] = [
  { id: "p1", billId: "1", amount: 2340, paidDate: "2026-03-14", method: "UPI", transactionId: "UPI2603140001" },
  { id: "p2", billId: "4b", amount: 450, paidDate: "2026-03-12", method: "Credit Card", transactionId: "CC2603120034" },
  { id: "p3", billId: "4c", amount: 599, paidDate: "2026-03-10", method: "UPI", transactionId: "UPI2603100087" },
  { id: "p4", billId: "5", amount: 2780, paidDate: "2026-02-14", method: "Net Banking", transactionId: "NB2602140012" },
  { id: "p5", billId: "6", amount: 620, paidDate: "2026-02-16", method: "UPI", transactionId: "UPI2602160045" },
  { id: "p6", billId: "7", amount: 999, paidDate: "2026-02-20", method: "Debit Card", transactionId: "DC2602200023" },
  { id: "p7", billId: "7a", amount: 1120, paidDate: "2026-02-15", method: "UPI", transactionId: "UPI2602150077" },
  { id: "p8", billId: "7b", amount: 450, paidDate: "2026-02-13", method: "Cash", transactionId: "CASH260213001" },
  { id: "p9", billId: "7c", amount: 749, paidDate: "2026-02-18", method: "UPI", transactionId: "UPI2602180099" },
  { id: "p10", billId: "8", amount: 1980, paidDate: "2026-01-13", method: "UPI", transactionId: "UPI2601130034" },
  { id: "p11", billId: "9", amount: 540, paidDate: "2026-01-15", method: "Net Banking", transactionId: "NB2601150056" },
  { id: "p12", billId: "10", amount: 999, paidDate: "2026-01-22", method: "Credit Card", transactionId: "CC2601220078" },
];

export const budgetLimits: BudgetLimit[] = [
  { category: "electricity", monthlyLimit: 3000, currentSpend: 2340 },
  { category: "water", monthlyLimit: 800, currentSpend: 580 },
  { category: "internet", monthlyLimit: 1200, currentSpend: 999 },
  { category: "gas", monthlyLimit: 1500, currentSpend: 870 },
  { category: "dth", monthlyLimit: 600, currentSpend: 450 },
  { category: "phone", monthlyLimit: 800, currentSpend: 599 },
];

export const categoryColors: Record<BillCategory, string> = {
  electricity: "hsl(38, 92%, 55%)",
  water: "hsl(200, 80%, 55%)",
  internet: "hsl(280, 65%, 60%)",
  gas: "hsl(15, 85%, 55%)",
  dth: "hsl(340, 70%, 55%)",
  phone: "hsl(170, 65%, 45%)",
};

export const statusColors: Record<BillStatus, string> = {
  paid: "hsl(142, 60%, 45%)",
  unpaid: "hsl(45, 93%, 55%)",
  overdue: "hsl(0, 72%, 55%)",
};
