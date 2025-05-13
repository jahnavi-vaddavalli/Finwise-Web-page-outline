// Meetings functionality for FinWise platform
document.addEventListener('DOMContentLoaded', () => {
    // Initialize meetings
    initMeetings();
});

/**
 * Initialize meetings functionality
 */
function initMeetings() {
    // Set up meeting date picker min date (tomorrow)
    setupMeetingDatePicker();
    
    // Set up schedule meeting form submission
    setupScheduleMeetingForm();
}

/**
 * Set up meeting date picker
 */
function setupMeetingDatePicker() {
    const datePicker = document.getElementById('meeting-date');
    if (datePicker) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        datePicker.min = tomorrow.toISOString().split('T')[0];
    }
}

/**
 * Load user meetings
 * @param {Object} user - User object
 */
function loadUserMeetings(user) {
    const meetingsContainer = document.getElementById('user-meetings-list');
    
    // Clear container
    meetingsContainer.innerHTML = '';
    
    if (!user.meetings || user.meetings.length === 0) {
        // Show empty state
        meetingsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-alt"></i>
                <p>You don't have any scheduled meetings yet.</p>
                <button class="btn btn-small" data-target="schedule-meeting">Schedule a Meeting</button>
            </div>
        `;
        
        // Set up button click
        meetingsContainer.querySelector('button').addEventListener('click', () => {
            activateUserDashboardPanel('schedule-meeting');
        });
        
        return;
    }
    
    // Sort meetings by date (upcoming first)
    user.meetings.sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`));
    
    // Create meeting cards
    user.meetings.forEach(meeting => {
        const meetingCard = document.createElement('div');
        meetingCard.className = 'meeting-card';
        meetingCard.innerHTML = `
            <div class="meeting-header">
                <div class="meeting-title">Meeting with ${meeting.expertName}</div>
                <div class="meeting-time">${formatMeetingDateTime(meeting.date, meeting.time)}</div>
            </div>
            <div class="meeting-details">
                <p><strong>Topic:</strong> ${meeting.topic}</p>
                <p><strong>Notes:</strong> ${meeting.notes || 'No additional notes'}</p>
                <p><strong>Status:</strong> <span class="meeting-status ${meeting.status}">${capitalizeFirstLetter(meeting.status)}</span></p>
            </div>
            <div class="meeting-actions">
                <button class="btn btn-small message-expert" data-id="${meeting.expertId}">
                    <i class="fas fa-envelope"></i> Message Expert
                </button>
                <button class="btn btn-small reschedule-meeting" data-id="${meeting.id}">
                    <i class="fas fa-calendar-alt"></i> Reschedule
                </button>
                <button class="btn btn-small cancel-meeting" data-id="${meeting.id}">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        `;
        
        meetingsContainer.appendChild(meetingCard);
    });
    
    // Set up message expert buttons
    meetingsContainer.querySelectorAll('.message-expert').forEach(btn => {
        btn.addEventListener('click', function() {
            const expertId = this.getAttribute('data-id');
            messageExpert(expertId);
        });
    });
    
    // Set up reschedule meeting buttons
    meetingsContainer.querySelectorAll('.reschedule-meeting').forEach(btn => {
        btn.addEventListener('click', function() {
            const meetingId = this.getAttribute('data-id');
            rescheduleMeeting(meetingId);
        });
    });
    
    // Set up cancel meeting buttons
    meetingsContainer.querySelectorAll('.cancel-meeting').forEach(btn => {
        btn.addEventListener('click', function() {
            const meetingId = this.getAttribute('data-id');
            cancelMeeting(meetingId);
        });
    });
}

/**
 * Load expert meetings
 * @param {Object} expert - Expert object
 * @param {string} filter - Filter (upcoming/past)
 */
