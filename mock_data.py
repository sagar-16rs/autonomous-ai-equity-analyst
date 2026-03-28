# mock_data.py

def get_market_scenario(scenario_id: int):
    """Simulates raw market data ingestion based on the Hackathon Scenario Pack"""
    
    if scenario_id == 1:
        return {
            "stock": "DABUR", # Mid-cap FMCG
            "event_type": "Filing",
            "headline": "Promoter offloads 4.2% stake via bulk deal",
            "details": "Discount of 6% to CMP. Debt-to-equity ratio remains low at 0.1. No pledged shares.",
            "technicals": {"RSI": 45, "trend": "neutral"}
        }
    
    elif scenario_id == 2:
        return {
            "stock": "INFY", # Large-cap IT
            "event_type": "Technical",
            "headline": "52-week high breakout",
            "details": "Volume is 3x average. FII shareholding dropped by 1.2% in last quarter.",
            "technicals": {"RSI": 78, "trend": "bullish_breakout"}
        }
        
    elif scenario_id == 3:
        return {
            "stock": "HDFCBANK",
            "event_type": "Macro News",
            "headline": "RBI cuts repo rate by 25 bps; New banking regulations announced",
            "details": "Rate cut is positive for banks. Regulatory change increases compliance cost.",
            "technicals": {"RSI": 60, "trend": "bullish"}
        }
    return {}