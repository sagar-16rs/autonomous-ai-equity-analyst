import os
import yfinance as yf
from typing import List, TypedDict
from dotenv import load_dotenv
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_tavily import TavilySearch
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Connect to Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# 1. Define the State (UPGRADED for Live Data)
class AgentState(TypedDict):
    ticker: str  # No more scenario_id, we accept raw tickers now!
    raw_data: dict
    analyst_reasoning: str
    final_alert: str
    action_required: bool

# 2. Define the Nodes
def scout_node(state: AgentState):
    """AGENT 1: Gathers LIVE market data and news"""
    ticker = state["ticker"]
    print(f"\n[Scout Agent] Fetching live data for {ticker}...")
    
    # A. Fetch Live Math from Yahoo Finance (FIXED for both US and Indian Stocks)
    try:
        stock = yf.Ticker(ticker) # Try global first (e.g., TSLA, AAPL)
        info = stock.info
        
        # If no price is found, it might be an Indian stock requiring .NS
        if "currentPrice" not in info:
            stock = yf.Ticker(f"{ticker}.NS")
            info = stock.info
            
        current_price = info.get("currentPrice", "Data Unavailable")
        high_52 = info.get("fiftyTwoWeekHigh", "Data Unavailable")
        low_52 = info.get("fiftyTwoWeekLow", "Data Unavailable")
    except Exception as e:
        print(f" -> yfinance error: {e}")
        current_price, high_52, low_52 = "N/A", "N/A", "N/A"

    # B. Fetch Live Context from the Web
    # Note: Removed "NSE India" from the hardcoded prompt so it works for US stocks too
    search = TavilySearch(max_results=3)
    search_results = search.invoke(f"{ticker} stock latest financial news today")
    
    data = {
        "stock": ticker,
        "current_price": current_price,
        "52_week_high": high_52,
        "52_week_low": low_52,
        "web_context": search_results
    }
    print(f" -> Scout retrieved live price: {current_price}")
    return {"raw_data": data}

def analyst_node(state: AgentState):
    """AGENT 2: Real reasoning using Google Gemini 2.5 Flash"""
    print("[Analyst Agent] Gemini is analyzing live market conditions...")
    data = state["raw_data"]
    
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0, google_api_key=os.getenv("GEMINI_API_KEY"))
    
    system_prompt = """You are an elite quantitative equity analyst for the Indian Stock Market (NSE/BSE). 
    Analyze the live market data and latest news provided. 
    
    CRITICAL INSTRUCTIONS:
    1. Cross-reference price action against recent filings, management commentary, or bulk deals mentioned in the news. You MUST cite your sources if discussing filings.
    2. If you detect conflicting signals (e.g., a technical breakout but high RSI / FII selling), you MUST surface these conflicts clearly.
    3. Provide a balanced, data-backed recommendation. DO NOT provide binary, one-sided 'BUY' or 'SELL' calls. 
    4. Estimate potential P&L impact based on the severity of the news (e.g., Macro RBI changes vs. Micro sector regulations).
    5. Output concise, bulleted reasoning evaluating the stock's current reality.
    6. End your response with exactly 'ACTION_REQUIRED: True' (if highly volatile, distress selling, or major breakout) or 'ACTION_REQUIRED: False' (if routine).
    """
    
    user_prompt = f"""
    Stock: {data['stock']}
    Live Price: {data['current_price']}
    52-Week High: {data['52_week_high']}
    52-Week Low: {data['52_week_low']}
    Latest Web Context: {data['web_context']}
    """
    
    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt)
    ])
    
    ai_output = response.content
    print(" -> Gemini finished analysis.")
    action = "ACTION_REQUIRED: True" in ai_output
    
    return {"analyst_reasoning": ai_output, "action_required": action}

def strategist_node(state: AgentState):
    """AGENT 3: Queries Supabase to check the user's portfolio"""
    print("[Strategist Agent] Checking Supabase Database...")
    stock = state["raw_data"]["stock"]
    
    try:
        response = supabase.table("user_portfolio").select("holdings").eq("user_name", "Demo Investor").execute()
        user_portfolio = response.data[0]['holdings']
        print(f" -> Found user holdings in DB: {user_portfolio}")
    except Exception as e:
        print(f"DB Error: {e}")
        user_portfolio = []

    # Check if the ticker is in the portfolio (or let it pass for demonstration)
    if stock not in user_portfolio:
        alert = f"⚠️ MARKET SCAN for {stock}:\n\n(Note: {stock} is not in your DB portfolio, but here is the live analysis)\n\n{state['analyst_reasoning']}"
    else:
        alert = f"🚨 PORTFOLIO ALERT for {stock}!\n\nAI Analysis based on Live Market Data:\n{state['analyst_reasoning']}"
        
    return {"final_alert": alert}

# 3. Build the Graph
builder = StateGraph(AgentState)
builder.add_node("scout", scout_node)
builder.add_node("analyst", analyst_node)
builder.add_node("strategist", strategist_node)

builder.set_entry_point("scout")
builder.add_edge("scout", "analyst")

# FIXED: Removed the conditional logic. Now it always goes to the Strategist 
# so your frontend API always gets the 'final_alert' it expects!
builder.add_edge("analyst", "strategist")
builder.add_edge("strategist", END)

investor_agent = builder.compile()

if __name__ == "__main__":
    print("=========================================")
    print("STARTING LIVE AUTONOMOUS AGENT")
    print("=========================================")
    
    # We now pass a TICKER instead of a Scenario ID
    initial_state = {"ticker": "RELIANCE", "raw_data": {}, "analyst_reasoning": "", "final_alert": "", "action_required": False}

    for step in investor_agent.stream(initial_state):
        pass 

    print("\n✅ FINAL OUTPUT:")
    print(step['strategist']['final_alert'])