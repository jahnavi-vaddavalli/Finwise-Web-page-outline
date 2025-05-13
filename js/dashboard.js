// Dashboard functionality for FinWise platform
document.addEventListener('DOMContentLoaded', () => {
    // Initialize dashboards
    initDashboards();
});

/**
 * Initialize dashboard functionality
 */
function initDashboards() {
    // Set up user dashboard
    setupUserDashboard();
    
    // Set up expert dashboard
    setupExpertDashboard();
}

/**
 * Set up user dashboard
 */
function setupUserDashboard() {
    // Set up dashboard menu items
    document.querySelectorAll('#user-dashboard .menu-item').forEach(menuItem => {
        menuItem.addEventListener('click', () => {
            const targetPanel = menuItem.getAttribute('data-target');
            activateUserDashboardPanel(targetPanel);
        });
    });
    
    // Set up dashboard buttons
    document.querySelectorAll('#user-dashboard button[data-target]').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPanel = btn.getAttribute('data-target');
            activateUserDashboardPanel(targetPanel);
        });
    });
    
    // Set up meeting topic selection
    document.getElementById('meeting-topic').addEventListener('change', function() {
        const otherTopicContainer = document.getElementById('other-topic-container');
        if (this.value === 'other') {
            otherTopicContainer.style.display = 'block';
        } else {
            otherTopicContainer.style.display = 'none';
        }
    });
    
    // Populate experts dropdown for meeting scheduling
    populateExpertsDropdown();
    
    // Set up meeting scheduler form
    const scheduleForm = document.getElementById('schedule-meeting-form');
    if (scheduleForm && typeof setupScheduleMeetingForm === 'function') {
        setupScheduleMeetingForm();
    }
    
    // Set up schedule button (if used as an alternative to form submission)
    const scheduleBtn = document.getElementById('schedule-meeting-btn');
    if (scheduleBtn) {
        scheduleBtn.addEventListener('click', function() {
            if (typeof scheduleNewMeeting === 'function') {
                scheduleNewMeeting();
            } else {
                // Submit the form
                const form = document.getElementById('schedule-meeting-form');
                if (form) form.dispatchEvent(new Event('submit'));
            }
        });
    }
    
    // Set up expert application form
    document.getElementById('expert-specialty').addEventListener('change', function() {
        const otherSpecialtyContainer = document.getElementById('other-specialty-container');
        if (this.value === 'other') {
            otherSpecialtyContainer.style.display = 'block';
        } else {
            otherSpecialtyContainer.style.display = 'none';
        }
    });
    
    document.getElementById('expert-application-form').addEventListener('submit', function(e) {
        e.preventDefault();
        applyToBeExpert();
    });
    
    // Set up profile editing
    document.getElementById('edit-interests-btn').addEventListener('click', function() {
        document.getElementById('interest-tags').classList.add('hidden');
        document.getElementById('edit-interests-form').classList.remove('hidden');
    });
    
    document.getElementById('save-interests-btn').addEventListener('click', saveInterests);
    
    document.getElementById('cancel-interests-btn').addEventListener('click', function() {
        document.getElementById('interest-tags').classList.remove('hidden');
        document.getElementById('edit-interests-form').classList.add('hidden');
    });
    
    document.getElementById('update-profile-form').addEventListener('submit', function(e) {
        e.preventDefault();
        updateUserProfile();
    });
    
    // Set default date for meeting scheduler (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('meeting-date').min = tomorrow.toISOString().split('T')[0];
    document.getElementById('meeting-date').value = tomorrow.toISOString().split('T')[0];
}

/**
 * Populate experts dropdown for meeting scheduling
 */