function loadExpertMeetings(expert, filter = 'upcoming') {
    const meetingsContainer = document.getElementById('expert-meetings-list');
    
    // Clear container
    meetingsContainer.innerHTML = '';
    
    if (!expert.meetings || expert.meetings.length === 0) {
        // Show empty state
        meetingsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-alt"></i>
                <p>You don't have any ${filter} meetings.</p>
            </div>
        `;
        return;
    }
    
    // Get current date
    const now = new Date();
    
    // Filter meetings based on filter type
    let filteredMeetings = [];
    if (filter === 'upcoming') {
        filteredMeetings = expert.meetings.filter(meeting => {
            const meetingDate = new Date(`${meeting.date} ${meeting.time}`);
            return meetingDate >= now;
        });
    } else {
        filteredMeetings = expert.meetings.filter(meeting => {
            const meetingDate = new Date(`${meeting.date} ${meeting.time}`);
            return meetingDate < now;
        });
    }
    
    // Sort meetings by date
    filteredMeetings.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return filter === 'upcoming' ? dateA - dateB : dateB - dateA;
    });
    
    if (filteredMeetings.length === 0) {
        // Show empty state
        meetingsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-alt"></i>
                <p>You don't have any ${filter} meetings.</p>
            </div>
        `;
        return;
    }
    
    // Create meeting cards
    filteredMeetings.forEach(meeting => {
        const meetingCard = document.createElement('div');
        meetingCard.className = 'meeting-card';
        meetingCard.innerHTML = `
            <div class="meeting-header">
                <div class="meeting-title">Meeting with ${meeting.userName}</div>
                <div class="meeting-time">${formatMeetingDateTime(meeting.date, meeting.time)}</div>
            </div>
            <div class="meeting-details">
                <p><strong>Topic:</strong> ${meeting.topic}</p>
                <p><strong>Notes:</strong> ${meeting.notes || 'No additional notes'}</p>
                <p><strong>Status:</strong> <span class="meeting-status ${meeting.status}">${capitalizeFirstLetter(meeting.status)}</span></p>
            </div>
            <div class="meeting-actions">
                <button class="btn btn-small message-client" data-id="${meeting.userId}">
                    <i class="fas fa-envelope"></i> Message Client
                </button>
                ${filter === 'upcoming' ? `
                <button class="btn btn-small reschedule-meeting" data-id="${meeting.id}">
                    <i class="fas fa-calendar-alt"></i> Reschedule
                </button>
                <button class="btn btn-small cancel-meeting" data-id="${meeting.id}">
                    <i class="fas fa-times"></i> Cancel
                </button>
                ` : ''}
            </div>
        `;
        
        meetingsContainer.appendChild(meetingCard);
    });
    
    // Set up message client buttons
    meetingsContainer.querySelectorAll('.message-client').forEach(btn => {
        btn.addEventListener('click', function() {
            const clientId = this.getAttribute('data-id');
            messageClient(clientId);
        });
    });
    
    // Set up reschedule meeting buttons
    meetingsContainer.querySelectorAll('.reschedule-meeting').forEach(btn => {
        btn.addEventListener('click', function() {
            const meetingId = this.getAttribute('data-id');
            rescheduleMeeting(meetingId, true);
        });
    });
    
    // Set up cancel meeting buttons
    meetingsContainer.querySelectorAll('.cancel-meeting').forEach(btn => {
        btn.addEventListener('click', function() {
            const meetingId = this.getAttribute('data-id');
            cancelMeeting(meetingId, true);
        });
    });
}

/**
 * Message expert
 * @param {string} expertId - Expert ID
 */
