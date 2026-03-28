"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, TrendingUp, TrendingDown, Zap, BarChart3, Bell, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type AlertType = "bullish" | "bearish" | "warning" | "opportunity" | "info"

interface MarketAlert {
  id: string
  type: AlertType
  symbol: string
  title: string
  description: string
  timestamp: string
  confidence: number
}

// These act as templates now!
const alertTemplates: MarketAlert[] = [
  {
    id: "1",
    type: "bullish",
    symbol: "MOCK",
    title: "Strong Buy Signal Detected",
    description: "RSI oversold recovery combined with bullish MACD crossover. Historical patterns suggest 78% probability of 5% gain within 2 weeks.",
    timestamp: "2 min ago",
    confidence: 87,
  },
  {
    id: "2",
    type: "warning",
    symbol: "MOCK",
    title: "High Volatility Alert",
    description: "Unusual options activity detected with IV spike of 45%. Consider adjusting position size or implementing protective strategies.",
    timestamp: "8 min ago",
    confidence: 92,
  },
  {
    id: "3",
    type: "opportunity",
    symbol: "MOCK",
    title: "Support Level Bounce",
    description: "Price testing key support with strong buying volume. AI models indicate favorable risk/reward ratio for long entry.",
    timestamp: "15 min ago",
    confidence: 74,
  },
  {
    id: "4",
    type: "bearish",
    symbol: "SPY", // Keep some as general market indicators
    title: "Market Distribution Pattern",
    description: "Institutional selling pressure detected over past 3 sessions. Consider taking partial profits or tightening stops.",
    timestamp: "23 min ago",
    confidence: 68,
  },
  {
    id: "5",
    type: "info",
    symbol: "MOCK",
    title: "Earnings Approaching",
    description: "Quarterly report scheduled soon. Historical volatility suggests significant movement expected. Review position sizing.",
    timestamp: "31 min ago",
    confidence: 95,
  },
  {
    id: "6",
    type: "bullish",
    symbol: "QQQ", // General market indicator
    title: "Tech Sector Breakout",
    description: "Index closed above 50-day MA with above-average volume. Momentum indicators aligned for potential trend continuation.",
    timestamp: "45 min ago",
    confidence: 81,
  },
]

const alertConfig: Record<AlertType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  bullish: { icon: TrendingUp, color: "text-primary", bg: "bg-primary/10", label: "Bullish" },
  bearish: { icon: TrendingDown, color: "text-destructive", bg: "bg-destructive/10", label: "Bearish" },
  warning: { icon: AlertTriangle, color: "text-chart-4", bg: "bg-chart-4/10", label: "Warning" },
  opportunity: { icon: Zap, color: "text-chart-3", bg: "bg-chart-3/10", label: "Opportunity" },
  info: { icon: BarChart3, color: "text-muted-foreground", bg: "bg-muted/50", label: "Info" },
}

function AlertCard({ alert }: { alert: MarketAlert }) {
  const config = alertConfig[alert.type]
  const Icon = config.icon

  return (
    <div className="group p-4 rounded-lg bg-card/50 border border-border/50 hover:border-border hover:bg-card transition-all cursor-pointer">
      <div className="flex items-start gap-4">
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", config.bg)}>
          <Icon className={cn("h-5 w-5", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="outline" className={cn("font-mono text-xs uppercase", config.color)}>
              {alert.symbol}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {config.label}
            </Badge>
            <span className="text-xs text-muted-foreground ml-auto">{alert.timestamp}</span>
          </div>
          <h3 className="font-semibold text-sm text-foreground mb-1">{alert.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{alert.description}</p>
          <div className="flex items-center gap-2 mt-3">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-xs text-muted-foreground">AI Confidence:</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[100px]">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  alert.confidence >= 80 ? "bg-primary" : alert.confidence >= 60 ? "bg-chart-4" : "bg-muted-foreground"
                )}
                style={{ width: `${alert.confidence}%` }}
              />
            </div>
            <span className={cn(
              "text-xs font-medium",
              alert.confidence >= 80 ? "text-primary" : alert.confidence >= 60 ? "text-chart-4" : "text-muted-foreground"
            )}>
              {alert.confidence}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- NEW: Accepting the ticker prop here! ---
export function MarketAlertsFeed({ ticker = "AAPL" }: { ticker?: string }) {
  const [feed, setFeed] = useState<MarketAlert[]>([]);

  // --- NEW: Dynamically update the feed whenever the ticker changes ---
  useEffect(() => {
    // We take our mock templates and inject the active ticker into the relevant alerts
    const dynamicAlerts = alertTemplates.map((alert, index) => {
      // Replace "MOCK" with the actual ticker the user searched for
      if (alert.symbol === "MOCK") {
        return { 
          ...alert, 
          symbol: ticker, 
          // Give it a new ID so React forces a re-render animation
          id: `${alert.id}-${ticker}-${Date.now()}` 
        }
      }
      return alert;
    });

    // Optional: Shuffle the array slightly so it looks like fresh news
    const shuffled = [...dynamicAlerts].sort(() => Math.random() - 0.5);
    
    setFeed(shuffled);
  }, [ticker]);

  return (
    <Card className="flex-1 flex flex-col border-border/50">
      <CardHeader className="border-b border-border/50 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">AI Market Alerts</CardTitle>
              <p className="text-xs text-muted-foreground">Real-time insights powered by machine learning</p>
            </div>
          </div>
          <Badge variant="outline" className="text-primary border-primary/30">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse mr-1.5" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-4">
        <div className="space-y-3">
          {feed.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}