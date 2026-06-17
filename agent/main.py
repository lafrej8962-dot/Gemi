from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import os
from agent_service import run_agent

app = FastAPI(
    title="MonIA Agent API",
    description="Web API for interacting with MonIA AI Agent",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserMessage(BaseModel):
    message: str

class AgentResponse(BaseModel):
    response: str
    status: str = "success"

@app.get("/")
async def root():
    return {"message": "Welcome to MonIA Agent API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "MonIA Agent"}

@app.post("/chat", response_model=AgentResponse)
async def chat(user_message: UserMessage):
    """
    Send a message to the agent and get a response.
    """
    if not user_message.message or len(user_message.message.strip()) == 0:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    try:
        response = await run_agent(user_message.message)
        return AgentResponse(response=response, status="success")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")

@app.get("/info")
async def agent_info():
    return {
        "name": "MonIA",
        "model": "gemini-2.5-flash",
        "description": "Helpful AI assistant for customer service",
        "capabilities": ["Order tracking", "Customer support", "General assistance"]
    }

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("SERVER_HOST", "0.0.0.0")
    port = int(os.getenv("SERVER_PORT", "8000"))
    uvicorn.run(app, host=host, port=port)
