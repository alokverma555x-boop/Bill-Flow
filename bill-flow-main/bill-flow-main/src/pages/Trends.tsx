"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "../supabaseClient";
import { Button } from "@/components/ui/button";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, 
  BarChart, Bar, AreaChart, Area, Cell 
} from "recharts";
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  categoryLabels,
  type BillCategory,
  type BillStatus,
  categoryColors
} from "@/data/bills";

const tooltipStyle = {
  backgroundColor: "hsl(220, 18%, 13%)",
  border: "1px solid hsl(220, 14%, 20%)",
  borderRadius: 8,
  color: "hsl(210, 20%, 92%)",
};

const Trends = () => {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bills")
        .select("*")
        .order("bill_date", { ascending: true });

      if (error) throw error;

      const mapped = (data || []).map((row: any) => ({
        id: row.id.toString(),
        amount: row.amount,
        category: (row.category as BillCategory) ?? "electricity",
        status: (row.status as BillStatus) ?? "unpaid",
        provider: row.vendor || row.provider || "Unknown",
        billDate: row.bill_date,
      }));

      setBills(mapped);
    } catch (err) {
      toast.error("Failed to load trends");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  // 🔥 REALTIME SYNC: Graph will update automatically on any bill change
  useEffect(() => {
    const channel = supabase
      .channel("trends-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "bills" }, () => fetchBills())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchBills]);

  const validBills = useMemo(() => bills.filter((b) => b?.billDate), [bills]);

  const monthlyTotals = useMemo(() => {
    const months = ["2026-03", "2026-02", "2026-01", "2025-12", "2025-11", "2025-10"];
    return months.map((month) => {
      const monthBills = validBills.filter((b) => b.billDate?.startsWith(month));
      const categoryTotals: any = {};
      (Object.keys(categoryLabels) as BillCategory[]).forEach(cat => {
        categoryTotals[cat] = monthBills.filter(b => b.category === cat).reduce((s, b) => s + b.amount, 0);
      });

      return {
        month,
        total: monthBills.reduce((s, b) => s + b.amount, 0),
        ...categoryTotals
      };
    }).reverse();
  }, [validBills]);

  const last = monthlyTotals[monthlyTotals.length - 1] || { total: 0 };
  const prev = monthlyTotals[monthlyTotals.length - 2] || { total: 0 };
  const diff = last.total - prev.total;
  const pct = prev.total ? ((diff / prev.total) * 100).toFixed(1) : "0.0";

  const categoryTotalData = useMemo(() => {
    return (Object.keys(categoryColors) as BillCategory[]).map(cat => ({
      category: categoryLabels[cat],
      total: validBills.filter(b => b.category === cat).reduce((s, b) => s + b.amount, 0),
      fill: categoryColors[cat]
    })).filter(d => d.total > 0);
  }, [validBills]);

  if (loading) return <div className="p-10 text-center animate-pulse">Analyzing Trends...</div>;

  return (
    <div className="space-y-6 fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Trend Analysis</h2>
          <p className="text-sm text-muted-foreground">Live data from BILL MANAGER</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchBills}>🔄 Refresh</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat label="Avg. Monthly" value={`₹${Math.round(monthlyTotals.reduce((s, m) => s + m.total, 0) / (monthlyTotals.length || 1))}`} />
        <MiniStat label="This Month" value={`₹${last.total}`} sub={`${diff > 0 ? "+" : ""}${pct}%`} />
        <MiniStat label="Total Records" value={validBills.length.toString()} />
        <MiniStat label="Status" value="Live Sync" color="text-green-500" />
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Monthly Spending</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyTotals}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="month" fontSize={10} />
            <YAxis fontSize={10} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="total" stroke="hsl(142, 60%, 45%)" fill="hsl(142, 60%, 45%, 0.2)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold mb-4 text-sm">Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryTotalData}>
              <XAxis dataKey="category" fontSize={10} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {categoryTotalData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold mb-4 text-sm">Insights</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
              <span className="text-sm">Highest Expense</span>
              <span className="font-bold">₹{Math.max(...monthlyTotals.map(m => m.total))}</span>
            </div>
            <div className={`flex justify-between items-center p-3 rounded-lg ${diff > 0 ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
              <span className="text-sm">Monthly Change</span>
              <span className={`font-bold ${diff > 0 ? 'text-red-500' : 'text-green-500'}`}>{diff > 0 ? <TrendingUp className="inline h-4 w-4 mr-1"/> : <TrendingDown className="inline h-4 w-4 mr-1"/>} ₹{Math.abs(diff)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MiniStat = ({ label, value, sub, color }: any) => (
  <div className="bg-card border border-border rounded-xl p-4">
    <p className="text-[10px] text-muted-foreground uppercase font-bold">{label}</p>
    <p className={`text-lg font-black ${color || ''}`}>{value}</p>
    {sub && <p className="text-[10px] font-medium opacity-70">{sub}</p>}
  </div>
);

export default Trends;