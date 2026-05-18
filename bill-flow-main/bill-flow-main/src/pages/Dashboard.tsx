"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "../supabaseClient";
import { 
  IndianRupee, AlertTriangle, Zap, Droplets, Wifi, Clock, 
  Flame, Tv, Smartphone, TrendingUp, CreditCard, ShieldCheck, 
  PiggyBank, RefreshCcw
} from "lucide-react";
import {
  categoryLabels,
  categoryEmojis,
  type BillCategory,
  type BillStatus,
} from "@/data/bills";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button } from "@/components/ui/button";

type BillRow = {
  id: number;
  amount: number;
  vendor: string | null;
  bill_date: string;
  status: BillStatus;
  category?: BillCategory;
};

type PaymentType = {
  id: number;
  bill_id: number;
  amount: number;
  method: string;
  transaction_id: string;
  paid_date: string;
  bills?: any;
};

const getCategoryColor = (category: BillCategory): string => {
  const colors: Record<BillCategory, string> = {
    electricity: "hsl(14, 100%, 56%)",
    water: "hsl(211, 74%, 48%)",
    internet: "hsl(262, 83%, 58%)",
    gas: "hsl(30, 89%, 61%)",
    dth: "hsl(348, 100%, 55%)",
    phone: "hsl(171, 100%, 32%)",
  };
  return colors[category] || "hsl(220, 14%, 55%)";
};

const tooltipStyle = {
  backgroundColor: "hsl(220, 18%, 13%)",
  border: "1px solid hsl(220, 14%, 20%)",
  borderRadius: 8,
  color: "hsl(210, 20%, 92%)",
};

