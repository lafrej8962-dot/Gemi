// Configuration
const API_URL = 'http://localhost:8000'; // Change this to your API URL
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

// DOM Elements
const chatMessagesDiv = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const chatForm = document.getElementById('chatForm');
const sendBtn = document.querySelector('.send-btn');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

// State
let isWaitingForResponse = false;
let isConnected = false;

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    checkConnection();
    chatForm.addEventListener('submit', handleSendMessage);
});

// Check API connection
async function checkConnection() {
    try {
        const response = await fetch(`${API_URL}/health`);
        if (response.ok) {
            setConnected(true);
        } else {
            setConnected(false);
        }
    } catch (error) {
        setConnected(false);
    }
}

// Set connection status
function setConnected(connected) {
    isConnected = connected;
    statusDot.className = `status-dot ${connected ? 'connected' : 'disconnected'}`;
    statusText.textContent = connected ? 'Connected' : 'Disconnected';
    userInput.disabled = !connected;
    sendBtn.disabled = !connected || isWaitingForResponse;
}

// Handle send message
async function handleSendMessage(e) {
    e.preventDefault();

    const message = userInput.value.trim();
    if (!message) return;

    if (!isConnected) {
        showError('Not connected to the server. Please check your connection.');
        return;
    }

    // Add user message to chat
    addMessageToChat(message, 'user');
    userInput.value = '';
    userInput.focus();

    // Show typing indicator
    showTypingIndicator();
    setWaitingForResponse(true);

    try {
        const response = await sendMessageToAgent(message);
        removeTypingIndicator();
        addMessageToChat(response, 'bot');
    } catch (error) {
        removeTypingIndicator();
        showError(`Error: ${error.message}`);
    } finally {
        setWaitingForResponse(false);
    }
}

// Send message to agent with retry logic
async function sendMessageToAgent(message, retries = 0) {
    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });

        if (!response.ok) {
            if (response.status === 503 && retries < MAX_RETRIES) {
                // Retry on server unavailable
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                return sendMessageToAgent(message, retries + 1);
            }
            throw new Error(`Server error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        if (retries < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return sendMessageToAgent(message, retries + 1);
        }
        throw error;
    }
}

// Add message to chat
function addMessageToChat(message, sender) {
    const messageGroup = document.createElement('div');
    messageGroup.className = `message-group ${sender}-message`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = sender === 'user' ? '👤' : '🤖';

    const content = document.createElement('div');
    content.className = 'message-content';
    const paragraph = document.createElement('p');
    paragraph.textContent = message;
    content.appendChild(paragraph);

    messageGroup.appendChild(avatar);
    messageGroup.appendChild(content);

    chatMessagesDiv.appendChild(messageGroup);
    scrollToBottom();
}

// Show typing indicator
function showTypingIndicator() {
    const messageGroup = document.createElement('div');
    messageGroup.className = 'message-group bot-message';
    messageGroup.id = 'typingIndicator';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = '🤖';

    const content = document.createElement('div');
    content.className = 'message-content typing-indicator';

    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        content.appendChild(dot);
    }

    messageGroup.appendChild(avatar);
    messageGroup.appendChild(content);
    chatMessagesDiv.appendChild(messageGroup);
    scrollToBottom();
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Show error message
function showError(errorMessage) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = errorMessage;
    chatMessagesDiv.appendChild(errorDiv);
    scrollToBottom();
}

// Set waiting for response state
function setWaitingForResponse(waiting) {
    isWaitingForResponse = waiting;
    userInput.disabled = waiting || !isConnected;
    sendBtn.disabled = waiting || !isConnected;
}

// Scroll to bottom
function scrollToBottom() {
    setTimeout(() => {
        chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
    }, 0);
}

// Clear chat
function clearChat() {
    if (confirm('Clear all messages?')) {
        chatMessagesDiv.innerHTML = '';
        addMessageToChat('Chat cleared. How can I help you?', 'bot');
    }
}

// Check connection periodically
setInterval(checkConnection, 30000); // Every 30 seconds