function messageExpert(expertId) {
    // Get current user
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        showNotification('Please log in to message an expert', 'error');
        navigateTo('login');
        return;
    }
    
    // Get expert information
    const experts = JSON.parse(localStorage.getItem('users') || '[]');
    const expert = experts.find(e => e.id === expertId && e.type === 'expert');
    
    if (!expert) {
        showNotification('Expert not found', 'error');
        return;
    }
    
    // Check if there's already a message thread with this expert
    let existingThreadFound = false;
    
    if (currentUser.messages && currentUser.messages.length > 0) {
        currentUser.messages.forEach(message => {
            if (message.senderId === expert.id || message.recipientId === expert.id) {
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
            recipientId: currentUser.id,
            content: `Hello! I'm ${expert.fullname}, a financial expert specializing in ${expert.specialty}. How can I help you with your financial goals today?`,
            timestamp: new Date().toISOString()
        };
        
        // Add message to current user
        if (!currentUser.messages) {
            currentUser.messages = [];
        }
        currentUser.messages.push(welcomeMessage);
        
        // Update current user in storage
        updateCurrentUser(currentUser);
        updateUserInStorage(currentUser);
        
        // Add message to expert
        if (!expert.messages) {
            expert.messages = [];
        }
        expert.messages.push(welcomeMessage);
        
        // Update expert in storage
        const usersArray = JSON.parse(localStorage.getItem('users') || '[]');
        const expertIndex = usersArray.findIndex(u => u.id === expert.id);
        if (expertIndex !== -1) {
            usersArray[expertIndex] = expert;
            localStorage.setItem('users', JSON.stringify(usersArray));
        }
    }
    
    // Navigate to dashboard messages panel
    navigateTo('user-dashboard');
    activateDashboardTab('messages');
    
    // Refresh messages list to show the new thread
    loadUserMessages(currentUser);
    
    // Open chat with expert
    setTimeout(() => {
        // Find the contact item for this expert and click it
        const contactItem = document.querySelector(`#user-contacts .contact-item[data-id="${expert.id}"]`);
        if (contactItem) {
            contactItem.click();
        } else {
            // Direct open if contact item not found
            openChat(expert.id);
        }
    }, 100);
}

/**
 * Reschedule meeting
 * @param {string} meetingId - Meeting ID
 * @param {boolean} isExpert - Whether the current user is an expert
 */
function rescheduleMeeting(meetingId, isExpert = false) {
    // Get current user
    const currentUser = getCurrentUser();
    
    // Find meeting
    const meeting = currentUser.meetings.find(m => m.id === meetingId);
    
    if (!meeting) {
        showNotification('Meeting not found', 'error');
        return;
    }
    
    // Create reschedule modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Reschedule Meeting</h2>
            <form id="reschedule-form">
                <div class="form-group">
                    <label for="reschedule-date">New Date:</label>
                    <input type="date" id="reschedule-date" value="${meeting.date}" min="" required>
                </div>
                <div class="form-group">
                    <label for="reschedule-time">New Time:</label>
                    <select id="reschedule-time" required>
                        <option value="09:00" ${meeting.time === '09:00' ? 'selected' : ''}>09:00 AM</option>
                        <option value="10:00" ${meeting.time === '10:00' ? 'selected' : ''}>10:00 AM</option>
                        <option value="11:00" ${meeting.time === '11:00' ? 'selected' : ''}>11:00 AM</option>
                        <option value="12:00" ${meeting.time === '12:00' ? 'selected' : ''}>12:00 PM</option>
                        <option value="13:00" ${meeting.time === '13:00' ? 'selected' : ''}>01:00 PM</option>
                        <option value="14:00" ${meeting.time === '14:00' ? 'selected' : ''}>02:00 PM</option>
                        <option value="15:00" ${meeting.time === '15:00' ? 'selected' : ''}>03:00 PM</option>
                        <option value="16:00" ${meeting.time === '16:00' ? 'selected' : ''}>04:00 PM</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="reschedule-reason">Reason for Rescheduling:</label>
                    <textarea id="reschedule-reason" rows="3" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Reschedule Meeting</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Set min date for date picker (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('reschedule-date').min = tomorrow.toISOString().split('T')[0];
    
    // Close modal when clicked on x
    modal.querySelector('.close').addEventListener('click', () => {
        modal.remove();
    });
    
    // Close modal when clicked outside of it
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Handle form submission
    document.getElementById('reschedule-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newDate = document.getElementById('reschedule-date').value;
        const newTime = document.getElementById('reschedule-time').value;
        const reason = document.getElementById('reschedule-reason').value;
        
        // Update meeting
        meeting.date = newDate;
        meeting.time = newTime;
        meeting.status = 'rescheduled';
        meeting.rescheduleReason = reason;
        
        // Update user in localStorage
        updateCurrentUser(currentUser);
        updateUserInStorage(currentUser);
        
        // Update meeting for other party
        if (isExpert) {
            updateMeetingForUser(meeting);
        } else {
            updateMeetingForExpert(meeting);
        }
        
        // Close modal
        modal.remove();
        
        // Show success message
        showNotification('Meeting rescheduled successfully', 'success');
        
        // Reload meetings
        if (isExpert) {
            loadExpertMeetings(currentUser, 'upcoming');
        } else {
            loadUserMeetings(currentUser);
        }
    });
}

/**
 * Cancel meeting
 * @param {string} meetingId - Meeting ID
 * @param {boolean} isExpert - Whether the current user is an expert
 */
function cancelMeeting(meetingId, isExpert = false) {
    // Ask for confirmation
    if (!confirm('Are you sure you want to cancel this meeting?')) {
        return;
    }
    
    // Get current user
    const currentUser = getCurrentUser();
    
    // Find meeting
    const meetingIndex = currentUser.meetings.findIndex(m => m.id === meetingId);
    
    if (meetingIndex === -1) {
        showNotification('Meeting not found', 'error');
        return;
    }
    
    const meeting = currentUser.meetings[meetingIndex];
    
    // Remove meeting from user
    currentUser.meetings.splice(meetingIndex, 1);
    
    // Update user in localStorage
    updateCurrentUser(currentUser);
    updateUserInStorage(currentUser);
    
    // Remove meeting for other party
    if (isExpert) {
        removeMeetingForUser(meeting);
    } else {
        removeMeetingForExpert(meeting);
    }
    
    // Show success message
    showNotification('Meeting cancelled successfully', 'success');
    
    // Reload meetings
    if (isExpert) {
        loadExpertMeetings(currentUser, 'upcoming');
    } else {
        loadUserMeetings(currentUser);
    }
}

/**
 * Add meeting to expert
 * @param {string} expertId - Expert ID
 * @param {Object} meeting - Meeting object
 */
function addMeetingToExpert(expertId, meeting) {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find expert
    const expertIndex = users.findIndex(user => user.id === expertId);
    
    if (expertIndex === -1) {
        showNotification('Expert not found', 'error');
        return;
    }
    
    // Add meeting to expert
    if (!users[expertIndex].meetings) {
        users[expertIndex].meetings = [];
    }
    
    users[expertIndex].meetings.push(meeting);
    
    // Add client to expert
    if (!users[expertIndex].clients) {
        users[expertIndex].clients = [];
    }
    
    if (!users[expertIndex].clients.includes(meeting.userId)) {
        users[expertIndex].clients.push(meeting.userId);
    }
    
    // Save users to localStorage
    localStorage.setItem('users', JSON.stringify(users));
}

/**
 * Update meeting for user
 * @param {Object} meeting - Meeting object
 */
function updateMeetingForUser(meeting) {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find user
    const userIndex = users.findIndex(user => user.id === meeting.userId);
    
    if (userIndex === -1) {
        showNotification('User not found', 'error');
        return;
    }
    
    // Find meeting in user
    const userMeetingIndex = users[userIndex].meetings.findIndex(m => m.id === meeting.id);
    
    if (userMeetingIndex === -1) {
        showNotification('Meeting not found for user', 'error');
        return;
    }
    
    // Update meeting
    users[userIndex].meetings[userMeetingIndex] = meeting;
    
    // Save users to localStorage
    localStorage.setItem('users', JSON.stringify(users));
}

/**
 * Update meeting for expert
 * @param {Object} meeting - Meeting object
 */
function updateMeetingForExpert(meeting) {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find expert
    const expertIndex = users.findIndex(user => user.id === meeting.expertId);
    
    if (expertIndex === -1) {
        showNotification('Expert not found', 'error');
        return;
    }
    
    // Find meeting in expert
    const expertMeetingIndex = users[expertIndex].meetings.findIndex(m => m.id === meeting.id);
    
    if (expertMeetingIndex === -1) {
        showNotification('Meeting not found for expert', 'error');
        return;
    }
    
    // Update meeting
    users[expertIndex].meetings[expertMeetingIndex] = meeting;
    
    // Save users to localStorage
    localStorage.setItem('users', JSON.stringify(users));
}

/**
 * Remove meeting for user
 * @param {Object} meeting - Meeting object
 */
function removeMeetingForUser(meeting) {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find user
    const userIndex = users.findIndex(user => user.id === meeting.userId);
    
    if (userIndex === -1) {
        showNotification('User not found', 'error');
        return;
    }
    
    // Find meeting in user
    const userMeetingIndex = users[userIndex].meetings.findIndex(m => m.id === meeting.id);
    
    if (userMeetingIndex === -1) {
        // Meeting already removed
        return;
    }
    
    // Remove meeting
    users[userIndex].meetings.splice(userMeetingIndex, 1);
    
    // Save users to localStorage
    localStorage.setItem('users', JSON.stringify(users));
}

/**
 * Remove meeting for expert
 * @param {Object} meeting - Meeting object
 */
function removeMeetingForExpert(meeting) {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find expert
    const expertIndex = users.findIndex(user => user.id === meeting.expertId);
    
    if (expertIndex === -1) {
        showNotification('Expert not found', 'error');
        return;
    }
    
    // Find meeting in expert
    const expertMeetingIndex = users[expertIndex].meetings.findIndex(m => m.id === meeting.id);
    
    if (expertMeetingIndex === -1) {
        // Meeting already removed
        return;
    }
    
    // Remove meeting
    users[expertIndex].meetings.splice(expertMeetingIndex, 1);
    
    // Save users to localStorage
    localStorage.setItem('users', JSON.stringify(users));
}

/**
 * Format meeting date and time
 * @param {string} date - Date string
 * @param {string} time - Time string
 * @returns {string} - Formatted date and time
 */
function formatMeetingDateTime(date, time) {
    const meetingDate = new Date(`${date}T${time}`);
    
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    };
    
    return meetingDate.toLocaleDateString('en-US', options);
}

