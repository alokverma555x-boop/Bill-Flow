import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Menu, X, Zap, Bell, BarChart3, Shield, Clock, CreditCard, FileText, ArrowRight, Receipt, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "../supabaseClient";


const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bills, setBills] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getBills = async () => {
      const { data, error } = await supabase
        .from("bills")
        .select("*");

      if (error) {
        console.error("Supabase error:", error.message);
        return;
      }

      setBills(data || []);
    };

    getBills();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-display text-xl font-bold">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-foreground">Bill</span>
            <span className="text-gradient">Flow</span>
          </a>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">How It Works</a>
            <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Log In</Button>
            <Button size="sm" onClick={() => navigate("/signup")}>Sign Up</Button>
          </div>
          <button className="md:hidden text-foreground" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-border bg-background p-4 md:hidden">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-sm text-muted-foreground" onClick={() => setMenuOpen(false)}>Features</a>
              <a href="#how-it-works" className="text-sm text-muted-foreground" onClick={() => setMenuOpen(false)}>How It Works</a>
              <a href="#pricing" className="text-sm text-muted-foreground" onClick={() => setMenuOpen(false)}>Pricing</a>
              <div className="flex gap-3 pt-2">
                <Button className="flex-1" variant="ghost" onClick={() => navigate("/login")}>
                  Log In
                </Button>
                <Button className="flex-1" onClick={() => navigate("/signup")}>
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid pt-16">
        <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="container relative z-10 flex flex-col items-center text-center gap-8 py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-xs text-muted-foreground">
            <Receipt className="h-3.5 w-3.5 text-primary" />
            Smart Bill Management for Everyone
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="font-display text-4xl font-bold leading-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl">
            Take Control of Your{" "}<span className="text-gradient">Bills & Payments</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-2xl text-lg text-muted-foreground">
            Track, organize, and automate your bill payments in one place. Never miss a due date again with smart reminders and analytics.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="gap-2 text-base font-semibold" onClick={() => navigate("/login")}>
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-8 w-full max-w-4xl rounded-xl border border-border bg-card p-1 glow-green"
          >
            <div className="rounded-lg bg-secondary/50 p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Due This Month", value: "$2,340", color: "text-primary" },
                  { label: "Paid", value: "$1,890", color: "text-foreground" },
                  { label: "Overdue", value: "$0", color: "text-primary" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg border border-border bg-card p-4 text-center">
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Demo + Supabase bills list */}
              <div className="mt-6 w-full max-w-xl mx-auto">
                {bills.map((bill) => (
                  <div
                    key={bill.id}
                    className="flex justify-between border border-border bg-card px-4 py-2 rounded mb-2"
                  >
                    <span className="text-sm">{bill.vendor}</span>
                    <span className="text-sm font-semibold">₹{bill.amount}</span>
                  </div>
                ))}

                {bills.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    No bills found yet.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 relative">
        <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary mb-2">Features</p>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Everything You Need to <span className="text-gradient">Manage Bills</span></h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Powerful tools designed to simplify your financial life and keep you on top of every payment.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Bell, title: "Smart Reminders", desc: "Get notified before bills are due so you never miss a payment." },
              { icon: BarChart3, title: "Spending Analytics", desc: "Visualize your spending patterns and find ways to save money." },
              { icon: Shield, title: "Secure & Private", desc: "Bank-level encryption keeps your financial data safe." },
              { icon: Clock, title: "Auto-Pay Setup", desc: "Set up automatic payments for recurring bills with one click." },
              { icon: CreditCard, title: "Multi-Account", desc: "Manage bills across multiple bank accounts and credit cards." },
              { icon: FileText, title: "Receipt Storage", desc: "Store and organize digital receipts for easy reference." },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:glow-green"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 border-t border-border">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary mb-2">How It Works</p>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Get Started in <span className="text-gradient">3 Steps</span></h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { num: "01", title: "Sign Up", desc: "Create your free account in seconds." },
              { num: "02", title: "Add Your Bills", desc: "Import or manually add your recurring bills." },
              { num: "03", title: "Stay On Track", desc: "Get reminders, track payments, and save money." },
            ].map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-display text-xl font-bold text-primary">{s.num}</div>
                <h3 className="font-display text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Zap className="h-5 w-5 text-primary" />
            <span>Bill</span>
            <span className="text-gradient">Flow</span>
          </div>

          <a
            href="https://github.com/koushal52/MeetAI"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary"
          >
            <Github className="h-5 w-5" />
            GitHub
          </a>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BillFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;