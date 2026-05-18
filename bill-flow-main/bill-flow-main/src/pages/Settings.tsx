"use client";

import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Bell, Palette, Shield, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { categoryLabels, type BillCategory } from "@/data/bills";

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ name: "User", email: "" });
  const [budgets, setBudgets] = useState<Record<string, string>>({});
  
  const [notifications, setNotifications] = useState({
    dueDateReminder: true,
    overdueAlert: true,
    paymentConfirmation: true,
    monthlyReport: false,
    budgetWarning: true,
  });

  // 🔥 Fix: Smart Session Recovery logic
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;

    const fetchProfile = async () => {
      console.log(`⚙️ Settings: Fetching Profile (Attempt ${retryCount + 1})...`);
      
      try {
        // 1. Check for current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setProfile({ 
            name: session.user.user_metadata?.full_name || "User", 
            email: session.user.email || "" 
          });
          console.log("✅ Profile Loaded Successfully!");
          setLoading(false);
          return;
        }

        // 2. If no session, wait and retry (fixes the "No active session" race condition)
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(fetchProfile, 1000); // Retry after 1 second
        } else {
          console.warn("⚠️ No active session found after retries.");
          setLoading(false);
          // Optional: toast.error("Please login to see your profile");
        }
      } catch (err: any) {
        console.error("❌ Settings Error:", err.message);
        setLoading(false);
      }
    };

    // 3. Listen for auth changes (Real-time sync)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setProfile({ 
          name: session.user.user_metadata?.full_name || "User", 
          email: session.user.email || "" 
        });
        setLoading(false);
      }
    });

    fetchProfile();

    return () => subscription.unsubscribe();
  }, []);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: profile.name }
      });

      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBudgets = () => {
    toast.success("Budget limits saved!");
  };

  // Professional Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="relative">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse"></div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-black text-foreground tracking-tight">BILL MANAGER AUTH SYNC</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] animate-pulse">
            Verifying Secure Session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-up p-4">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black mb-1">Settings</h2>
          <p className="text-sm text-muted-foreground">Manage your BILL MANAGER profile & preferences</p>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-primary/20 transition-all">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary"><User className="h-5 w-5" /></div>
          <h3 className="font-bold text-lg">Profile Information</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground ml-1 tracking-wider">Full Name</label>
            <Input 
              value={profile.name} 
              onChange={(e) => setProfile({...profile, name: e.target.value})} 
              className="bg-secondary/50 border-border rounded-xl h-11 focus:ring-primary/50" 
              placeholder="Your Name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground ml-1 tracking-wider">Email (Secure)</label>
            <Input value={profile.email} disabled className="bg-secondary/30 border-border rounded-xl h-11 opacity-60 cursor-not-allowed" />
          </div>
        </div>

        <Button onClick={handleSaveProfile} disabled={loading} className="rounded-xl px-8 font-bold gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Update Changes
        </Button>
      </div>

      {/* Notifications */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500"><Bell className="h-5 w-5" /></div>
          <h3 className="font-bold text-lg">Smart Notifications</h3>
        </div>
        <div className="space-y-3">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors">
              <p className="text-sm font-bold capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
              <button
                onClick={() => setNotifications(n => ({ ...n, [key]: !value }))}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${value ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]" : "bg-muted"}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${value ? "translate-x-6" : ""}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Budgets */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-green-500/10 text-green-500"><Shield className="h-5 w-5" /></div>
          <h3 className="font-bold text-lg">Monthly Budgeting</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.keys(categoryLabels) as BillCategory[]).map((cat) => (
            <div key={cat} className="bg-secondary/30 border border-border/50 rounded-xl p-4 focus-within:border-primary/40 transition-all">
              <label className="text-[10px] font-bold uppercase text-muted-foreground mb-2 block">{categoryLabels[cat]}</label>
              <div className="flex items-center gap-2">
                <span className="font-black text-primary text-lg">₹</span>
                <Input type="number" placeholder="0.00" className="bg-transparent border-none focus-visible:ring-0 p-0 text-lg font-black h-auto" />
              </div>
            </div>
          ))}
        </div>
        <Button className="mt-6 rounded-xl font-bold bg-green-600 hover:bg-green-700 w-full shadow-lg shadow-green-600/20" onClick={handleSaveBudgets}>
          Sync All Limits
        </Button>
      </div>

      <div className="text-center pt-4 opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Syncura Secure V1.0</p>
      </div>
    </div>
  );
};

export default Settings;