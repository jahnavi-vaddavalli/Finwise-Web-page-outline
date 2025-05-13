// Profile functionality for FinWise platform
document.addEventListener('DOMContentLoaded', () => {
    // Initialize profile
    initProfile();
});

/**
 * Initialize profile functionality
 */
function initProfile() {
    // Set up profile viewing and editing
    setupProfileFunctions();
}

/**
 * Set up profile functions
 */
function setupProfileFunctions() {
    // Set up event listeners for user profile
    document.getElementById('update-profile-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        updateUserProfile();
    });

    // Event listeners for expert profile
    document.getElementById('update-expert-profile-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        updateExpertProfile();
    });

    document.getElementById('update-expert-password-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        updateExpertPassword();
    });

    // Set up navigation to profile section
    document.querySelectorAll('a[href="#my-profile"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showProfileSection();
        });
    });
}

/**
 * Show the appropriate profile section based on user type
 */
function showProfileSection() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        navigateTo('login');
        return;
    }

    if (currentUser.type === 'expert') {
        // Copy expert profile content to profile section
        const expertProfileContent = document.getElementById('expert-expert-profile').innerHTML;
        document.getElementById('my-profile').innerHTML = expertProfileContent;
        
        // Re-initialize event listeners for the copied content
        document.getElementById('update-expert-profile-form')?.addEventListener('submit', function(e) {
            e.preventDefault();
            updateExpertProfile();
        });
        
        document.getElementById('update-expert-password-form')?.addEventListener('submit', function(e) {
            e.preventDefault();
            updateExpertPassword();
        });
    } else {
        // Copy user profile content to profile section
        const userProfileContent = document.getElementById('user-my-profile').innerHTML;
        document.getElementById('my-profile').innerHTML = userProfileContent;
        
        // Re-initialize event listeners for the copied content
        document.getElementById('update-profile-form')?.addEventListener('submit', function(e) {
            e.preventDefault();
            updateUserProfile();
        });
        
        document.getElementById('edit-interests-btn')?.addEventListener('click', function() {
            document.getElementById('interest-tags').classList.add('hidden');
            document.getElementById('edit-interests-form').classList.remove('hidden');
        });
        
        document.getElementById('save-interests-btn')?.addEventListener('click', saveInterests);
        
        document.getElementById('cancel-interests-btn')?.addEventListener('click', function() {
            document.getElementById('interest-tags').classList.remove('hidden');
            document.getElementById('edit-interests-form').classList.add('hidden');
        });
    }

    // Update profile with user data
    updateProfileDisplay(currentUser);
    
    // Navigate to the profile section
    navigateTo('my-profile');
}

/**
 * Update profile display with user data
 * @param {Object} user - User object
 */
function updateProfileDisplay(user) {
    if (user.type === 'expert') {
        // Update expert profile display
        document.getElementById('expert-profile-name').textContent = user.fullname;
        document.getElementById('expert-profile-title').textContent = user.specialty || 'Financial Advisor';
        document.getElementById('expert-profile-email').textContent = user.email;
        
        // Update expert form fields
        document.getElementById('expert-update-name').value = user.fullname;
        document.getElementById('expert-update-title').value = user.specialty || 'Financial Advisor';
        document.getElementById('expert-update-email').value = user.email;
        document.getElementById('expert-update-bio').value = user.bio || '';
        document.getElementById('expert-update-credentials').value = user.credentials || '';

        // Set specialty dropdown
        const specialtyValue = getSpecialtyValue(user.specialty);
        if (specialtyValue) {
            document.getElementById('expert-update-specialty').value = specialtyValue;
        }

        // Set experience dropdown
        const experienceValue = user.experience ? 
            user.experience.toLowerCase().replace(' years', '') : '8-12';
        document.getElementById('expert-update-experience').value = experienceValue;
    } else {
        // Update user profile display
        document.getElementById('profile-name').textContent = user.fullname;
        document.getElementById('profile-email').textContent = user.email;
        document.getElementById('profile-join-date').textContent = `Member since: ${formatDate(user.joinDate)}`;
        
        // Update user form fields
        document.getElementById('update-name').value = user.fullname;
        document.getElementById('update-email').value = user.email;
        
        // Update interest tags
        updateInterestTags(user.interests || []);
    }
}

/**
 * Helper function to format the join date
 * @param {string} dateString - Date string
 * @returns {string} - Formatted date string
 */
function formatProfileDate(dateString) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    const date = new Date(dateString);
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * View expert profile
 * @param {string} expertId - Expert ID
 */
