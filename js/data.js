// Data management functionality for FinWise platform
document.addEventListener('DOMContentLoaded', () => {
    // Initialize data
    initData();
});

/**
 * Initialize data
 */
function initData() {
    // Initialize application data if needed
    initializeAppDataIfNeeded();
    
    // Add event listeners for message inputs
    setupMessageInputListeners();
}

/**
 * Set up message input listeners
 */
function setupMessageInputListeners() {
    // User message input setup
    const messageInput = document.getElementById('message-input');
    const sendMessageBtn = document.getElementById('send-message-btn');
    
    if (messageInput && sendMessageBtn) {
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const contactId = this.getAttribute('data-contact-id');
                if (contactId) {
                    sendMessage(contactId);
                }
            }
        });
        
        sendMessageBtn.addEventListener('click', function() {
            const contactId = messageInput.getAttribute('data-contact-id');
            if (contactId) {
                sendMessage(contactId);
            }
        });
    }
    
    // Expert message input setup
    const expertMessageInput = document.getElementById('expert-message-input');
    const expertSendMessageBtn = document.getElementById('expert-send-message-btn');
    
    if (expertMessageInput && expertSendMessageBtn) {
        expertMessageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const contactId = this.getAttribute('data-contact-id');
                if (contactId) {
                    sendExpertMessage(contactId);
                }
            }
        });
        
        expertSendMessageBtn.addEventListener('click', function() {
            const contactId = expertMessageInput.getAttribute('data-contact-id');
            if (contactId) {
                sendExpertMessage(contactId);
            }
        });
    }
}

/**
 * Update current user in localStorage
 * @param {Object} user - User object
 */
function updateCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

/**
 * Update user in users array
 * @param {Object} user - User object
 */
function updateUserInStorage(user) {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find user index
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex !== -1) {
        // Update user
        users[userIndex] = user;
        
        // Save users to localStorage
        localStorage.setItem('users', JSON.stringify(users));
    }
}

/**
 * Load user messages
 * @param {Object} user - User object
 */
