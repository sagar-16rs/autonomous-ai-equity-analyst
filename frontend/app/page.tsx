"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { PortfolioSidebar } from "@/components/dashboard/portfolio-sidebar"
import { MarketAlertsFeed } from "@/components/dashboard/market-alerts-feed"

// Dynamically import the chart with SSR turned off
const RSIPriceChart = dynamic(
  () => import("@/components/dashboard/rsi-price-chart").then((mod) => mod.RSIPriceChart),
  { ssr: false }
);

export default function DashboardPage() {
  const [tickerInput, setTickerInput] = useState<string>(""); 
  const [activeTicker, setActiveTicker] = useState<string>("AAPL"); // <-- NEW: Controls the whole dashboard
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [currentTime, setCurrentTime] = useState<string>("--:--");

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
  }, []);

  const triggerAgent = async () => {
    if (!tickerInput.trim()) return; 
    
    setLoading(true);
    setResult(null);
    setError(null);

    const cleanTicker = tickerInput.trim().toUpperCase(); // Normalize input

    try {
      const response = await fetch("http://localhost:8000/api/run-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: cleanTicker }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      setResult(data.alert); 
      setActiveTicker(cleanTicker); // <-- NEW: Update the rest of the dashboard on success!
      setTickerInput(""); // Clear the search bar
      
    } catch (err) {
      console.error("Agent Error:", err);
      setError("Failed to reach the AI backend. Is your FastAPI server running on port 8000?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <PortfolioSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-border bg-card/50 flex items-center px-6 shrink-0 justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-medium text-foreground">Dashboard: <span className="text-blue-500 font-bold">{activeTicker}</span></h2>
            <span className="text-xs text-muted-foreground">
              Last updated: {currentTime}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-[600px]">
            
            <div className="lg:col-span-2">
              {/* --- NEW: Passing the active ticker to the chart! --- */}
              <RSIPriceChart ticker={activeTicker} />
            </div>

            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">LangGraph AI Analyst</h3>
                  <p className="text-sm text-muted-foreground">Analyze real-time market data for any stock.</p>
                </div>
                {loading && (
                  <div className="flex items-center gap-2 text-sm text-blue-500 font-medium animate-pulse">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    Executing Agent Pipeline...
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <input 
                  type="text" 
                  placeholder="Enter Stock Ticker (e.g., RELIANCE, TCS, ZOMATO)" 
                  value={tickerInput}
                  onChange={(e) => setTickerInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && triggerAgent()}
                  className="flex-1 p-4 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all uppercase placeholder:normal-case"
                />
                <button
                  onClick={triggerAgent}
                  disabled={loading || !tickerInput.trim()}
                  className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {loading ? "Analyzing..." : "Run AI Analysis"}
                </button>
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20 mb-4">
                  {error}
                </div>
              )}

              {/* --- UPGRADED: A clean, professional UI for the Agent's output --- */}
              {result && (
                <div className="bg-[#0f172a] border border-blue-900/50 p-6 rounded-xl shadow-inner mt-4">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-blue-900/30">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-blue-400">Strategist Output: {activeTicker}</h4>
                  </div>
                  <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {result}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 flex min-h-[400px]">
              {/* --- NEW: Passing the active ticker to the alerts feed! --- */}
              <MarketAlertsFeed ticker={activeTicker} />
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}