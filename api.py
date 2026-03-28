from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from main import investor_agent, AgentState  # Importing your upgraded live agent

app = FastAPI(title="ET Gen AI Hackathon API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔥 UPGRADED: We now expect a stock ticker (string) instead of a scenario number
class AgentRequest(BaseModel):
    ticker: str

@app.post("/api/run-agent")
async def run_autonomous_agent(request: AgentRequest):
    try:
        # Clean up the user input (e.g., " reliance " -> "RELIANCE")
        clean_ticker = request.ticker.upper().strip()
        print(f"Frontend requested live analysis for: {clean_ticker}")
        
        # Setup the initial state for LangGraph using the live TICKER
        initial_state = {
            "ticker": clean_ticker, 
            "raw_data": {}, 
            "analyst_reasoning": "", 
            "final_alert": "", 
            "action_required": False
        }
        
        # Run the live agent
        final_step = None
        for step in investor_agent.stream(initial_state):
            final_step = step
            
        # Extract the final alert from the Strategist node
        if final_step and 'strategist' in final_step:
            result = final_step['strategist']['final_alert']
        else:
            result = "Agent pipeline did not complete as expected."
            
        return {"status": "success", "alert": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "Live Agent Backend is Running!"}