function loadUserMessages(user) {
    const contactsContainer = document.getElementById('user-contacts');
    
    // Clear container
    contactsContainer.innerHTML = '';
    
    if (!user.messages || user.messages.length === 0) {
        // Show empty state
        contactsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-envelope"></i>
                <p>No message threads yet. Schedule a meeting with an expert to start a conversation.</p>
            </div>
        `;
        return;
    }
    
    // Group messages by contact
    const messagesByContact = {};
    
    user.messages.forEach(message => {
        const contactId = message.senderId === user.id ? message.recipientId : message.senderId;
        
        if (!messagesByContact[contactId]) {
            messagesByContact[contactId] = [];
        }
        
        messagesByContact[contactId].push(message);
    });
    
    // Sort contacts by latest message
    const sortedContacts = Object.keys(messagesByContact).sort((a, b) => {
        const aLatest = messagesByContact[a].reduce((latest, msg) => {
            return new Date(msg.timestamp) > new Date(latest.timestamp) ? msg : latest;
        });
        
        const bLatest = messagesByContact[b].reduce((latest, msg) => {
            return new Date(msg.timestamp) > new Date(latest.timestamp) ? msg : latest;
        });
        
        return new Date(bLatest.timestamp) - new Date(aLatest.timestamp);
    });
    
    // Create contact items
    sortedContacts.forEach(contactId => {
        const contact = getContactInfo(contactId);
        const messages = messagesByContact[contactId];
        const latestMessage = messages.reduce((latest, msg) => {
            return new Date(msg.timestamp) > new Date(latest.timestamp) ? msg : latest;
        });
        
        const contactItem = document.createElement('div');
        contactItem.className = 'contact-item';
        contactItem.setAttribute('data-id', contactId);
        contactItem.innerHTML = `
            <div class="contact-info">
                <div class="contact-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div>
                    <div class="contact-name">${contact.name}</div>
                    <div class="contact-preview">${latestMessage.content.substring(0, 40)}${latestMessage.content.length > 40 ? '...' : ''}</div>
                </div>
            </div>
        `;
        
        contactsContainer.appendChild(contactItem);
    });
    
    // Set up contact click
    contactsContainer.querySelectorAll('.contact-item').forEach(item => {
        item.addEventListener('click', function() {
            const contactId = this.getAttribute('data-id');
            openChat(contactId);
        });
    });
}

/**
 * Load expert messages
 * @param {Object} expert - Expert object
 */
function loadExpertMessages(expert) {
    const contactsContainer = document.getElementById('expert-contacts');
    
    // Clear container
    contactsContainer.innerHTML = '';
    
    if (!expert.messages || expert.messages.length === 0) {
        // Show empty state
        contactsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-envelope"></i>
                <p>No message threads yet.</p>
            </div>
        `;
        return;
    }
    
    // Group messages by contact
    const messagesByContact = {};
    
    expert.messages.forEach(message => {
        const contactId = message.senderId === expert.id ? message.recipientId : message.senderId;
        
        if (!messagesByContact[contactId]) {
            messagesByContact[contactId] = [];
        }
        
        messagesByContact[contactId].push(message);
    });
    
    // Sort contacts by latest message
    const sortedContacts = Object.keys(messagesByContact).sort((a, b) => {
        const aLatest = messagesByContact[a].reduce((latest, msg) => {
            return new Date(msg.timestamp) > new Date(latest.timestamp) ? msg : latest;
        });
        
        const bLatest = messagesByContact[b].reduce((latest, msg) => {
            return new Date(msg.timestamp) > new Date(latest.timestamp) ? msg : latest;
        });
        
        return new Date(bLatest.timestamp) - new Date(aLatest.timestamp);
    });
    
    // Create contact items
    sortedContacts.forEach(contactId => {
        const contact = getContactInfo(contactId);
        const messages = messagesByContact[contactId];
        const latestMessage = messages.reduce((latest, msg) => {
            return new Date(msg.timestamp) > new Date(latest.timestamp) ? msg : latest;
        });
        
        const contactItem = document.createElement('div');
        contactItem.className = 'contact-item';
        contactItem.setAttribute('data-id', contactId);
        contactItem.innerHTML = `
            <div class="contact-info">
                <div class="contact-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div>
                    <div class="contact-name">${contact.name}</div>
                    <div class="contact-preview">${latestMessage.content.substring(0, 40)}${latestMessage.content.length > 40 ? '...' : ''}</div>
                </div>
            </div>
        `;
        
        contactsContainer.appendChild(contactItem);
    });
    
    // Set up contact click
    contactsContainer.querySelectorAll('.contact-item').forEach(item => {
        item.addEventListener('click', function() {
            const contactId = this.getAttribute('data-id');
            openExpertChat(contactId);
        });
    });
}

/**
 * Get contact info
 * @param {string} contactId - Contact ID
 * @returns {Object} - Contact info (name, type)
 */
function getContactInfo(contactId) {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find user
    const user = users.find(u => u.id === contactId);
    
    if (user) {
        return {
            name: user.fullname,
            type: user.type
        };
    }
    
    return {
        name: 'Unknown Contact',
        type: 'unknown'
    };
}

/**
 * Open chat with contact
 * @param {string} contactId - Contact ID
 */
