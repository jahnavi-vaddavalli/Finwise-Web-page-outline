// Experts functionality for FinWise platform
document.addEventListener('DOMContentLoaded', () => {
    // Initialize experts
    initExperts();
});

/**
 * Initialize experts functionality
 */
function initExperts() {
    // Set up expert search and filtering
    setupExpertSearch();
    
    // Set up expert profile viewing
    setupExpertProfileViewing();
}

/**
 * Set up expert search and filtering
 */
function setupExpertSearch() {
    const searchInput = document.getElementById('expert-search');
    const filterSelect = document.getElementById('expert-filter');
    
    // Set up search input
    searchInput.addEventListener('input', () => {
        filterExperts(searchInput.value, filterSelect.value);
    });
    
    // Set up filter select
    filterSelect.addEventListener('change', () => {
        filterExperts(searchInput.value, filterSelect.value);
    });
}

/**
 * Filter experts based on search and filter
 * @param {string} searchText - Search text
 * @param {string} filterValue - Filter value
 */
function filterExperts(searchText, filterValue) {
    const expertsContainer = document.getElementById('experts-container');
    const expertCards = expertsContainer.querySelectorAll('.expert-card');
    
    expertCards.forEach(card => {
        const name = card.querySelector('h4').textContent.toLowerCase();
        const title = card.querySelector('.expert-title').textContent.toLowerCase();
        const description = card.querySelector('.expert-description').textContent.toLowerCase();
        
        const matchesSearch = searchText === '' || 
            name.includes(searchText.toLowerCase()) || 
            title.includes(searchText.toLowerCase()) || 
            description.includes(searchText.toLowerCase());
        
        const matchesFilter = filterValue === 'all' || title.includes(getSpecialtyLabel(filterValue).toLowerCase());
        
        if (matchesSearch && matchesFilter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * Set up expert profile viewing
 */
function setupExpertProfileViewing() {
    // Add event listeners for view profile buttons in the dashboard
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-profile-btn')) {
            const expertId = e.target.getAttribute('data-id');
            if (expertId) {
                viewExpertProfile(expertId);
            }
        }
    });
    
    // Set up schedule and message buttons in expert profile view
    const scheduleBtn = document.getElementById('schedule-with-expert');
    if (scheduleBtn) {
        scheduleBtn.addEventListener('click', (e) => {
            const expertId = e.target.getAttribute('data-expert-id');
            if (expertId) {
                navigateTo('user-schedule-meeting');
                // Pre-select expert in dropdown
                const expertSelect = document.getElementById('expert-select');
                if (expertSelect) {
                    expertSelect.value = expertId;
                }
            }
        });
    }
    
    const messageBtn = document.getElementById('message-expert');
    if (messageBtn) {
        messageBtn.addEventListener('click', (e) => {
            const expertId = e.target.getAttribute('data-expert-id');
            if (expertId) {
                messageExpert(expertId);
            }
        });
    }
}

/**
 * Get expert by ID
 * @param {string} expertId - Expert ID
 * @returns {Object|null} - Expert object or null if not found
 */
function getExpertById(expertId) {
    // Check if expertId is a string, otherwise convert it
    const id = String(expertId);
    
    // Get users from localStorage to find experts
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Filter for experts
    const experts = users.filter(user => user.type === 'expert');
    
    // Find expert by ID
    const expert = experts.find(expert => expert.id === id);
    
    console.log("Searching for expert with ID:", id);
    console.log("Found expert:", expert);
    
    return expert || null;
}

/**
 * Load expert clients
 * @param {Object} expert - Expert object
 */
function loadExpertClients(expert) {
    const clientsContainer = document.getElementById('clients-list');
    
    // Clear container
    clientsContainer.innerHTML = '';
    
    if (!expert.clients || expert.clients.length === 0) {
        // Show empty state
        clientsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <p>You don't have any clients yet.</p>
            </div>
        `;
        return;
    }
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Filter users by client IDs
    const clients = users.filter(user => expert.clients.includes(user.id));
    
    // Create client cards
    clients.forEach(client => {
        const clientCard = document.createElement('div');
        clientCard.className = 'client-card';
        clientCard.innerHTML = `
            <div class="client-avatar">
                <i class="fas fa-user-circle fa-3x"></i>
            </div>
            <div class="client-info">
                <h4>${client.fullname}</h4>
                <p>${client.email}</p>
                <p>Client since: ${formatDate(client.joinDate)}</p>
            </div>
            <div class="client-actions">
                <button class="btn btn-small message-client" data-id="${client.id}">
                    <i class="fas fa-envelope"></i> Message
                </button>
                <button class="btn btn-small view-meetings" data-id="${client.id}">
                    <i class="fas fa-calendar"></i> Meetings
                </button>
            </div>
        `;
        
        clientsContainer.appendChild(clientCard);
    });
    
    // Set up message client buttons
    clientsContainer.querySelectorAll('.message-client').forEach(btn => {
        btn.addEventListener('click', function() {
            const clientId = this.getAttribute('data-id');
            messageClient(clientId);
        });
    });
    
    // Set up view meetings buttons
    clientsContainer.querySelectorAll('.view-meetings').forEach(btn => {
        btn.addEventListener('click', function() {
            const clientId = this.getAttribute('data-id');
            viewClientMeetings(clientId);
        });
    });
}

/**
 * Message client
 * @param {string} clientId - Client ID
 */
function messageClient(clientId) {
    // Get current user (expert)
    const expert = getCurrentUser();
    
    if (!expert || expert.type !== 'expert') {
        showNotification('Only experts can message clients', 'error');
        return;
    }
    
    // Get client information
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const client = users.find(u => u.id === clientId && u.type === 'user');
    
    if (!client) {
        showNotification('Client not found', 'error');
        return;
    }
    
    // Check if there's already a message thread with this client
    let existingThreadFound = false;
    
    if (expert.messages && expert.messages.length > 0) {
        expert.messages.forEach(message => {
            if (message.senderId === client.id || message.recipientId === client.id) {
                existingThreadFound = true;
            }
        });
    }
    
    // If no existing thread, create a welcome message
    if (!existingThreadFound) {
        // Create initial welcome message from expert
        const welcomeMessage = {
            id: generateId(),
            senderId: expert.id,
            senderName: expert.fullname,
            recipientId: client.id,
            content: `Hello ${client.fullname}, I'm ${expert.fullname}, your financial advisor. How can I assist you with your financial planning today?`,
            timestamp: new Date().toISOString()
        };
        
        // Add message to current expert
        if (!expert.messages) {
            expert.messages = [];
        }
        expert.messages.push(welcomeMessage);
        
        // Update expert in storage
        updateCurrentUser(expert);
        updateUserInStorage(expert);
        
        // Add message to client
        if (!client.messages) {
            client.messages = [];
        }
        client.messages.push(welcomeMessage);
        
        // Update client in storage
        const usersArray = JSON.parse(localStorage.getItem('users') || '[]');
        const clientIndex = usersArray.findIndex(u => u.id === client.id);
        if (clientIndex !== -1) {
            usersArray[clientIndex] = client;
            localStorage.setItem('users', JSON.stringify(usersArray));
        }
    }
    
    // Navigate to dashboard messages panel
    navigateTo('expert-dashboard');
    activateDashboardTab('expert-messages');
    
    // Refresh messages list to show the new thread
    loadExpertMessages(expert);
    
    // Open chat with client
    setTimeout(() => {
        // Find the contact item for this client and click it
        const contactItem = document.querySelector(`#expert-contacts .contact-item[data-id="${client.id}"]`);
        if (contactItem) {
            contactItem.click();
        } else {
            // Direct open if contact item not found
            openExpertChat(client.id);
        }
    }, 100);
}

/**
 * View client meetings
 * @param {string} clientId - Client ID
 */
function viewClientMeetings(clientId) {
    // Navigate to meetings panel
    activateExpertDashboardPanel('expert-meetings');
    
    // TODO: Filter meetings by client
}
