"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "../supabaseClient";
import {
  CreditCard,
  Calendar as CalendarIcon,
  RefreshCw,
} from "lucide-react";
import {
  categoryLabels,
  type BillCategory,
  type BillStatus,
} from "@/data/bills";
import { Button } from "@/components/ui/button";

// TYPES
type BillInfo = {
  id: string;
  amount: number;
  category: BillCategory;
  status: BillStatus;
  provider: string;
  billDate: string;
};

type PaymentRow = {
  id: number;
  bill_id: number;
  amount: number;
  method: string;
  transaction_id: string;
  paid_date: string;
  bills?: any;
};

const methodColors: Record<string, string> = {
  UPI: "bg-primary/10 text-primary",
  "Credit Card": "bg-purple-500/10 text-purple-500",
  "Debit Card": "bg-blue-500/10 text-blue-500",
  "Net Banking": "bg-indigo-500/10 text-indigo-500",
  Cash: "bg-secondary text-secondary-foreground",
};

const PaymentHistory = () => {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [billsMap, setBillsMap] = useState<Record<number, BillInfo>>({});
  const isFetchingRef = useRef(false);

  const fetchPayments = useCallback(async () => {
    // Prevent double triggers
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          bills (
            id,
            amount,
            category,
            vendor,
            bill_date,
            status
          )
        `)
        .order("paid_date", { ascending: false });

      if (error) {
        toast.error("Failed to load payments");
        return;
      }

      const billsMapLocal: Record<number, BillInfo> = {};

      data?.forEach((p: any) => {
        if (!p.bills) return;

        billsMapLocal[p.bill_id] = {
          id: p.bills.id.toString(),
          amount: p.bills.amount,
          category: p.bills.category ?? "electricity",
          status: p.bills.status ?? "paid",
          provider: p.bills.vendor ?? "Unknown",
          billDate: p.bills.bill_date,
        };
      });

      setPayments(data || []);
      setBillsMap(billsMapLocal);
    } catch {
      toast.error("Fetch failed");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // 🔥 REALTIME SYNC: Listen to BOTH payments and bills
  useEffect(() => {
    const channel = supabase
      .channel("history-sync-all")
      // Jab naya payment add ho
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => fetchPayments()
      )
      // Jab bill ka status change ho (e.g. mark paid)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bills" },
        () => fetchPayments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPayments]);

  const grouped = useMemo(() => {
    return payments.reduce<Record<string, PaymentRow[]>>((acc, p) => {
      const month = p.paid_date.slice(0, 7);
      if (!acc[month]) acc[month] = [];
      acc[month].push(p);
      return acc;
    }, {});
  }, [payments]);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const avgPayment = payments.length > 0 ? Math.round(totalPaid / payments.length) : 0;
  const thisMonthPaid = payments
    .filter((p) => p.paid_date.startsWith(currentMonth))
    .reduce((s, p) => s + p.amount, 0);

  const mostUsedMethod = useMemo(() => {
    if (!payments.length) return "N/A";
    const count: Record<string, number> = {};
    payments.forEach((p) => {
      count[p.method] = (count[p.method] || 0) + 1;
    });
    return Object.entries(count).sort((a, b) => b[1] - a[1])[0][0];
  }, [payments]);

  if (loading) {
    return <div className="p-10 text-center animate-pulse">Loading History...</div>;
  }

  return (
    <div className="space-y-6 p-4 bg-background min-h-screen fade-up">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black">Payment History</h2>
          <p className="text-sm text-muted-foreground">{payments.length} total transactions</p>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-2xl px-6 py-3">
          <p className="text-[10px] font-bold uppercase text-primary tracking-tighter">Total Spent</p>
          <p className="text-2xl font-black text-primary">₹{totalPaid.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat label="Transactions" value={payments.length.toString()} />
        <MiniStat label="Top Method" value={mostUsedMethod} />
        <MiniStat label="Avg Bill" value={`₹${avgPayment}`} />
        <MiniStat label="This Month" value={`₹${thisMonthPaid}`} />
      </div>

      <div className="flex gap-2">
         <Button variant="outline" size="sm" onClick={fetchPayments} className="rounded-xl">
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="space-y-8">
        {Object.entries(grouped)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([month, list]) => (
            <div key={month}>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-border" />
                <div className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full">
                  <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-bold uppercase tracking-widest">{month}</span>
                </div>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="grid grid-cols-1 gap-3">
                {list.map((p) => {
                  const bill = billsMap[p.bill_id];
                  return (
                    <div
                      key={p.id}
                      className="bg-card border border-border/60 rounded-2xl p-4 flex items-center gap-4 hover:border-primary/30 transition-all"
                    >
                      <div className="p-3 bg-secondary rounded-xl">
                        <CreditCard className="h-5 w-5 text-foreground/70" />
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-black text-lg">₹{p.amount.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">
                              {bill ? categoryLabels[bill.category] : "Deleted Bill"} • {bill?.provider || "N/A"}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-[10px] font-bold rounded-lg ${methodColors[p.method] || "bg-secondary"}`}>
                            {p.method}
                          </span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-border/40 flex justify-between items-center">
                           <p className="text-[9px] font-mono text-muted-foreground truncate max-w-[150px]">
                            ID: {p.transaction_id}
                          </p>
                          <p className="text-[10px] font-medium">{p.paid_date}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>

      {!payments.length && (
        <div className="text-center py-20 bg-secondary/20 rounded-3xl border-2 border-dashed border-border">
          <p className="text-muted-foreground">No payments found in history</p>
        </div>
      )}
    </div>
  );
};

const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">{label}</p>
    <p className="text-lg font-black">{value}</p>
  </div>
);

export default PaymentHistory;