/**
 * Set up schedule meeting form
 */
function setupScheduleMeetingForm() {
    const scheduleForm = document.getElementById('schedule-meeting-form');
    if (!scheduleForm) return;
    
    scheduleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get current user
        const currentUser = getCurrentUser();
        if (!currentUser) {
            showNotification('You must be logged in to schedule a meeting', 'error');
            return;
        }
        
        // Get form values
        const expertId = document.getElementById('meeting-expert-select').value;
        const date = document.getElementById('meeting-date').value;
        const time = document.getElementById('meeting-time').value;
        const topic = document.getElementById('meeting-topic').value;
        const notes = document.getElementById('meeting-notes').value;
        
        // Validate form
        if (!expertId || !date || !time || !topic) {
            showNotification('Please fill out all required fields', 'error');
            return;
        }
        
        // Get expert
        let expert;
        
        // First try to get from experts collection
        const experts = JSON.parse(localStorage.getItem('experts') || '[]');
        expert = experts.find(e => e.id === expertId);
        
        // If not found, try to get from users collection
        if (!expert) {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            expert = users.find(u => u.id === expertId && u.type === 'expert');
        }
        
        if (!expert) {
            showNotification('Expert not found', 'error');
            return;
        }
        
        // Create meeting object
        const meetingId = generateId();
        const meetingForUser = {
            id: meetingId,
            expertId: expertId,
            expertName: expert.name || expert.fullname,
            date: date,
            time: time,
            topic: topic,
            notes: notes,
            status: 'scheduled',
            createdAt: new Date().toISOString()
        };
        
        const meetingForExpert = {
            id: meetingId,
            userId: currentUser.id,
            userName: currentUser.fullname,
            date: date,
            time: time,
            topic: topic,
            notes: notes,
            status: 'scheduled',
            createdAt: new Date().toISOString()
        };
        
        // Add meeting to user
        if (!currentUser.meetings) {
            currentUser.meetings = [];
        }
        currentUser.meetings.push(meetingForUser);
        
        // Update user in localStorage
        updateCurrentUser(currentUser);
        
        // Add meeting to expert
        addMeetingToExpert(expertId, meetingForExpert);
        
        // Show success message
        showNotification('Meeting scheduled successfully', 'success');
        
        // Reset form
        scheduleForm.reset();
        
        // Navigate to my meetings panel
        activateUserDashboardPanel('my-meetings');
        
        // Reload user meetings
        loadUserMeetings(currentUser);
    });
}

