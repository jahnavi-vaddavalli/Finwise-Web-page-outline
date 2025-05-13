// Main JavaScript file for FinWise platform
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    initApp();

    // Set up navigation
    setupNavigation();

    // Set up footer
    setupFooter();
});

/**
 * Initialize the application
 */
function initApp() {
    // Initialize app data if needed
    if (typeof initializeAppDataIfNeeded === 'function') {
        initializeAppDataIfNeeded();
    }
    
    // Check if user is logged in
    const currentUser = getCurrentUser();
    updateHeaderBasedOnAuth(currentUser);

    // Load experts on home page
    loadHomePageExperts();
    
    // Load articles on home page
    loadHomePageArticles();

    // Load initial content
    showActiveSection();
}

/**
 * Load experts for the home page
 */
function loadHomePageExperts() {
    const expertsContainer = document.getElementById('home-experts-grid');
    if (!expertsContainer) return;
    
    // Clear any existing content
    expertsContainer.innerHTML = '';
    
    // Get experts from localStorage (first try the experts collection, then the users collection)
    let experts = JSON.parse(localStorage.getItem('experts') || '[]');
    
    // If no experts found in experts collection, try to get expert users
    if (experts.length === 0) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        experts = users.filter(user => user.type === 'expert');
    }
    
    // Display up to 3 experts
    const expertsToShow = experts.slice(0, 3);
    
    expertsToShow.forEach(expert => {
        const expertCard = document.createElement('div');
        expertCard.className = 'expert-card';
        expertCard.setAttribute('data-id', expert.id);
        
        const name = expert.name || expert.fullname;
        const title = expert.title || expert.specialty || 'Financial Advisor';
        const imgSrc = expert.imgSrc || 'https://images.unsplash.com/photo-1542744173-05336fcc7ad4';
        
        expertCard.innerHTML = `
            <div class="expert-img">
                <img src="${imgSrc}" alt="${name}">
            </div>
            <h3>${name}</h3>
            <p>${title}</p>
            <button class="btn btn-small home-view-profile-btn" data-id="${expert.id}">View Profile</button>
        `;
        
        expertsContainer.appendChild(expertCard);
    });
    
    // Add event listeners for view profile buttons
    document.querySelectorAll('.home-view-profile-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const expertId = this.getAttribute('data-id');
            viewExpertProfile(expertId);
        });
    });
}

/**
 * Load articles for the home page
 */
function loadHomePageArticles() {
    const articlesContainer = document.getElementById('home-articles-grid');
    if (!articlesContainer) return;
    
    // Clear any existing content
    articlesContainer.innerHTML = '';
    
    // Get articles from localStorage
    const articles = JSON.parse(localStorage.getItem('articles') || '[]');
    
    // Sort by date (newest first)
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Display up to 3 most recent articles
    const articlesToShow = articles.slice(0, 3);
    
    articlesToShow.forEach(article => {
        const articleCard = document.createElement('div');
        articleCard.className = 'article-card';
        
        articleCard.innerHTML = `
            <div class="article-image">
                <img src="${article.image}" alt="${article.title}">
            </div>
            <div class="article-content">
                <h4>${article.title}</h4>
                <p class="article-meta">By ${article.author} | ${formatArticleDate(article.date)}</p>
                <p class="article-excerpt">${article.summary}</p>
                <button class="btn btn-small home-view-article-btn" data-id="${article.id}">Read More</button>
            </div>
        `;
        
        articlesContainer.appendChild(articleCard);
    });
    
    // Add event listeners for view article buttons
    document.querySelectorAll('.home-view-article-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const articleId = this.getAttribute('data-id');
            if (typeof viewArticle === 'function') {
                viewArticle(articleId);
            } else {
                navigateTo('user-dashboard');
                activateDashboardTab('articles');
            }
        });
    });
}

/**
 * Format article date for display
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
function formatArticleDate(dateString) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const date = new Date(dateString);
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Set up navigation
 */