function openChat(contactId) {
    // Get current user
    const currentUser = getCurrentUser();
    
    // Get contact info
    const contact = getContactInfo(contactId);
    
    // Get messages between current user and contact
    const messages = currentUser.messages ? currentUser.messages.filter(msg => 
        (msg.senderId === currentUser.id && msg.recipientId === contactId) ||
        (msg.senderId === contactId && msg.recipientId === currentUser.id)
    ) : [];
    
    // Sort messages by timestamp
    messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Update UI
    document.getElementById('message-header').innerHTML = `
        <div class="message-contact-info">
            <div class="contact-avatar">
                <i class="fas fa-user-circle"></i>
            </div>
            <div>
                <h4>${contact.name}</h4>
                <p>${contact.type === 'expert' ? 'Financial Expert' : 'User'}</p>
            </div>
        </div>
    `;
    
    const messagesBody = document.getElementById('messages-body');
    messagesBody.innerHTML = '';
    
    if (messages.length === 0) {
        messagesBody.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <p>No messages yet. Start the conversation!</p>
            </div>
        `;
    } else {
        messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${message.senderId === currentUser.id ? 'user' : 'bot'}-message`;
            
            const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            messageElement.innerHTML = `
                <div class="message-content">
                    <p>${message.content}</p>
                    <div class="message-time">${time}</div>
                </div>
            `;
            
            messagesBody.appendChild(messageElement);
        });
        
        // Scroll to the bottom of the messages
        setTimeout(() => {
            messagesBody.scrollTop = messagesBody.scrollHeight;
        }, 50);
    }
    
    // Enable input
    document.getElementById('message-input').disabled = false;
    document.getElementById('send-message-btn').disabled = false;
    
    // Set active contact
    document.querySelectorAll('#user-contacts .contact-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`#user-contacts .contact-item[data-id="${contactId}"]`)?.classList.add('active');
    
    // Store active contact ID
    document.getElementById('message-input').setAttribute('data-contact-id', contactId);
    
    // Set up send button
    document.getElementById('send-message-btn').onclick = function() {
        sendMessage(contactId);
    };
    
    // Set up input enter key
    document.getElementById('message-input').onkeypress = function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage(contactId);
        }
    };
    
    // Scroll to bottom
    messagesBody.scrollTop = messagesBody.scrollHeight;
    
    // Mark messages from this contact as read
    markMessagesAsRead(contactId, currentUser.id);
}

/**
 * Open expert chat with contact
 * @param {string} contactId - Contact ID
 */
function openExpertChat(contactId) {
    // Get current user
    const currentUser = getCurrentUser();
    
    // Get contact info
    const contact = getContactInfo(contactId);
    
    // Get messages between current user and contact
    const messages = currentUser.messages ? currentUser.messages.filter(msg => 
        (msg.senderId === currentUser.id && msg.recipientId === contactId) ||
        (msg.senderId === contactId && msg.recipientId === currentUser.id)
    ) : [];
    
    // Sort messages by timestamp
    messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Update UI
    document.getElementById('expert-message-header').innerHTML = `
        <div class="message-contact-info">
            <div class="contact-avatar">
                <i class="fas fa-user-circle"></i>
            </div>
            <div>
                <h4>${contact.name}</h4>
                <p>${contact.type === 'expert' ? 'Financial Expert' : 'User'}</p>
            </div>
        </div>
    `;
    
    const messagesBody = document.getElementById('expert-messages-body');
    messagesBody.innerHTML = '';
    
    if (messages.length === 0) {
        messagesBody.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <p>No messages yet. Start the conversation!</p>
            </div>
        `;
    } else {
        messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${message.senderId === currentUser.id ? 'user' : 'bot'}-message`;
            
            const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            messageElement.innerHTML = `
                <div class="message-content">
                    <p>${message.content}</p>
                    <div class="message-time">${time}</div>
                </div>
            `;
            
            messagesBody.appendChild(messageElement);
        });
        
        // Scroll to the bottom of the messages
        setTimeout(() => {
            messagesBody.scrollTop = messagesBody.scrollHeight;
        }, 50);
    }
    
    // Enable input
    document.getElementById('expert-message-input').disabled = false;
    document.getElementById('expert-send-message-btn').disabled = false;
    
    // Set active contact
    document.querySelectorAll('#expert-contacts .contact-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`#expert-contacts .contact-item[data-id="${contactId}"]`)?.classList.add('active');
    
    // Store active contact ID
    document.getElementById('expert-message-input').setAttribute('data-contact-id', contactId);
    
    // Set up send button
    document.getElementById('expert-send-message-btn').onclick = function() {
        sendExpertMessage(contactId);
    };
    
    // Set up input enter key
    document.getElementById('expert-message-input').onkeypress = function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendExpertMessage(contactId);
        }
    };
    
    // Scroll to bottom
    messagesBody.scrollTop = messagesBody.scrollHeight;
}

