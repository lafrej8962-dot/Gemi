import os
import asyncio
from dotenv import load_dotenv
from agents import Agent, Runner, OpenAIChatCompletionsModel, AsyncOpenAI, set_tracing_disabled, function_tool, ModelSettings, StopAtTools

load_dotenv()
set_tracing_disabled(disabled=True)

# Create client for Gemini
client = AsyncOpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)

# Select model
model = OpenAIChatCompletionsModel(
    model="gemini-2.5-flash",
    openai_client=client
)

@function_tool
def get_order_status(order_id: int) -> str:
    """
    Returns the order status given an order ID.
    Args: order_id (int) - Order ID of the customer's order
    Returns: string - Status message
    """
    if order_id in (100, 101):
        return "Delivered"
    elif order_id in (200, 201):
        return "In Transit"
    elif order_id in (300, 301):
        return "Processing"
    else:
        return "Order not found"

agent = Agent(
    name="MonIA",
    instructions="You are a helpful assistant named MonIA. You help customers with their orders and questions. Use the get_order_status tool when asked about orders. Be friendly and professional.",
    model=model,
    tools=[get_order_status], 
    tool_use_behavior=StopAtTools(stop_at_tool_names=["get_order_status"]),
)

async def run_agent(user_message: str) -> str:
    """
    Run the agent with a user message and return the response.
    """
    try:
        result = await Runner.run_async(agent, user_message)
        return result.final_output
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    # Test the agent locally
    user_message = input("Enter your message: ")
    result = asyncio.run(run_agent(user_message))
    print("Agent Output:", result)