function setupNavigation() {
    // Handle navigation clicks
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            navigateTo(targetId);
        });
    });

    // Handle get started button
    document.getElementById('get-started-btn').addEventListener('click', () => {
        navigateTo('register');
    });

    // Handle learn more button
    document.getElementById('learn-more-btn').addEventListener('click', () => {
        navigateTo('about');
    });

    // Handle footer connect button
    document.getElementById('footer-connect-btn').addEventListener('click', () => {
        const currentUser = getCurrentUser();
        if (currentUser) {
            navigateTo('user-dashboard');
            // Activate the experts tab
            activateDashboardTab('experts');
        } else {
            navigateTo('register');
        }
    });
    
    // Handle dashboard link in header dropdown
    document.getElementById('dashboard-link').addEventListener('click', (e) => {
        e.preventDefault();
        const currentUser = getCurrentUser();
        if (currentUser) {
            if (currentUser.type === 'expert') {
                navigateTo('expert-dashboard');
            } else {
                navigateTo('user-dashboard');
            }
        } else {
            navigateTo('login');
        }
    });
    
    // Handle footer logout link
    const footerLogoutLinks = document.querySelectorAll('.footer-logout');
    if (footerLogoutLinks) {
        footerLogoutLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof logout === 'function') {
                    logout();
                }
            });
        });
    }

    // Check for hash in URL
    if (window.location.hash) {
        const sectionId = window.location.hash.substring(1);
        navigateTo(sectionId);
    }

    // Back to experts button
    document.getElementById('back-to-experts').addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('user-dashboard');
        activateDashboardTab('experts');
    });

    // View expert profile buttons
    document.querySelectorAll('.view-profile-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const expertId = btn.getAttribute('data-id');
            viewExpertProfile(expertId);
        });
    });

    // Schedule meeting from expert profile
    document.getElementById('schedule-with-expert').addEventListener('click', (e) => {
        e.preventDefault();
        const expertId = localStorage.getItem('currentExpertView');
        navigateTo('user-dashboard');
        activateDashboardTab('schedule-meeting');
        document.getElementById('meeting-expert-select').value = expertId;
    });

    // Message expert from profile
    document.getElementById('message-expert').addEventListener('click', (e) => {
        e.preventDefault();
        const expertId = localStorage.getItem('currentExpertView');
        if (expertId) {
            messageExpert(expertId);
        } else {
            showNotification('Expert not found', 'error');
        }
    });
}

/**
 * Navigate to a specific section
 * @param {string} sectionId - ID of the section to navigate to
 */
function navigateTo(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });

    // Show the target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        window.location.hash = sectionId;
        
        // Add back button for non-home sections
        if (sectionId !== 'home' && 
            sectionId !== 'login' && 
            sectionId !== 'register') {
            
            // Check if back button exists, otherwise create it
            let backButton = document.getElementById('back-to-home-btn');
            if (!backButton) {
                backButton = document.createElement('button');
                backButton.id = 'back-to-home-btn';
                backButton.className = 'btn btn-secondary back-btn';
                backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Home';
                backButton.addEventListener('click', () => navigateTo('home'));
                
                // Insert at the beginning of the target section
                if (targetSection.firstChild) {
                    targetSection.insertBefore(backButton, targetSection.firstChild);
                } else {
                    targetSection.appendChild(backButton);
                }
            } else {
                // If exists, make sure it's visible
                backButton.style.display = 'block';
            }
        } else {
            // Hide back button on home, login and register pages
            const backButton = document.getElementById('back-to-home-btn');
            if (backButton) {
                backButton.style.display = 'none';
            }
        }
    }

    // Update the profile section if needed
    if (sectionId === 'my-profile') {
        const currentUser = getCurrentUser();
        if (currentUser) {
            if (currentUser.type === 'expert') {
                document.getElementById('my-profile').innerHTML = document.getElementById('expert-expert-profile').innerHTML;
            } else {
                document.getElementById('my-profile').innerHTML = document.getElementById('user-my-profile').innerHTML;
            }
            document.getElementById('my-profile').classList.add('active');
        }
    }

    // Scroll to top
    window.scrollTo(0, 0);
}

/**
 * Show the current active section based on hash or default
 */
function showActiveSection() {
    // Get section from hash or default to home
    const sectionId = window.location.hash ? window.location.hash.substring(1) : 'home';
    navigateTo(sectionId);
}

/**
 * Update header based on authentication status
 * @param {Object|null} user - Current user object or null
 */
