# Autonomous AI Equity Analyst
**ET Gen AI Hackathon Submission**

Retail investors and portfolio managers are overwhelmed by the sheer volume of real-time market data and breaking news. Traditional stock screeners provide raw data but lack reasoning, while generic LLMs hallucinate financial math and lack access to live market conditions.

We built an **Autonomous AI Equity Analyst**—a real-time, multi-agent pipeline that ingests live market data, applies quantitative reasoning, and delivers personalized portfolio alerts.

## System Architecture

Instead of relying on a single prompt, our backend utilizes **LangGraph** to orchestrate specialized AI agents that execute a deterministic workflow. This ensures accuracy, reduces hallucinations, and grounds the AI's analysis in verifiable, real-world data.

<img width="1749" height="561" alt="Screenshot 2026-03-29 001912" src="https://github.com/user-attachments/assets/8fcb436f-4de2-4921-96bc-e44ea613d7c1" />

## Tech Stack
```
Frontend: Next.js (React), Tailwind CSS, shadcn/ui

Backend: FastAPI (Python), LangGraph, LangChain 

AI Models: Google Gemini 2.5 Flash 

Data Tools: Yahoo Finance API (yfinance), Tavily Search API

Database: Supabase (PostgreSQL)
```

## Local Setup Instructions

1. Clone the repository
```
git clone [https://github.com/sagar-16rs/autonomous-ai-equity-analyst.git]
cd autonomous-ai-equity-analyst
```

2. Backend Setup (FastAPI & LangGraph)
Open a terminal and navigate to the backend directory:
```
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
```

Create a .env file in the /backend directory and add your API keys:

Code snippet
```
GEMINI_API_KEY=your_gemini_key_here
TAVILY_API_KEY=your_tavily_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_key_here
```

Start the application server:

```
uvicorn api:app --reload --port 8000
```

3. Frontend Setup (Next.js)
Open a new terminal window and navigate to the frontend directory:

```
cd frontend
npm install
npm run dev
```
Navigate to http://localhost:3000 in your browser to interact with the dashboard.


## Future Roadmap
```
> Automated Trading Triggers: Connect the Strategist node to a paper-trading API (like Alpaca) to execute trades based on generated alerts.

> Sector-Wide Analysis: Upgrade the state graph to accept arrays of tickers to analyze entire market sectors simultaneously.

> Technical Chart Vision: Integrate Gemini's multimodal capabilities to analyze uploaded candlestick charts alongside the text data.
```

---

### Other Required Files
To ensure your repository is fully functional for anyone who clones it, you must have these two files in your project.

** 1
`backend/requirements.txt`** (Tells the system what Python packages to install):
```text
fastapi==0.109.2
uvicorn==0.27.1
yfinance==0.2.36
langgraph==0.0.26
langchain-google-genai==0.0.9
langchain-tavily==0.0.1
supabase==2.3.4
python-dotenv==1.0.1
pydantic==2.6.1
```
** 2
* gitignore (Place this in the root folder to prevent uploading your private API keys and massive node modules):

```Plaintext
# Node/Next.js
node_modules/
.next/
out/
build/

# Python
__pycache__/
venv/
env/
*.pyc

# Environment Variables (NEVER UPLOAD THESE)
.env
.env.local
```