/**
 * Add meeting to expert
 * @param {string} expertId - Expert ID
 * @param {Object} meeting - Meeting object
 */
function addMeetingToExpert(expertId, meeting) {
    // First try to update in the experts collection
    let experts = JSON.parse(localStorage.getItem('experts') || '[]');
    let expertIndex = experts.findIndex(e => e.id === expertId);
    
    if (expertIndex !== -1) {
        // Expert found in experts collection
        if (!experts[expertIndex].meetings) {
            experts[expertIndex].meetings = [];
        }
        
        experts[expertIndex].meetings.push(meeting);
        localStorage.setItem('experts', JSON.stringify(experts));
    } else {
        // Try to find expert in users collection
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        let userIndex = users.findIndex(u => u.id === expertId && u.type === 'expert');
        
        if (userIndex !== -1) {
            // Expert found in users collection
            if (!users[userIndex].meetings) {
                users[userIndex].meetings = [];
            }
            
            users[userIndex].meetings.push(meeting);
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
}

/**
 * Update user in localStorage
 * @param {Object} user - User object
 */
function updateUserInStorage(user) {
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    const index = users.findIndex(u => u.id === user.id);
    
    if (index !== -1) {
        users[index] = user;
        localStorage.setItem('users', JSON.stringify(users));
    }
}

/**
 * Update current user in localStorage
 * @param {Object} user - User object
 */
function updateCurrentUser(user) {
    // Update current user
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Also update in users array
    updateUserInStorage(user);
}

/**
 * Generate a unique ID
 * @returns {string} - Unique ID
 */
function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Show notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success/error)
 */
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Remove after timeout
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

/**
 * Capitalize first letter of a string
 * @param {string} string - Input string
 * @returns {string} - String with first letter capitalized
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