function updateHeaderBasedOnAuth(user) {
    // Header elements
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const profileSection = document.getElementById('profile-section');
    const userNameElement = document.getElementById('user-name');
    const dashboardLink = document.getElementById('dashboard-link');
    
    // Footer elements
    const footerLoginBtn = document.getElementById('footer-login-btn');
    const footerRegisterBtn = document.getElementById('footer-register-btn');
    const footerDashboardBtn = document.getElementById('footer-dashboard-btn');
    const footerProfileBtn = document.getElementById('footer-profile-btn');
    const footerLogoutBtn = document.getElementById('footer-logout-btn');

    if (user) {
        // User is logged in - Header updates
        loginBtn.classList.add('hidden');
        registerBtn.classList.add('hidden');
        profileSection.classList.remove('hidden');
        userNameElement.textContent = user.fullname;
        
        // Set dashboard link based on user type
        if (dashboardLink) {
            if (user.type === 'expert') {
                dashboardLink.setAttribute('href', '#expert-dashboard');
            } else {
                dashboardLink.setAttribute('href', '#user-dashboard');
            }
        }
        
        // Footer updates for logged in user
        if (footerLoginBtn) footerLoginBtn.classList.add('hidden');
        if (footerRegisterBtn) footerRegisterBtn.classList.add('hidden');
        if (footerDashboardBtn) {
            footerDashboardBtn.classList.remove('hidden');
            // Set dashboard link based on user type
            const dashboardFooterLink = footerDashboardBtn.querySelector('a');
            if (dashboardFooterLink) {
                if (user.type === 'expert') {
                    dashboardFooterLink.setAttribute('href', '#expert-dashboard');
                } else {
                    dashboardFooterLink.setAttribute('href', '#user-dashboard');
                }
            }
        }
        if (footerProfileBtn) footerProfileBtn.classList.remove('hidden');
        if (footerLogoutBtn) footerLogoutBtn.classList.remove('hidden');
    } else {
        // User is not logged in - Header updates
        loginBtn.classList.remove('hidden');
        registerBtn.classList.remove('hidden');
        profileSection.classList.add('hidden');
        
        // Footer updates for logged out user
        if (footerLoginBtn) footerLoginBtn.classList.remove('hidden');
        if (footerRegisterBtn) footerRegisterBtn.classList.remove('hidden');
        if (footerDashboardBtn) footerDashboardBtn.classList.add('hidden');
        if (footerProfileBtn) footerProfileBtn.classList.add('hidden');
        if (footerLogoutBtn) footerLogoutBtn.classList.add('hidden');
    }
}

/**
 * Get the current user from localStorage
 * @returns {Object|null} - User object or null if not logged in
 */
function getCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
}

/**
 * Set up footer functionality
 */
function setupFooter() {
    // Handle quick links
    document.querySelectorAll('.footer-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                navigateTo(targetId);
            }
        });
    });
}

/**
 * Activate a specific tab in the dashboard
 * @param {string} tabId - ID of the tab to activate
 */
function activateDashboardTab(tabId) {
    const currentUser = getCurrentUser();
    let dashboardPrefix = currentUser && currentUser.type === 'expert' ? 'expert-' : 'user-';
    
    // Get all menu items
    const menuItems = document.querySelectorAll(`.dashboard-menu .menu-item`);
    
    // Get all panels
    const panels = document.querySelectorAll(`.dashboard-panel`);
    
    // Remove active class from all menu items and panels
    menuItems.forEach(item => item.classList.remove('active'));
    panels.forEach(panel => panel.classList.remove('active'));
    
    // Add active class to the clicked menu item
    const targetMenuItem = document.querySelector(`.menu-item[data-target="${tabId}"]`);
    if (targetMenuItem) {
        targetMenuItem.classList.add('active');
    }
    
    // Add active class to the corresponding panel
    const targetPanel = document.getElementById(`${dashboardPrefix}${tabId}`);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }
}

/**
 * Helper function to call the viewExpertProfile function in profile.js
 * @param {string} expertId - ID of the expert
 */
function viewExpertProfile(expertId) {
    // This function delegates to the main viewExpertProfile function in profile.js
    
    try {
        // First check if the function is exposed on the window object
        if (typeof window.viewExpertProfile === 'function' && window.viewExpertProfile !== viewExpertProfile) {
            window.viewExpertProfile(expertId);
            return;
        }
        
        // As a fallback, try to handle it here since we might be called first
        // First try to get expert from experts collection
        const experts = JSON.parse(localStorage.getItem('experts') || '[]');
        let expert = experts.find(e => e.id === expertId);
        
        // If not found, try to get from users collection
        if (!expert) {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            expert = users.find(u => u.id === expertId && u.type === 'expert');
        }
        
        if (!expert) {
            console.error("Expert not found:", expertId);
            return;
        }
        
        // Store the expert ID for other components to use
        localStorage.setItem('currentExpertView', expertId);
        
        // Navigate to expert profile view
        navigateTo('expert-profile');
        
        // Call loadExpertProfile function if available
        if (typeof loadExpertProfile === 'function') {
            loadExpertProfile(expertId);
        }
    } catch (error) {
        console.error("Error viewing expert profile:", error);
    }
}