const Dashboard = () => {
  const [bills, setBills] = useState<any[]>([]);
  const [payments, setPayments] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBills = useCallback(async () => {
    console.log("🔄 Dashboard: Fetching bills from Supabase...");
    try {
      const { data, error } = await supabase
        .from("bills")
        .select("*")
        .order("bill_date", { ascending: true });

      if (error) throw error;

      const mapped: any[] = (data as BillRow[]).map((row) => ({
        id: row.id.toString(),
        amount: row.amount,
        category: (row.category as BillCategory) ?? "electricity",
        status: (row.status as BillStatus) ?? "unpaid",
        provider: row.vendor ?? "",
        description: row.vendor ?? "",
        billDate: row.bill_date,
        dueDate: row.bill_date,
        accountNumber: "",
      }));

      setBills(mapped);
    } catch (err) {
      console.error("❌ Dashboard fetch error:", err);
      toast.error("Failed to load bills");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("payments")
        .select("*, bills(*)")
        .order("paid_date", { ascending: false });
      setPayments(data || []);
    } catch (error) {
      console.error("Payments fetch error:", error);
    }
  }, []);

  // 🔥 Fix: Combined useEffect with Proper Dependency Array
  useEffect(() => {
    fetchBills();
    fetchPayments();

    // Setup Realtime listener for immediate updates
    const channel = supabase
      .channel('dashboard-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bills' }, () => {
        fetchBills();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBills, fetchPayments]);

  const validBills = useMemo(() => 
    bills.filter((b: any) => b?.billDate && typeof b.billDate === 'string'), 
    [bills]
  );

  const stats = useMemo(() => {
    const marchBills = validBills.filter((b: any) => b.billDate?.startsWith("2026-03"));
    const totalThisMonth = marchBills.reduce((s: number, b: any) => s + b.amount, 0);
    const pending = bills.filter((b: any) => b.status === "unpaid" || b.status === "overdue");
    const upcoming = bills.filter((b: any) => b.status === "unpaid").slice(0, 4);
    const totalPaid = bills.filter((b: any) => b.status === "paid").reduce((s: number, b: any) => s + b.amount, 0);
    const overdueBills = bills.filter((b: any) => b.status === "overdue");
    const totalBills = bills.length;
    const paidBills = bills.filter((b: any) => b.status === "paid").length;
    
    return { totalThisMonth, pendingCount: pending.length, upcoming, totalPaid, overdueBills, totalBills, paidBills };
  }, [bills, validBills]);

  const pieData = useMemo(() => {
    const marchBills = validBills.filter((b: any) => b.billDate?.startsWith("2026-03"));
    const categoryTotals: Record<BillCategory, number> = {
      electricity: 0, water: 0, internet: 0, gas: 0, dth: 0, phone: 0
    };

    marchBills.forEach((bill: any) => {
      const cat = bill.category as BillCategory;
      if (categoryTotals[cat] !== undefined) categoryTotals[cat] += bill.amount;
    });

    return (Object.keys(categoryTotals) as BillCategory[])
      .map((cat) => ({
        name: categoryLabels[cat],
        value: categoryTotals[cat],
        color: getCategoryColor(cat)
      }))
      .filter((d) => d.value > 0);
  }, [validBills]);

  const recentPayments = useMemo(() => 
    payments.slice(0, 5).map((p: any) => ({
      ...p,
      billCategory: p.bills?.category ? categoryLabels[p.bills.category as BillCategory] : "Unknown"
    })), [payments]
  );

  const monthlyTotals = useMemo(() => {
    const totals: { month: string; total: number }[] = [];
    const months = ["2026-03", "2026-02", "2026-01"];
    
    months.forEach((month) => {
      const monthBills = validBills.filter((b: any) => b.billDate?.startsWith(month));
      totals.push({ month, total: monthBills.reduce((s: number, b: any) => s + b.amount, 0) });
    });
    
    return totals;
  }, [validBills]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse bg-secondary rounded-xl h-24" />
          ))}
        </div>
        <div className="animate-pulse bg-secondary rounded-xl h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black">BILL MANAGER</h2>
          <p className="text-sm text-muted-foreground">Welcome back! Here's your utility overview.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => { setLoading(true); fetchBills(); fetchPayments(); }} 
          className="h-9 gap-2 font-bold"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-in">
        <StatCard icon={<IndianRupee className="h-5 w-5" />} label="Total This Month" value={`₹${stats.totalThisMonth.toLocaleString()}`} accent="primary" />
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Pending Bills" value={stats.pendingCount.toString()} accent="accent" />
        <StatCard icon={<ShieldCheck className="h-5 w-5" />} label="Total Paid" value={`₹${stats.totalPaid.toLocaleString()}`} accent="primary" />
        <StatCard icon={<PiggyBank className="h-5 w-5" />} label="Payment Rate" value={`${stats.totalBills > 0 ? Math.round((stats.paidBills / stats.totalBills) * 100) : 0}%`} accent="primary" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger-in">
        <div className="bg-card border border-border rounded-xl p-5 card-hover">
          <h3 className="font-semibold mb-4">Monthly Totals</h3>
          {monthlyTotals.some((m) => m.total > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyTotals}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" />
                <XAxis dataKey="month" stroke="hsl(215, 14%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(215, 14%, 55%)" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="total" stroke="hsl(142, 60%, 45%)" strokeWidth={3} dot={{ fill: "hsl(142, 60%, 45%)", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm font-medium">No monthly data yet</div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5 card-hover">
          <h3 className="font-semibold mb-4">Category Split (March)</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm font-medium">No March data yet</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent" /> Upcoming Due Bills
          </h3>
          <div className="space-y-3">
            {stats.upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8 bg-secondary/20 rounded-lg">No upcoming bills 🎉</p>
            ) : (
              stats.upcoming.map((bill: any) => (
                <div key={bill.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary"><CategoryIcon category={bill.category} size={4} /></div>
                    <div>
                      <p className="text-sm font-bold">{categoryLabels[bill.category]}</p>
                      <p className="text-xs text-muted-foreground">Due: {bill.dueDate} · {bill.provider}</p>
                    </div>
                  </div>
                  <span className="font-black text-sm">₹{bill.amount.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" /> Recent Payments
          </h3>
          <div className="space-y-3">
            {recentPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8 bg-secondary/20 rounded-lg">No payments yet 💳</p>
            ) : (
              recentPayments.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-status-paid/10"><CreditCard className="h-4 w-4 text-status-paid" /></div>
                    <div>
                      <p className="text-sm font-bold">{p.billCategory}</p>
                      <p className="text-[11px] text-muted-foreground">{p.paid_date} · {p.method}</p>
                    </div>
                  </div>
                  <span className="font-black text-sm text-status-paid">₹{p.amount.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {stats.overdueBills.length > 0 && (
        <div className="bg-status-overdue/5 border border-status-overdue/20 rounded-xl p-5 animate-pulse">
          <h3 className="font-black mb-3 flex items-center gap-2 text-status-overdue uppercase text-xs tracking-widest">
            <AlertTriangle className="h-4 w-4" /> Action Required: Overdue Bills
          </h3>
          <div className="space-y-2">
            {stats.overdueBills.map((bill: any) => (
              <div key={bill.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-status-overdue/10">
                <div className="flex items-center gap-3">
                  <CategoryIcon category={bill.category} size={4} />
                  <div>
                    <p className="text-sm font-bold">{categoryLabels[bill.category]}</p>
                    <p className="text-xs text-muted-foreground">Late by: {bill.dueDate}</p>
                  </div>
                </div>
                <span className="font-black text-status-overdue">₹{bill.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) => (
  <div className="bg-card border border-border rounded-xl p-5 card-hover shadow-sm">
    <div className="flex items-center gap-3 mb-3">
      <div className={`p-2 rounded-lg ${accent === "primary" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>{icon}</div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
    <p className="text-2xl font-black tracking-tight">{value}</p>
  </div>
);

const CategoryIcon = ({ category, size = 4 }: { category: BillCategory; size?: number }) => {
  const iconClass = `h-${size} w-${size}`;
  const icons: Record<BillCategory, React.ReactNode> = {
    electricity: <Zap className={`${iconClass} text-electricity`} />,
    water: <Droplets className={`${iconClass} text-water`} />,
    internet: <Wifi className={`${iconClass} text-internet`} />,
    gas: <Flame className={`${iconClass} text-gas`} />,
    dth: <Tv className={`${iconClass} text-dth`} />,
    phone: <Smartphone className={`${iconClass} text-phone`} />,
  };
  return <>{icons[category]}</>;
};

export default Dashboard;