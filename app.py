# app.py
import streamlit as st
import time
from main import investor_agent, AgentState

# --- PAGE CONFIG ---
st.set_page_config(page_title="ET Market Agent", page_icon="📈", layout="wide")

st.title("🤖 Track 6: AI Investor Agent")
st.markdown("Autonomous multi-agent system for signal detection and portfolio conflict resolution.")

# --- SIDEBAR: USER SETTINGS ---
with st.sidebar:
    st.header("⚙️ User Context")
    portfolio_input = st.text_area("Your Portfolio (comma separated)", "TCS, INFY, RELIANCE, HDFCBANK")
    user_portfolio = [s.strip() for s in portfolio_input.split(",")]
    
    st.header("🧪 Test Scenarios")
    scenario_choice = st.radio(
        "Select Hackathon Scenario to run:",
        (
            "1: Bulk Deal (FMCG)", 
            "2: Conflicting Signals (IT Breakout)", 
            "3: Portfolio News (Macro)"
        )
    )
    
    # Map choice to ID
    scenario_id = int(scenario_choice[0])
    
    run_agent = st.button("🚀 Run Autonomous Pipeline", use_container_width=True, type="primary")

# --- MAIN DASHBOARD ---
if run_agent:
    # Initialize State
    initial_state = {
        "user_portfolio": user_portfolio,
        "scenario_id": scenario_id,
        "raw_data": {},
        "analyst_reasoning": "",
        "final_alert": "",
        "action_required": False
    }

    # UI Columns
    col1, col2 = st.columns([1, 1.5])

    with col1:
        st.subheader("🧠 Agent Audit Trail")
        # Visualizing the agent steps
        with st.status("Agent Pipeline Running...", expanded=True) as status:
            
            for step in investor_agent.stream(initial_state):
                if "scout" in step:
                    st.write("📡 **Scout Agent:** Ingesting market data & filings...")
                    time.sleep(1) # Artificial delay for visual effect in demo
                    st.success(f"Signal Detected: {step['scout']['raw_data']['stock']}")
                
                elif "analyst" in step:
                    st.write("⚙️ **Analyst Agent:** Running conflict resolution logic...")
                    time.sleep(1.5)
                    st.info("Cross-referencing RSI and historical success rates.")
                    
                elif "strategist" in step:
                    st.write("🎯 **Strategist Agent:** Checking portfolio materiality...")
                    time.sleep(1)
                    st.warning("Mapping impact to user holdings.")
                    
            status.update(label="Pipeline Complete", state="complete", expanded=True)

    with col2:
        st.subheader("📱 Final User Output")
        
        # Extract the final alert from the last step
        final_alert = step.get('strategist', {}).get('final_alert', "No material updates for your portfolio.")
        
        if "🚨" in final_alert:
            st.error(final_alert)
        elif "Ignored" in final_alert:
            st.code(final_alert, language="markdown")
        else:
            st.info(final_alert)
            
        # Display the "Why" (The reasoning is crucial for the "Enterprise Readiness" score)
        if step.get('analyst', {}).get('analyst_reasoning'):
            with st.expander("🔍 View AI Reasoning Logs"):
                st.write(step['analyst']['analyst_reasoning'])