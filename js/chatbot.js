// Chatbot functionality for FinWise platform
document.addEventListener('DOMContentLoaded', () => {
    // Initialize chatbot
    initChatbot();
});

/**
 * Initialize chatbot functionality
 */
function initChatbot() {
    // Set up chatbot toggle
    setupChatbot();
}

/**
 * Set up chatbot
 */
function setupChatbot() {
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    const chatbotContainer = document.querySelector('.chatbot-container');
    const minimizeButton = document.querySelector('.minimize-chat');
    const closeButton = document.querySelector('.close-chat');
    const sendButton = document.getElementById('send-chatbot-msg');
    const chatInput = document.getElementById('chatbot-input');
    
    // Toggle chatbot visibility
    chatbotToggle.addEventListener('click', () => {
        const isHidden = chatbotContainer.style.display === 'none';
        chatbotContainer.style.display = isHidden ? 'flex' : 'none';
        
        // If opening, focus on input
        if (isHidden) {
            chatInput.focus();
        }
    });
    
    // Minimize chatbot
    minimizeButton.addEventListener('click', () => {
        chatbotContainer.style.display = 'none';
    });
    
    // Close chatbot
    closeButton.addEventListener('click', () => {
        chatbotContainer.style.display = 'none';
    });
    
    // Send message on button click
    sendButton.addEventListener('click', () => {
        sendChatbotMessage();
    });
    
    // Send message on Enter key
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendChatbotMessage();
        }
    });
}

/**
 * Send message to chatbot
 */
function sendChatbotMessage() {
    const chatInput = document.getElementById('chatbot-input');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    
    // Clear input
    chatInput.value = '';
    
    // Process message and get response
    processChatbotMessage(message);
}

/**
 * Add message to chat
 * @param {string} message - Message text
 * @param {string} sender - Message sender (user/bot)
 */
function addMessageToChat(message, sender) {
    const chatMessages = document.getElementById('chatbot-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}-message`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageElement.innerHTML = `
        <div class="message-content">
            <p>${message}</p>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Process chatbot message and generate response
 * @param {string} message - User message
 */
function processChatbotMessage(message) {
    // Simple keyword-based response system
    const lowerMessage = message.toLowerCase();
    let response = '';
    
    // Simulate typing delay
    setTimeout(() => {
        if (
            lowerMessage.includes('hello') || 
            lowerMessage.includes('hi') || 
            lowerMessage.includes('hey')
        ) {
            response = "Hello! How can I help you with your financial questions today?";
        } 
        else if (
            lowerMessage.includes('budget') || 
            lowerMessage.includes('budgeting') || 
            lowerMessage.includes('save money')
        ) {
            response = "Budgeting is a great way to take control of your finances. I recommend starting with the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment. Would you like more specific budgeting tips?";
        }
        else if (
            lowerMessage.includes('invest') || 
            lowerMessage.includes('investing') || 
            lowerMessage.includes('investment')
        ) {
            response = "Investing is a powerful way to grow your wealth over time. As a beginner, consider starting with a diversified portfolio using low-cost index funds. Remember that investing involves risk, and it's important to research and understand your investments. Would you like to learn more about specific investment types?";
        }
        else if (
            lowerMessage.includes('retirement') || 
            lowerMessage.includes('retire')
        ) {
            response = "Retirement planning is essential for financial security. Start by determining your retirement goals and timeline. Take advantage of employer-sponsored plans like 401(k)s, especially if they offer matching contributions. Consider opening an IRA for additional tax advantages. Would you like more specific retirement planning advice?";
        }
        else if (
            lowerMessage.includes('debt') || 
            lowerMessage.includes('loan') ||
            lowerMessage.includes('credit card')
        ) {
            response = "Managing debt effectively is crucial for financial health. Consider using either the snowball method (paying smallest debts first) or the avalanche method (focusing on highest interest debts first). Always make at least minimum payments on all debts, and consider debt consolidation if you have multiple high-interest debts. Would you like more information on debt management strategies?";
        }
        else if (
            lowerMessage.includes('expert') || 
            lowerMessage.includes('advisor') ||
            lowerMessage.includes('consultation')
        ) {
            response = "Our platform connects you with verified financial experts for personalized guidance. You can browse expert profiles, schedule consultations, and message them directly through your dashboard. Would you like me to help you find an expert for a specific financial topic?";
        }
        else if (
            lowerMessage.includes('credit score') || 
            lowerMessage.includes('credit report')
        ) {
            response = "Your credit score is an important financial metric. To improve it, focus on paying bills on time, reducing debt, keeping credit card balances low, and monitoring your credit report regularly for errors. You're entitled to a free credit report from each major bureau annually through AnnualCreditReport.com. Would you like more tips on improving your credit score?";
        }
        else if (
            lowerMessage.includes('tax') || 
            lowerMessage.includes('taxes')
        ) {
            response = "Tax planning can help maximize your savings. Consider strategies like maximizing retirement contributions, harvesting tax losses, utilizing tax-advantaged accounts, and keeping detailed records of deductible expenses. For personalized tax advice, I recommend consulting with a tax professional. Would you like to learn about specific tax planning strategies?";
        }
        else if (
            lowerMessage.includes('emergency fund') || 
            lowerMessage.includes('savings')
        ) {
            response = "An emergency fund is critical financial protection. Aim to save 3-6 months of living expenses in a readily accessible account. Start small if needed - even $1,000 can provide a helpful buffer against unexpected expenses. Consider a high-yield savings account to earn interest while maintaining liquidity. Would you like tips on building your emergency fund faster?";
        }
        else if (
            lowerMessage.includes('thank') || 
            lowerMessage.includes('thanks')
        ) {
            response = "You're welcome! If you have any other financial questions, feel free to ask. I'm here to help!";
        }
        else {
            response = "I'm not sure I understand your question. Could you please rephrase it? I can help with topics like budgeting, investing, retirement planning, debt management, and more.";
        }
        
        // Add bot response to chat
        addMessageToChat(response, 'bot');
    }, 1000);
}