function populateExpertsDropdown() {
    const dropdown = document.getElementById('meeting-expert-select');
    if (!dropdown) return;
    
    // Clear existing options except the first one
    while (dropdown.options.length > 1) {
        dropdown.remove(1);
    }
    
    // Get experts from localStorage (first from experts collection, then from users collection)
    let experts = JSON.parse(localStorage.getItem('experts') || '[]');
    
    // If no experts found in experts collection, try to get expert users
    if (experts.length === 0) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        experts = users.filter(user => user.type === 'expert');
    }
    
    if (experts.length === 0) {
        // No experts found, add a sample one
        const option = document.createElement('option');
        option.value = 'sample-expert';
        option.textContent = 'Sarah Johnson - Personal Finance Specialist';
        dropdown.appendChild(option);
        return;
    }
    
    // Add experts to dropdown
    experts.forEach(expert => {
        const option = document.createElement('option');
        option.value = expert.id;
        
        // Handle different expert object formats
        const name = expert.name || expert.fullname;
        const title = expert.title || expert.specialty || 'Financial Advisor';
        
        option.textContent = `${name} - ${title}`;
        dropdown.appendChild(option);
    });
    
    // Check if there's a current expert being viewed
    const currentExpertId = localStorage.getItem('currentExpertView');
    if (currentExpertId) {
        // Find and select the option for this expert
        for (let i = 0; i < dropdown.options.length; i++) {
            if (dropdown.options[i].value === currentExpertId) {
                dropdown.selectedIndex = i;
                break;
            }
        }
    }
}

/**
 * Set up expert dashboard
 */
function setupExpertDashboard() {
    // Set up dashboard menu items
    document.querySelectorAll('#expert-dashboard .menu-item').forEach(menuItem => {
        menuItem.addEventListener('click', () => {
            const targetPanel = menuItem.getAttribute('data-target');
            activateExpertDashboardPanel(targetPanel);
        });
    });
    
    // Set up article creation form
    document.getElementById('create-article-form').addEventListener('submit', function(e) {
        e.preventDefault();
        createArticle();
    });
    
    // Set up toolbar buttons
    document.querySelectorAll('.toolbar-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            formatText(action);
        });
    });
    
    // Set up expert profile form
    document.getElementById('update-expert-profile-form').addEventListener('submit', function(e) {
        e.preventDefault();
        updateExpertProfile();
    });
    
    // Set up expert password form
    document.getElementById('update-expert-password-form').addEventListener('submit', function(e) {
        e.preventDefault();
        updateExpertPassword();
    });
    
    // Set up meeting filters
    document.querySelectorAll('.meeting-filter .filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.meeting-filter .filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterMeetings(this.getAttribute('data-filter'));
        });
    });
    
    // Set up draft saving for articles
    document.getElementById('article-save-draft-btn').addEventListener('click', saveArticleDraft);
    
    // Set up article preview
    document.getElementById('article-preview-btn').addEventListener('click', previewArticle);
}

/**
 * Activate a panel in the user dashboard
 * @param {string} panelId - ID of the panel to activate
 */
