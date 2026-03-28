"use client"

import { useState, useEffect } from "react"
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Activity, TrendingUp, TrendingDown } from "lucide-react"

const timeframes = ["1D", "1W", "1M", "3M", "1Y"] as const

// Generate mock data for RSI vs Price
function generateMockData(days: number) {
  const data = []
  let price = 175
  let rsi = 50

  for (let i = 0; i < days; i++) {
    const priceChange = (Math.random() - 0.48) * 5
    price = Math.max(150, Math.min(210, price + priceChange))

    const rsiTarget = priceChange > 0 ? 55 + Math.random() * 25 : 45 - Math.random() * 25
    rsi = rsi * 0.7 + rsiTarget * 0.3
    rsi = Math.max(15, Math.min(85, rsi))

    const date = new Date()
    date.setDate(date.getDate() - (days - i))

    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: Number(price.toFixed(2)),
      rsi: Number(rsi.toFixed(1)),
    })
  }
  return data
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground capitalize">{entry.dataKey}</span>
          <span
            className={cn(
              "text-sm font-semibold",
              entry.dataKey === "rsi" ? "text-chart-3" : "text-primary"
            )}
          >
            {entry.dataKey === "price" ? `$${entry.value}` : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// --- NEW: Added the ticker prop with a default of AAPL ---
export function RSIPriceChart({ ticker = "AAPL" }: { ticker?: string }) {
  const [timeframe, setTimeframe] = useState<typeof timeframes[number]>("1M")
  const [data, setData] = useState<ReturnType<typeof generateMockData>>([])

  // --- NEW: Regenerate data whenever the ticker or timeframe changes ---
  // (In the future, you will replace generateMockData with a real API fetch here)
  useEffect(() => {
    let days = 30;
    if (timeframe === "1D") days = 24;
    if (timeframe === "1W") days = 7;
    if (timeframe === "1M") days = 30;
    if (timeframe === "3M") days = 90;
    if (timeframe === "1Y") days = 365;

    let newData = generateMockData(days);
    
    // Adjust 1D format
    if (timeframe === "1D") {
      newData = newData.map((d, i) => ({ ...d, date: `${i}:00` }));
    }
    
    setData(newData);
  }, [ticker, timeframe]);

  const currentPrice = data[data.length - 1]?.price ?? 0
  const previousPrice = data[data.length - 2]?.price ?? 0
  const priceChange = currentPrice - previousPrice
  const priceChangePercent = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0

  const currentRSI = data[data.length - 1]?.rsi ?? 0
  const rsiStatus = currentRSI > 70 ? "Overbought" : currentRSI < 30 ? "Oversold" : "Neutral"
  const rsiColor = currentRSI > 70 ? "text-destructive" : currentRSI < 30 ? "text-primary" : "text-chart-3"

  // Prevent crashing while generating data
  if (data.length === 0) return <div className="h-[400px] flex items-center justify-center">Loading chart...</div>;

  return (
    <Card className="border-border/50">
      <CardHeader className="border-b border-border/50 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-chart-3/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-chart-3" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                {/* --- NEW: Dynamic Ticker Title --- */}
                <CardTitle className="text-base uppercase">{ticker}</CardTitle>
                <span className="text-sm text-muted-foreground">Market Data</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">${currentPrice.toFixed(2)}</span>
                <span className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  priceChange >= 0 ? "text-primary" : "text-destructive"
                )}>
                  {priceChange >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)} ({priceChangePercent >= 0 ? "+" : ""}{priceChangePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-4">
              <Badge variant="outline" className={cn("font-mono", rsiColor)}>
                RSI: {currentRSI.toFixed(1)}
              </Badge>
              <Badge variant="secondary" className={rsiColor}>
                {rsiStatus}
              </Badge>
            </div>
            <div className="flex bg-muted rounded-lg p-0.5">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-all",
                    timeframe === tf
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.75 0.15 145)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.75 0.15 145)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 250)" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }}
                dy={10}
              />
              <YAxis
                yAxisId="price"
                orientation="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }}
                tickFormatter={(value) => `$${value}`}
                domain={["dataMin - 5", "dataMax + 5"]}
              />
              <YAxis
                yAxisId="rsi"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine yAxisId="rsi" y={70} stroke="oklch(0.6 0.2 25)" strokeDasharray="5 5" strokeOpacity={0.5} />
              <ReferenceLine yAxisId="rsi" y={30} stroke="oklch(0.75 0.15 145)" strokeDasharray="5 5" strokeOpacity={0.5} />
              <Area
                yAxisId="price"
                type="monotone"
                dataKey="price"
                stroke="oklch(0.75 0.15 145)"
                strokeWidth={2}
                fill="url(#priceGradient)"
              />
              <Line
                yAxisId="rsi"
                type="monotone"
                dataKey="rsi"
                stroke="oklch(0.7 0.12 220)"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Price (Left Axis)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-chart-3" />
            <span className="text-xs text-muted-foreground">RSI (Right Axis)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-4 bg-destructive opacity-50" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)" }} />
            <span className="text-xs text-muted-foreground">Overbought (70)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-4 bg-primary opacity-50" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)" }} />
            <span className="text-xs text-muted-foreground">Oversold (30)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}