function viewExpertProfile(expertId) {
    // First try to get from experts collection
    let expert = getExpertById(expertId);
    
    // If not found in experts collection, try users collection
    if (!expert) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        expert = users.find(u => u.id === expertId && u.type === 'expert');
    }
    
    if (!expert) {
        showNotification('Expert not found', 'error');
        return;
    }
    
    // Store current expert view in localStorage
    localStorage.setItem('currentExpertView', expertId);

    // Get expert details (handle both expert formats)
    const name = expert.name || expert.fullname;
    const title = expert.title || expert.specialty || 'Financial Advisor';
    const imgSrc = expert.imgSrc || 'https://images.unsplash.com/photo-1542744173-05336fcc7ad4';
    const rating = expert.rating || '4.5';
    const reviewCount = expert.reviewCount || 0;
    const credentials = expert.credentials || 'CFP, CFA';
    const experience = expert.experience || '8+ years';
    const bio = expert.bio || 'No bio provided.';

    // Update expert profile view elements
    document.getElementById('expert-view-img').src = imgSrc;
    document.getElementById('expert-view-name').textContent = name;
    document.getElementById('expert-view-title').textContent = title;
    document.getElementById('expert-view-rating').textContent = rating;
    document.getElementById('expert-view-reviews').textContent = `(${reviewCount} reviews)`;
    document.getElementById('expert-view-credentials').innerHTML = `<strong>Credentials:</strong> ${credentials}`;
    document.getElementById('expert-view-experience').innerHTML = `<strong>Experience:</strong> ${experience}`;
    document.getElementById('expert-view-bio').textContent = bio;
    
    // Add expert ID to schedule and message buttons
    const scheduleBtn = document.getElementById('schedule-with-expert');
    if (scheduleBtn) {
        scheduleBtn.setAttribute('data-expert-id', expertId);
    }
    
    const messageBtn = document.getElementById('message-expert');
    if (messageBtn) {
        messageBtn.setAttribute('data-expert-id', expertId);
    }

    // Update specialties
    const specialtiesContainer = document.getElementById('expert-view-specialties');
    specialtiesContainer.innerHTML = '';
    
    if (expert.specialties && expert.specialties.length > 0) {
        expert.specialties.forEach(specialty => {
            const tag = document.createElement('span');
            tag.className = 'specialty-tag';
            tag.textContent = specialty;
            specialtiesContainer.appendChild(tag);
        });
    } else if (expert.specialty) {
        // If there's no specialties array but there is a specialty field
        const tag = document.createElement('span');
        tag.className = 'specialty-tag';
        tag.textContent = expert.specialty;
        specialtiesContainer.appendChild(tag);
    } else {
        // Default tag if no specialties are available
        const tag = document.createElement('span');
        tag.className = 'specialty-tag';
        tag.textContent = 'Financial Advising';
        specialtiesContainer.appendChild(tag);
    }

    // Load expert's articles
    loadExpertViewArticles(expert);
    
    // Load expert's reviews
    loadExpertReviews(expert);

    // Store current expert ID for scheduling
    localStorage.setItem('currentExpertView', expertId);

    // Navigate to expert profile view
    navigateTo('expert-profile');
}

// Expose the function to the window object so it can be called from other scripts
window.viewExpertProfile = viewExpertProfile;

/**
 * Load expert's articles in the expert profile view
 * @param {Object} expert - Expert object
 */
function loadExpertViewArticles(expert) {
    const articlesContainer = document.getElementById('expert-view-articles');
    articlesContainer.innerHTML = '';
    
    if (!expert.articles || expert.articles.length === 0) {
        articlesContainer.innerHTML = '<p>This expert has not published any articles yet.</p>';
        return;
    }
    
    // Get all articles from localStorage
    const allArticles = JSON.parse(localStorage.getItem('articles') || '[]');
    
    // Filter for this expert's articles
    const expertArticles = allArticles.filter(article => 
        expert.articles.includes(article.id));
    
    // Sort by date (newest first)
    expertArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Display up to 3 most recent articles
    const articlesToShow = expertArticles.slice(0, 3);
    
    articlesToShow.forEach(article => {
        const articleCard = document.createElement('div');
        articleCard.className = 'article-card';
        articleCard.innerHTML = `
            <h4>${article.title}</h4>
            <p class="article-date">${formatArticleDate(article.date)}</p>
            <p class="article-excerpt">${article.summary}</p>
            <a href="#" class="btn btn-small view-article" data-id="${article.id}">Read More</a>
        `;
        
        articlesContainer.appendChild(articleCard);
    });
    
    // Set up view article buttons
    articlesContainer.querySelectorAll('.view-article').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const articleId = this.getAttribute('data-id');
            viewArticle(articleId);
        });
    });
    
    if (articlesToShow.length === 0) {
        articlesContainer.innerHTML = '<p>This expert has not published any articles yet.</p>';
    }
}

/**
 * Load expert's reviews in the expert profile view
 * @param {Object} expert - Expert object
 */
function loadExpertReviews(expert) {
    const reviewsContainer = document.getElementById('expert-view-reviews');
    
    // Using sample reviews for now as we don't have a reviews data structure yet
    // This would normally be populated from a database
    if (!expert.reviews || expert.reviews.length === 0) {
        // If no reviews, leave the sample reviews that are in the HTML
        return;
    }
    
    // If expert has reviews, display them
    reviewsContainer.innerHTML = '';
    
    expert.reviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        reviewCard.innerHTML = `
            <div class="review-header">
                <div class="reviewer-name">${review.reviewerName}</div>
                <div class="review-rating">
                    ${getStarRatingHtml(review.rating)}
                </div>
            </div>
            <p class="review-date">${formatArticleDate(review.date)}</p>
            <p class="review-text">${review.text}</p>
        `;
        
        reviewsContainer.appendChild(reviewCard);
    });
}

/**
 * Get HTML for star rating display
 * @param {number} rating - Rating value (1-5)
 * @returns {string} - HTML for star rating
 */
function getStarRatingHtml(rating) {
    let html = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
        html += '<i class="fas fa-star"></i>';
    }
    
    // Add half star if needed
    if (halfStar) {
        html += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
        html += '<i class="far fa-star"></i>';
    }
    
    return html;
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