function activateUserDashboardPanel(panelId) {
    // Remove active class from all menu items
    document.querySelectorAll('#user-dashboard .menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to the clicked menu item
    document.querySelector(`#user-dashboard .menu-item[data-target="${panelId}"]`)?.classList.add('active');
    
    // Remove active class from all panels
    document.querySelectorAll('#user-dashboard .dashboard-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Add active class to the target panel
    document.getElementById(`user-${panelId}`)?.classList.add('active');
}

/**
 * Activate a panel in the expert dashboard
 * @param {string} panelId - ID of the panel to activate
 */
function activateExpertDashboardPanel(panelId) {
    // Remove active class from all menu items
    document.querySelectorAll('#expert-dashboard .menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to the clicked menu item
    document.querySelector(`#expert-dashboard .menu-item[data-target="${panelId}"]`)?.classList.add('active');
    
    // Remove active class from all panels
    document.querySelectorAll('#expert-dashboard .dashboard-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Add active class to the target panel
    document.getElementById(`expert-${panelId}`)?.classList.add('active');
}

/**
 * Update user dashboard with user data
 * @param {Object} user - User object
 */
function updateUserDashboard(user) {
    // Update user name
    document.getElementById('user-dashboard-name').textContent = user.fullname;
    
    // Update profile information
    document.getElementById('profile-name').textContent = user.fullname;
    document.getElementById('profile-email').textContent = user.email;
    document.getElementById('profile-join-date').textContent = `Member since: ${formatDate(user.joinDate)}`;
    
    // Update form fields
    document.getElementById('update-name').value = user.fullname;
    document.getElementById('update-email').value = user.email;
    
    // Update interest tags
    updateInterestTags(user.interests || []);
    
    // Load articles
    loadArticlesForUser();
    
    // Load user meetings
    loadUserMeetings(user);
    
    // Load user messages
    loadUserMessages(user);
    
    // Load experts for the find experts panel
    loadExpertsForDashboard();
    
    // Show empty states for new users
    if (user.meetings && user.meetings.length === 0) {
        const emptyState = document.querySelector('#user-my-meetings .empty-state');
        if (emptyState) {
            emptyState.classList.remove('hidden');
        }
    }
    
    if (user.messages && user.messages.length === 0) {
        const emptyState = document.querySelector('#user-messages .empty-state');
        if (emptyState) {
            emptyState.classList.remove('hidden');
        }
    }
}

/**
 * Update expert dashboard with expert data
 * @param {Object} expert - Expert object
 */
function updateExpertDashboard(expert) {
    // Update expert name
    document.getElementById('expert-dashboard-name').textContent = expert.fullname;
    
    // Update profile information
    document.getElementById('expert-profile-name').textContent = expert.fullname;
    document.getElementById('expert-profile-title').textContent = expert.specialty || 'Financial Advisor';
    document.getElementById('expert-profile-email').textContent = expert.email;
    
    // Update form fields
    document.getElementById('expert-update-name').value = expert.fullname;
    document.getElementById('expert-update-title').value = expert.specialty || 'Financial Advisor';
    document.getElementById('expert-update-email').value = expert.email;
    document.getElementById('expert-update-specialty').value = getSpecialtyValue(expert.specialty) || 'personal-finance';
    document.getElementById('expert-update-bio').value = expert.bio || '';
    document.getElementById('expert-update-credentials').value = expert.credentials || '';
    document.getElementById('expert-update-experience').value = expert.experience ? expert.experience.toLowerCase().replace(' years', '') : '8-12';
    
    // Load expert's articles
    loadExpertArticles(expert);
    
    // Load expert meetings
    loadExpertMeetings(expert);
    
    // Load expert clients
    loadExpertClients(expert);
    
    // Load expert messages
    loadExpertMessages(expert);
    
    // Show empty states for new experts
    if (!expert.articles || expert.articles.length === 0) {
        const emptyState = document.querySelector('#expert-expert-articles .empty-state');
        if (emptyState) {
            emptyState.classList.remove('hidden');
        }
    }
    
    if (!expert.meetings || expert.meetings.length === 0) {
        const emptyState = document.querySelector('#expert-expert-meetings .empty-state');
        if (emptyState) {
            emptyState.classList.remove('hidden');
        }
    }
    
    if (!expert.clients || expert.clients.length === 0) {
        const emptyState = document.querySelector('#expert-expert-clients .empty-state');
        if (emptyState) {
            emptyState.classList.remove('hidden');
        }
    }
    
    if (!expert.messages || expert.messages.length === 0) {
        const emptyState = document.querySelector('#expert-expert-messages .empty-state');
        if (emptyState) {
            emptyState.classList.remove('hidden');
        }
    }
}

/**
 * Schedule a new meeting
 */
function scheduleNewMeeting() {
    const expertId = document.getElementById('meeting-expert-select').value;
    const date = document.getElementById('meeting-date').value;
    const time = document.getElementById('meeting-time').value;
    const topic = document.getElementById('meeting-topic').value;
    const otherTopic = document.getElementById('other-topic').value;
    const notes = document.getElementById('meeting-notes').value;
    
    if (!expertId || !date || !time || !topic) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    const topicText = topic === 'other' ? otherTopic : topic;
    
    // Get expert details
    const expert = getExpertById(expertId);
    if (!expert) {
        showNotification('Expert not found', 'error');
        return;
    }
    
    // Create meeting object
    const meetingId = generateId();
    const meeting = {
        id: meetingId,
        expertId: expertId,
        expertName: expert.name,
        userId: getCurrentUser().id,
        userName: getCurrentUser().fullname,
        date: date,
        time: time,
        topic: topicText,
        notes: notes,
        status: 'scheduled'
    };
    
    // Add meeting to current user
    const currentUser = getCurrentUser();
    if (!currentUser.meetings) {
        currentUser.meetings = [];
    }
    currentUser.meetings.push(meeting);
    updateCurrentUser(currentUser);
    
    // Add meeting to expert
    addMeetingToExpert(expertId, meeting);
    
    // Update user in users array
    updateUserInStorage(currentUser);
    
    // Show success message
    showNotification('Meeting scheduled successfully', 'success');
    
    // Reset form
    document.getElementById('meeting-expert-select').value = '';
    document.getElementById('meeting-topic').value = '';
    document.getElementById('other-topic').value = '';
    document.getElementById('meeting-notes').value = '';
    
    // Navigate to my meetings
    activateUserDashboardPanel('my-meetings');
    
    // Reload meetings
    loadUserMeetings(currentUser);
}

/**
 * Apply to become an expert
 */
function applyToBeExpert() {
    const specialty = document.getElementById('expert-specialty').value;
    const otherSpecialty = document.getElementById('other-specialty').value;
    const experience = document.getElementById('expert-experience').value;
    const credentials = document.getElementById('expert-credentials').value;
    const bio = document.getElementById('expert-bio').value;
    const motivation = document.getElementById('expert-motivation').value;
    
    if (!specialty || !experience || !credentials || !bio || !motivation) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    const specialtyText = specialty === 'other' ? otherSpecialty : specialty;
    
    // Get current user
    const currentUser = getCurrentUser();
    
    // Update user to expert
    currentUser.type = 'expert';
    currentUser.specialty = getSpecialtyLabel(specialtyText);
    currentUser.experience = getExperienceLabel(experience);
    currentUser.credentials = credentials;
    currentUser.bio = bio;
    currentUser.articles = [];
    currentUser.clients = [];
    
    // Update user in localStorage
    updateCurrentUser(currentUser);
    updateUserInStorage(currentUser);
    
    // Show success message
    showNotification('Application submitted successfully. You are now registered as an expert!', 'success');
    
    // Navigate to expert dashboard
    navigateTo('expert-dashboard');
    updateExpertDashboard(currentUser);
}

/**
 * Save user interests
 */
function saveInterests() {
    const interests = [];
    
    if (document.getElementById('interest-investing').checked) {
        interests.push('Investing');
    }
    
    if (document.getElementById('interest-retirement').checked) {
        interests.push('Retirement');
    }
    
    if (document.getElementById('interest-budgeting').checked) {
        interests.push('Budgeting');
    }
    
    if (document.getElementById('interest-tax').checked) {
        interests.push('Tax Planning');
    }
    
    if (document.getElementById('interest-debt').checked) {
        interests.push('Debt Management');
    }
    
    if (document.getElementById('interest-estate').checked) {
        interests.push('Estate Planning');
    }
    
    // Update current user
    const currentUser = getCurrentUser();
    currentUser.interests = interests;
    updateCurrentUser(currentUser);
    updateUserInStorage(currentUser);
    
    // Update UI
    updateInterestTags(interests);
    
    // Hide edit form
    document.getElementById('interest-tags').classList.remove('hidden');
    document.getElementById('edit-interests-form').classList.add('hidden');
    
    showNotification('Interests updated successfully', 'success');
}

/**
 * Update interest tags in UI
 * @param {Array} interests - Array of interest strings
 */
function updateInterestTags(interests) {
    const tagsContainer = document.getElementById('interest-tags');
    
    // Clear existing tags except the edit button
    const editButton = document.getElementById('edit-interests-btn');
    tagsContainer.innerHTML = '';
    
    // Add new tags
    interests.forEach(interest => {
        const tag = document.createElement('span');
        tag.className = 'interest-tag';
        tag.textContent = interest;
        tagsContainer.appendChild(tag);
    });
    
    // Add edit button back
    tagsContainer.appendChild(editButton);
    
    // Update checkboxes
    document.getElementById('interest-investing').checked = interests.includes('Investing');
    document.getElementById('interest-retirement').checked = interests.includes('Retirement');
    document.getElementById('interest-budgeting').checked = interests.includes('Budgeting');
    document.getElementById('interest-tax').checked = interests.includes('Tax Planning');
    document.getElementById('interest-debt').checked = interests.includes('Debt Management');
    document.getElementById('interest-estate').checked = interests.includes('Estate Planning');
}

/**
 * Update user profile
 */
function updateUserProfile() {
    const name = document.getElementById('update-name').value;
    const email = document.getElementById('update-email').value;
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;
    
    if (!name || !email) {
        showNotification('Name and email are required', 'error');
        return;
    }
    
    // Get current user
    const currentUser = getCurrentUser();
    
    // Validate current password if changing password
    if (currentPassword && (currentPassword !== currentUser.password)) {
        showNotification('Current password is incorrect', 'error');
        return;
    }
    
    // Validate new password if changing password
    if (newPassword && (newPassword !== confirmNewPassword)) {
        showNotification('New passwords do not match', 'error');
        return;
    }
    
    // Update user data
    currentUser.fullname = name;
    currentUser.email = email;
    
    if (newPassword) {
        currentUser.password = newPassword;
    }
    
    // Update user in localStorage
    updateCurrentUser(currentUser);
    updateUserInStorage(currentUser);
    
    // Update UI
    document.getElementById('user-name').textContent = name;
    document.getElementById('user-dashboard-name').textContent = name;
    document.getElementById('profile-name').textContent = name;
    document.getElementById('profile-email').textContent = email;
    
    // Clear password fields
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-new-password').value = '';
    
    showNotification('Profile updated successfully', 'success');
}

/**
 * Update expert profile
 */
function updateExpertProfile() {
    const name = document.getElementById('expert-update-name').value;
    const title = document.getElementById('expert-update-title').value;
    const email = document.getElementById('expert-update-email').value;
    const specialty = document.getElementById('expert-update-specialty').value;
    const bio = document.getElementById('expert-update-bio').value;
    const credentials = document.getElementById('expert-update-credentials').value;
    const experience = document.getElementById('expert-update-experience').value;
    
    if (!name || !email || !title || !specialty || !bio || !credentials || !experience) {
        showNotification('All fields are required', 'error');
        return;
    }
    
    // Get current user
    const currentUser = getCurrentUser();
    
    // Update user data
    currentUser.fullname = name;
    currentUser.email = email;
    currentUser.specialty = getSpecialtyLabel(specialty);
    currentUser.title = title;
    currentUser.bio = bio;
    currentUser.credentials = credentials;
    currentUser.experience = getExperienceLabel(experience);
    
    // Update user in localStorage
    updateCurrentUser(currentUser);
    updateUserInStorage(currentUser);
    
    // Update UI
    document.getElementById('user-name').textContent = name;
    document.getElementById('expert-dashboard-name').textContent = name;
    document.getElementById('expert-profile-name').textContent = name;
    document.getElementById('expert-profile-title').textContent = title;
    document.getElementById('expert-profile-email').textContent = email;
    
    showNotification('Profile updated successfully', 'success');
}

/**
 * Update expert password
 */
function updateExpertPassword() {
    const currentPassword = document.getElementById('expert-current-password').value;
    const newPassword = document.getElementById('expert-new-password').value;
    const confirmNewPassword = document.getElementById('expert-confirm-new-password').value;
    
    // Get current user
    const currentUser = getCurrentUser();
    
    // Validate current password
    if (currentPassword !== currentUser.password) {
        showNotification('Current password is incorrect', 'error');
        return;
    }
    
    // Validate new password
    if (newPassword !== confirmNewPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }
    
    // Update user data
    currentUser.password = newPassword;
    
    // Update user in localStorage
    updateCurrentUser(currentUser);
    updateUserInStorage(currentUser);
    
    // Clear password fields
    document.getElementById('expert-current-password').value = '';
    document.getElementById('expert-new-password').value = '';
    document.getElementById('expert-confirm-new-password').value = '';
    
    showNotification('Password updated successfully', 'success');
}

/**
 * Create a new article
 */
function createArticle() {
    const title = document.getElementById('article-title').value;
    const category = document.getElementById('article-category').value;
    const summary = document.getElementById('article-summary').value;
    const content = document.getElementById('article-content').value;
    const tags = document.getElementById('article-tags').value;
    
    if (!title || !category || !summary || !content) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    // Get current user
    const currentUser = getCurrentUser();
    
    // Create article object
    const articleId = generateId();
    const article = {
        id: articleId,
        title: title,
        author: currentUser.fullname,
        authorId: currentUser.id,
        date: new Date().toISOString().split('T')[0],
        category: category,
        summary: summary,
        content: content,
        image: getRandomImageForCategory(category),
        tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    };
    
    // Add article to articles array
    const articles = JSON.parse(localStorage.getItem('articles') || '[]');
    articles.push(article);
    localStorage.setItem('articles', JSON.stringify(articles));
    
    // Add article to current user
    if (!currentUser.articles) {
        currentUser.articles = [];
    }
    currentUser.articles.push(articleId);
    updateCurrentUser(currentUser);
    updateUserInStorage(currentUser);
    
    // Clear form
    document.getElementById('article-title').value = '';
    document.getElementById('article-category').value = '';
    document.getElementById('article-summary').value = '';
    document.getElementById('article-content').value = '';
    document.getElementById('article-tags').value = '';
    
    // Show success message
    showNotification('Article published successfully', 'success');
    
    // Navigate to my articles
    activateExpertDashboardPanel('expert-articles');
    
    // Reload articles
    loadExpertArticles(currentUser);
}

/**
 * Save article draft
 */
function saveArticleDraft() {
    const title = document.getElementById('article-title').value;
    const category = document.getElementById('article-category').value;
    const summary = document.getElementById('article-summary').value;
    const content = document.getElementById('article-content').value;
    const tags = document.getElementById('article-tags').value;
    
    // Save draft to localStorage
    const draft = {
        title: title,
        category: category,
        summary: summary,
        content: content,
        tags: tags
    };
    
    localStorage.setItem('articleDraft', JSON.stringify(draft));
    
    showNotification('Draft saved successfully', 'success');
}

/**
 * Preview article
 */
function previewArticle() {
    const title = document.getElementById('article-title').value;
    const category = document.getElementById('article-category').value;
    const summary = document.getElementById('article-summary').value;
    const content = document.getElementById('article-content').value;
    
    if (!title || !category || !summary || !content) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    // Create preview modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>${title}</h2>
            <p class="article-meta">By ${getCurrentUser().fullname} | ${new Date().toLocaleDateString()}</p>
            <p class="article-summary">${summary}</p>
            <div class="article-content">${formatContentForPreview(content)}</div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
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
}

/**
 * Format text in article editor
 * @param {string} action - Formatting action
 */
function formatText(action) {
    const textarea = document.getElementById('article-content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = '';
    
    switch (action) {
        case 'bold':
            formattedText = `**${selectedText}**`;
            break;
        case 'italic':
            formattedText = `*${selectedText}*`;
            break;
        case 'underline':
            formattedText = `__${selectedText}__`;
            break;
        case 'heading':
            formattedText = `## ${selectedText}`;
            break;
        case 'list-ul':
            formattedText = selectedText.split('\n').map(line => `- ${line}`).join('\n');
            break;
        case 'list-ol':
            formattedText = selectedText.split('\n').map((line, i) => `${i+1}. ${line}`).join('\n');
            break;
        case 'link':
            formattedText = `[${selectedText}](url)`;
            break;
        case 'quote':
            formattedText = `> ${selectedText}`;
            break;
    }
    
    // Replace selected text with formatted text
    textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    
    // Set cursor position
    textarea.focus();
    textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
}

/**
 * Format content for preview
 * @param {string} content - Raw content
 * @returns {string} - Formatted HTML content
 */
function formatContentForPreview(content) {
    // Replace markdown with HTML
    let html = content;
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Underline
    html = html.replace(/__(.*?)__/g, '<u>$1</u>');
    
    // Headings
    html = html.replace(/## (.*?)(?:\n|$)/g, '<h3>$1</h3>');
    
    // Unordered list
    html = html.replace(/- (.*?)(?:\n|$)/g, '<li>$1</li>');
    
    // Ordered list
    html = html.replace(/\d+\. (.*?)(?:\n|$)/g, '<li>$1</li>');
    
    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    
    // Quotes
    html = html.replace(/> (.*?)(?:\n|$)/g, '<blockquote>$1</blockquote>');
    
    // Wrap lists
    if (html.includes('<li>')) {
        html = html.replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>');
    }
    
    // Paragraphs
    html = html.split('\n\n').map(p => `<p>${p}</p>`).join('');
    
    return html;
}

/**
 * Filter meetings
 * @param {string} filter - Filter type (upcoming/past)
 */
function filterMeetings(filter) {
    const currentUser = getCurrentUser();
    loadExpertMeetings(currentUser, filter);
}

/**
 * Helper function to get specialty label
 * @param {string} value - Specialty value
 * @returns {string} - Specialty label
 */
function getSpecialtyLabel(value) {
    const specialties = {
        'personal-finance': 'Personal Finance',
        'investment': 'Investment Advisory',
        'retirement': 'Retirement Planning',
        'tax': 'Tax Planning',
        'estate': 'Estate Planning',
        'debt': 'Debt Management'
    };
    
    return specialties[value] || value;
}

/**
 * Helper function to get specialty value
 * @param {string} label - Specialty label
 * @returns {string} - Specialty value
 */
function getSpecialtyValue(label) {
    const specialties = {
        'Personal Finance': 'personal-finance',
        'Investment Advisory': 'investment',
        'Retirement Planning': 'retirement',
        'Tax Planning': 'tax',
        'Estate Planning': 'estate',
        'Debt Management': 'debt'
    };
    
    return specialties[label] || 'personal-finance';
}

/**
 * Helper function to get experience label
 * @param {string} value - Experience value
 * @returns {string} - Experience label
 */
function getExperienceLabel(value) {
    const experiences = {
        '1-3': '1-3 years',
        '4-7': '4-7 years',
        '8-12': '8-12 years',
        '13+': '13+ years'
    };
    
    return experiences[value] || value;
}

/**
 * Get random image for article category
 * @param {string} category - Article category
 * @returns {string} - Image URL
 */
function getRandomImageForCategory(category) {
    const images = {
        'budgeting': 'https://images.unsplash.com/photo-1631856952982-7db18c2bdca4',
        'investing': 'https://images.unsplash.com/photo-1649954174454-767fd0a40fb6',
        'retirement': 'https://images.unsplash.com/photo-1716878906849-17ed9e9e6186',
        'tax': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
        'debt': 'https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6',
        'estate': 'https://images.unsplash.com/photo-1563986768711-b3bde3dc821e',
        'financial-literacy': 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74'
    };
    
    return images[category] || 'https://images.unsplash.com/photo-1444653389962-8149286c578a';
}

/**
 * Format date
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
function formatDate(dateString) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const date = new Date(dateString);
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Load experts for the user dashboard
 */
function loadExpertsForDashboard() {
    // Get the container
    const expertsContainer = document.querySelector('#user-find-experts .experts-grid');
    if (!expertsContainer) return;
    
    // Clear current content
    expertsContainer.innerHTML = '';
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Filter experts
    const experts = users.filter(user => user.type === 'expert');
    
    console.log("Loading experts for dashboard:", experts);
    
    // Check if there are experts
    if (experts.length === 0) {
        expertsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-tie"></i>
                <p>No experts found. Check back later!</p>
            </div>
        `;
        return;
    }
    
    // Create expert cards
    experts.forEach(expert => {
        // Create a random rating between 4.0 and 5.0
        const rating = (4 + Math.random()).toFixed(1);
        const reviewCount = Math.floor(Math.random() * 40) + 10;
        
        const card = document.createElement('div');
        card.className = 'expert-card';
        card.setAttribute('data-id', expert.id);
        
        card.innerHTML = `
            <div class="expert-img">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d" alt="${expert.fullname}">
            </div>
            <h4>${expert.fullname}</h4>
            <p class="expert-title">${expert.specialty || 'Financial Advisor'}</p>
            <div class="expert-rating">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="${parseFloat(rating) >= 4.5 ? 'fas fa-star' : 'fas fa-star-half-alt'}"></i>
                <span>${rating} (${reviewCount} reviews)</span>
            </div>
            <p class="expert-description">${expert.bio ? expert.bio.substring(0, 100) + '...' : 'Experienced financial advisor ready to help with your financial goals.'}</p>
            <button class="btn btn-small view-profile-btn" data-id="${expert.id}">View Profile</button>
        `;
        
        expertsContainer.appendChild(card);
    });
}
