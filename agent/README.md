# MonIA - AI Agent with Web Interface

MonIA is an AI-powered assistant built with Gemini 2.5 Flash that provides a web-based chat interface for customer service and general assistance.

## Features

- 🤖 **AI-Powered Assistant** - Uses Google Gemini 2.5 Flash model
- 💬 **Web Chat Interface** - Beautiful, responsive chat UI
- 🔧 **Function Tools** - Built-in order status tracking
- 🚀 **FastAPI Backend** - RESTful API for agent interactions
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🔄 **Real-time Streaming** - Async message processing

## Project Structure

```
agent/
├── requirements.txt          # Python dependencies
├── .env.example             # Environment variables template
├── agent_service.py         # Core agent logic with Gemini integration
├── main.py                  # FastAPI server
├── README.md               # This file
└── web-interface/
    ├── index.html          # Chat interface HTML
    ├── styles.css          # Interface styling
    └── script.js           # Chat logic and API communication
```

## Setup Instructions

### Backend Setup

1. **Install Python Dependencies**
   ```bash
   cd agent
   pip install -r requirements.txt
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your Gemini API key
   ```

   Get your API key from: https://ai.google.dev/

3. **Run the Backend Server**
   ```bash
   python main.py
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Open the Web Interface**
   
   Open `agent/web-interface/index.html` in your browser, or serve it with a local server:
   ```bash
   # Using Python
   cd web-interface
   python -m http.server 3000
   
   # Then open http://localhost:3000 in your browser
   ```

2. **Configure API URL** (if needed)
   
   Edit `script.js` and update the `API_URL` variable if your backend is running on a different address.

## API Endpoints

### Health Check
```bash
GET /health
```
Returns server health status.

### Chat
```bash
POST /chat
Content-Type: application/json

{
  "message": "What's the status of order 100?"
}

Response:
{
  "response": "Order 100 has been delivered.",
  "status": "success"
}
```

### Agent Info
```bash
GET /info
```
Returns agent information and capabilities.

## Usage Examples

### Try These Commands

- "What's the status of order 100?"
- "Check order 200"
- "Tell me about order 301"
- "Hello, who are you?"
- "Can you help me track my package?"

## Built-in Tools

### get_order_status(order_id: int)
Returns the status of an order.

**Example:** `get_order_status(100)` → "Delivered"

**Available Orders:**
- 100, 101: Delivered
- 200, 201: In Transit
- 300, 301: Processing
- Others: Order not found

## Configuration

Edit `agent_service.py` to:
- Change the system prompt
- Add new tools/functions
- Modify agent behavior
- Change the model

## Troubleshooting

### "Connection refused" error
- Make sure the backend is running: `python main.py`
- Check that port 8000 is not in use
- Verify the API_URL in `script.js`

### API Key errors
- Verify your Gemini API key is correct in `.env`
- Ensure you have API access enabled in Google AI Studio

### CORS errors
- The backend has CORS enabled for all origins
- If needed, modify CORS settings in `main.py`

## Development

### Adding New Tools

Edit `agent_service.py`:

```python
@function_tool
def my_new_tool(param: str) -> str:
    """
    Tool description.
    """
    return "result"

# Add to agent tools list
agent = Agent(
    ...
    tools=[get_order_status, my_new_tool],
    ...
)
```

### Customizing the Chat Interface

Edit `web-interface/styles.css` to change colors and layout.
Edit `web-interface/script.js` to modify chat behavior.

## Deployment

### Deploy Backend (Heroku example)

1. Add `Procfile`:
   ```
   web: cd agent && gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
   ```

2. Set environment variables:
   ```bash
   heroku config:set GEMINI_API_KEY=your_key
   ```

### Deploy Frontend

Host the `web-interface/` folder on any static hosting service (Vercel, Netlify, etc.)

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
