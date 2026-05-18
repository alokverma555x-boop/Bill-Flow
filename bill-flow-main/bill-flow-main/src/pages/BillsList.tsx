"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  categoryLabels,
  categoryEmojis,
  type Bill,
  type BillCategory,
  type BillStatus,
} from "@/data/bills";
import {
  Zap,
  Droplets,
  Wifi,
  Flame,
  Tv,
  Smartphone,
  Check,
  Eye,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "../supabaseClient";

type BillRow = {
  id: number;
  amount: number;
  vendor: string | null;
  bill_date: string;
  status: BillStatus;
  category?: BillCategory;
};

const BillsList = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState<BillCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<BillStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bills")
        .select("*")
        .order("bill_date", { ascending: true });

      if (error) throw error;

      const mapped: Bill[] = (data as BillRow[]).map((row) => ({
        id: row.id.toString(),
        amount: row.amount,
        category: (row.category as BillCategory) ?? "electricity",
        status: (row.status as BillStatus) ?? "unpaid",
        provider: row.vendor ?? "Unknown",
        description: row.vendor ?? "",
        billDate: row.bill_date,
        dueDate: row.bill_date,
        accountNumber: "",
      }));

      setBills(mapped);
    } catch (err) {
      toast.error("Failed to load bills");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  // 🔥 REALTIME – Update whenever bills table changes
  useEffect(() => {
    const channel = supabase
      .channel("bills-realtime-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bills" },
        () => { fetchBills(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBills]);

  const markPaid = useCallback(
    async (id: string) => {
      const numericId = Number(id);
      if (isNaN(numericId)) return;

      try {
        // 1. Pehle check karo bill exist karta hai ya nahi
        const { data: bill, error: fetchError } = await supabase
          .from("bills")
          .select("*")
          .eq("id", numericId)
          .single();

        if (fetchError || !bill) {
          toast.error("Bill not found!");
          return;
        }

        // 2. Update Bill Status
        const { error: updateError } = await supabase
          .from("bills")
          .update({ status: "paid" })
          .eq("id", numericId);

        if (updateError) throw updateError;

        // 3. Create Payment Record (TAKI HISTORY MEI DIKHE)
        const { error: insertError } = await supabase
          .from("payments")
          .insert([
            {
              bill_id: numericId,
              amount: bill.amount,
              method: "UPI",
              transaction_id: `auto-${id}-${Date.now()}`,
              paid_date: new Date().toISOString(),
            },
          ]);

        if (insertError) {
          toast.warning("Status updated, but failed to record payment history.");
        } else {
          toast.success("Bill Paid Successfully!");
        }

        // Refresh Local UI
        await fetchBills();
        
      } catch (err) {
        toast.error("Process failed. Try again.");
      }
    },
    [fetchBills]
  );

  const filtered = useMemo(
    () =>
      bills.filter((b) => {
        if (catFilter !== "all" && b.category !== catFilter) return false;
        if (statusFilter !== "all" && b.status !== statusFilter) return false;
        if (
          search &&
          !b.description.toLowerCase().includes(search.toLowerCase()) &&
          !b.provider?.toLowerCase().includes(search.toLowerCase())
        ) {
          return false;
        }
        return true;
      }),
    [bills, catFilter, statusFilter, search]
  );

  const catIcon: Record<BillCategory, React.ReactNode> = {
    electricity: <Zap className="h-4 w-4 text-yellow-500" />,
    water: <Droplets className="h-4 w-4 text-blue-500" />,
    internet: <Wifi className="h-4 w-4 text-purple-500" />,
    gas: <Flame className="h-4 w-4 text-orange-500" />,
    dth: <Tv className="h-4 w-4 text-red-500" />,
    phone: <Smartphone className="h-4 w-4 text-green-500" />,
  };

  const statusStyle: Record<BillStatus, string> = {
    paid: "bg-green-500/10 text-green-500 border-green-500/30",
    unpaid: "bg-orange-500/10 text-orange-500 border-orange-500/30",
    overdue: "bg-red-500/10 text-red-500 border-red-500/30",
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Loading Bills...</div>;

  return (
    <div className="space-y-5 fade-up p-2">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-card border border-border rounded-2xl p-4 shadow-sm">
        <StatBox label="Total" value={filtered.length} />
        <StatBox label="Amount" value={`₹${filtered.reduce((s, b) => s + b.amount, 0).toLocaleString()}`} highlight />
        <StatBox label="Unpaid" value={filtered.filter(b => b.status === 'unpaid').length} color="text-orange-500" />
        <StatBox label="Overdue" value={filtered.filter(b => b.status === 'overdue').length} color="text-red-500" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end bg-secondary/30 p-4 rounded-2xl border border-border/50">
        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Search</label>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bills..."
            className="h-10 bg-background border-border mt-1"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Category</label>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value as BillCategory | "all")}
            className="h-10 w-full rounded-md bg-background border border-border px-3 text-sm mt-1 focus:ring-2 ring-primary/20 outline-none"
          >
            <option value="all">All Types</option>
            {(Object.keys(categoryLabels) as BillCategory[]).map((cat) => (
              <option key={cat} value={cat}>{categoryEmojis[cat]} {categoryLabels[cat]}</option>
            ))}
          </select>
        </div>
        <Button onClick={fetchBills} variant="outline" className="h-10 rounded-xl">🔄</Button>
      </div>

      {/* Bills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((bill) => (
          <div
            key={bill.id}
            className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-1 h-full ${bill.status === 'paid' ? 'bg-green-500' : 'bg-orange-500'}`} />
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-secondary group-hover:bg-primary/10 transition-colors">
                {catIcon[bill.category]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xl">₹{bill.amount.toLocaleString()}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusStyle[bill.status]}`}>
                    {bill.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">{bill.provider}</p>
              </div>
              <div className="flex gap-2">
                {bill.status !== "paid" && (
                  <Button
                    size="icon"
                    className="h-9 w-9 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg shadow-green-500/20"
                    onClick={() => markPaid(bill.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl" onClick={() => setSelectedBill(bill)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setSelectedBill(null)}>
          <div className="bg-card border border-border rounded-3xl p-8 w-full max-w-md shadow-2xl scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 rounded-2xl bg-primary/10">{catIcon[selectedBill.category]}</div>
              <button onClick={() => setSelectedBill(null)} className="p-2 hover:bg-secondary rounded-full"><X className="h-5 w-5"/></button>
            </div>
            <h3 className="text-2xl font-black mb-1">{categoryLabels[selectedBill.category]}</h3>
            <p className="text-muted-foreground mb-6">{selectedBill.provider}</p>
            
            <div className="space-y-4 mb-8">
              <InfoRow label="Amount Due" value={`₹${selectedBill.amount}`} bold />
              <InfoRow label="Bill Date" value={selectedBill.billDate} />
              <InfoRow label="Due Date" value={selectedBill.dueDate} />
              <InfoRow label="Status" value={selectedBill.status.toUpperCase()} />
            </div>

            {selectedBill.status !== "paid" && (
              <Button className="w-full h-12 rounded-2xl text-lg font-bold" onClick={() => { markPaid(selectedBill.id); setSelectedBill(null); }}>
                Pay Now
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const StatBox = ({ label, value, highlight, color }: any) => (
  <div className="text-center p-2">
    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{label}</p>
    <p className={`text-lg font-black ${highlight ? 'text-primary' : color || 'text-foreground'}`}>{value}</p>
  </div>
);

const InfoRow = ({ label, value, bold }: any) => (
  <div className="flex justify-between items-center py-2 border-b border-border/50">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className={`text-sm ${bold ? 'font-bold text-lg' : 'font-medium'}`}>{value}</span>
  </div>
);

export default BillsList;