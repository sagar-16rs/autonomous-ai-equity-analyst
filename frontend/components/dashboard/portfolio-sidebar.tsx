"use client"

import { TrendingUp, TrendingDown, Briefcase, ChartLine, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

const portfolioData = [
  { symbol: "AAPL", name: "Apple Inc.", shares: 50, price: 178.72, change: 2.34, changePercent: 1.32 },
  { symbol: "MSFT", name: "Microsoft Corp.", shares: 30, price: 378.91, change: -1.45, changePercent: -0.38 },
  { symbol: "GOOGL", name: "Alphabet Inc.", shares: 15, price: 141.80, change: 3.21, changePercent: 2.32 },
  { symbol: "TSLA", name: "Tesla Inc.", shares: 25, price: 248.50, change: -5.67, changePercent: -2.23 },
  { symbol: "NVDA", name: "NVIDIA Corp.", shares: 20, price: 875.28, change: 12.45, changePercent: 1.44 },
  { symbol: "AMZN", name: "Amazon.com Inc.", shares: 40, price: 178.25, change: 0.89, changePercent: 0.50 },
]

const totalValue = portfolioData.reduce((acc, stock) => acc + stock.shares * stock.price, 0)
const totalChange = portfolioData.reduce((acc, stock) => acc + stock.shares * stock.change, 0)
const totalChangePercent = (totalChange / (totalValue - totalChange)) * 100

export function PortfolioSidebar() {
  return (
    <aside className="w-80 border-r border-border bg-sidebar flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ChartLine className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-lg text-sidebar-foreground">InvestIQ</h1>
            <p className="text-xs text-muted-foreground">Smart Trading</p>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="bg-sidebar-accent/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Portfolio Value</span>
          </div>
          <div className="text-2xl font-bold text-sidebar-foreground">
            ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={cn(
            "flex items-center gap-1 text-sm mt-1",
            totalChange >= 0 ? "text-primary" : "text-destructive"
          )}>
            {totalChange >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>
              {totalChange >= 0 ? "+" : ""}${totalChange.toFixed(2)} ({totalChangePercent >= 0 ? "+" : ""}{totalChangePercent.toFixed(2)}%)
            </span>
            <span className="text-muted-foreground text-xs ml-1">today</span>
          </div>
        </div>
      </div>

      {/* Holdings */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Holdings</h2>
          </div>
          <div className="space-y-1">
            {portfolioData.map((stock) => (
              <div
                key={stock.symbol}
                className="group p-3 rounded-lg hover:bg-sidebar-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-sidebar-foreground">{stock.symbol}</span>
                    <span className="text-xs text-muted-foreground">{stock.shares} shares</span>
                  </div>
                  <span className="font-medium text-sm text-sidebar-foreground">
                    ${(stock.shares * stock.price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground truncate max-w-[140px]">{stock.name}</span>
                  <span className={cn(
                    "text-xs font-medium",
                    stock.change >= 0 ? "text-primary" : "text-destructive"
                  )}>
                    {stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">John Doe</p>
            <p className="text-xs text-muted-foreground">Premium Account</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