/**
 * Send message to contact
 * @param {string} contactId - Contact ID
 */
function sendMessage(contactId) {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Get current user
    const currentUser = getCurrentUser();
    
    // Create message object
    const messageObj = {
        id: generateId(),
        senderId: currentUser.id,
        senderName: currentUser.fullname,
        recipientId: contactId,
        content: message,
        timestamp: new Date().toISOString()
    };
    
    // Add message to current user
    if (!currentUser.messages) {
        currentUser.messages = [];
    }
    
    currentUser.messages.push(messageObj);
    
    // Update current user in localStorage
    updateCurrentUser(currentUser);
    updateUserInStorage(currentUser);
    
    // Add message to recipient
    addMessageToRecipient(messageObj);
    
    // Clear input
    messageInput.value = '';
    
    // Update chat
    openChat(contactId);
}

/**
 * Send expert message to contact
 * @param {string} contactId - Contact ID
 */
function sendExpertMessage(contactId) {
    const messageInput = document.getElementById('expert-message-input');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Get current user
    const currentUser = getCurrentUser();
    
    // Create message object
    const messageObj = {
        id: generateId(),
        senderId: currentUser.id,
        senderName: currentUser.fullname,
        recipientId: contactId,
        content: message,
        timestamp: new Date().toISOString()
    };
    
    // Add message to current user
    if (!currentUser.messages) {
        currentUser.messages = [];
    }
    
    currentUser.messages.push(messageObj);
    
    // Update current user in localStorage
    updateCurrentUser(currentUser);
    updateUserInStorage(currentUser);
    
    // Add message to recipient
    addMessageToRecipient(messageObj);
    
    // Clear input
    messageInput.value = '';
    
    // Update chat
    openExpertChat(contactId);
}

/**
 * Mark messages as read
 * @param {string} senderId - Sender ID
 * @param {string} recipientId - Recipient ID
 */
function markMessagesAsRead(senderId, recipientId) {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find recipient
    const recipientIndex = users.findIndex(user => user.id === recipientId);
    
    if (recipientIndex === -1) {
        console.error('Recipient not found');
        return;
    }
    
    // Update messages as read
    if (users[recipientIndex].messages) {
        users[recipientIndex].messages = users[recipientIndex].messages.map(msg => {
            if (msg.senderId === senderId && msg.recipientId === recipientId) {
                return { ...msg, read: true };
            }
            return msg;
        });
        
        // Save users to localStorage
        localStorage.setItem('users', JSON.stringify(users));
        
        // Update current user if it's the recipient
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === recipientId) {
            currentUser.messages = users[recipientIndex].messages;
            updateCurrentUser(currentUser);
        }
    }
}

/**
 * Add message to recipient
 * @param {Object} message - Message object
 */
function addMessageToRecipient(message) {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find recipient
    const recipientIndex = users.findIndex(user => user.id === message.recipientId);
    
    if (recipientIndex === -1) {
        console.error('Recipient not found');
        return;
    }
    
    // Add message to recipient
    if (!users[recipientIndex].messages) {
        users[recipientIndex].messages = [];
    }
    
    users[recipientIndex].messages.push(message);
    
    // Save users to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // If the recipient has an open chat with the sender, update it
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === message.recipientId) {
        // Check if the chat with the sender is open
        const activeSenderContact = document.querySelector(`#user-contacts .contact-item.active[data-id="${message.senderId}"]`);
        if (activeSenderContact) {
            // Reload the chat to show the new message
            openChat(message.senderId);
        }
        
        // For expert UI
        const activeExpertSenderContact = document.querySelector(`#expert-contacts .contact-item.active[data-id="${message.senderId}"]`);
        if (activeExpertSenderContact) {
            // Reload the chat to show the new message
            openExpertChat(message.senderId);
        }
    }
}
