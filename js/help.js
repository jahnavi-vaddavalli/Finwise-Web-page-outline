// Help Center functionality for FinWise platform
document.addEventListener('DOMContentLoaded', () => {
    // Initialize help center
    initHelpCenter();
});

/**
 * Initialize help center functionality
 */
function initHelpCenter() {
    // Set up accordion for FAQ
    setupFaqAccordion();
    
    // Set up help search
    setupHelpSearch();
    
    // Set up category navigation
    setupCategoryNavigation();
    
    // Set up contact support button
    setupContactSupport();
}

/**
 * Set up FAQ accordion functionality
 */
function setupFaqAccordion() {
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        
        header.addEventListener('click', () => {
            // Toggle active class
            const isActive = item.classList.contains('active');
            
            // Close all accordion items first
            accordionItems.forEach(accordionItem => {
                accordionItem.classList.remove('active');
            });
            
            // If the clicked item wasn't active, make it active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

/**
 * Set up help search functionality
 */
function setupHelpSearch() {
    const searchInput = document.getElementById('help-search-input');
    const searchButton = document.getElementById('help-search-btn');
    
    // Search when button is clicked
    searchButton.addEventListener('click', () => {
        searchHelp(searchInput.value.trim());
    });
    
    // Search when Enter key is pressed
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchHelp(searchInput.value.trim());
        }
    });
}

/**
 * Search help center content
 * @param {string} query - Search query
 */
function searchHelp(query) {
    if (!query) return;
    
    // Convert query to lowercase for case-insensitive matching
    const lowercaseQuery = query.toLowerCase();
    
    // Get all FAQ items
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    // Close all accordion items first
    accordionItems.forEach(item => {
        item.classList.remove('active');
        item.classList.remove('highlight');
    });
    
    let matchFound = false;
    
    // Search through FAQ items
    accordionItems.forEach(item => {
        const question = item.querySelector('.accordion-header h4').textContent.toLowerCase();
        const answer = item.querySelector('.accordion-content p').textContent.toLowerCase();
        
        if (question.includes(lowercaseQuery) || answer.includes(lowercaseQuery)) {
            // Open this item if it matches
            item.classList.add('active');
            item.classList.add('highlight');
            matchFound = true;
            
            // Scroll to the first match
            if (!matchFound) {
                item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
    
    if (!matchFound) {
        showHelpSearchNoResults(query);
    }
}

/**
 * Show no results message for help search
 * @param {string} query - Search query
 */
function showHelpSearchNoResults(query) {
    // Check if there's already a no-results message
    let noResultsMsg = document.querySelector('.help-no-results');
    
    if (noResultsMsg) {
        // Update existing message
        noResultsMsg.innerHTML = `
            <p>No results found for "<strong>${query}</strong>".</p>
            <p>Try different keywords or check out our popular FAQ topics below.</p>
        `;
    } else {
        // Create new message
        noResultsMsg = document.createElement('div');
        noResultsMsg.className = 'help-no-results';
        noResultsMsg.innerHTML = `
            <p>No results found for "<strong>${query}</strong>".</p>
            <p>Try different keywords or check out our popular FAQ topics below.</p>
        `;
        
        // Insert after search
        const searchContainer = document.querySelector('.help-search');
        searchContainer.parentNode.insertBefore(noResultsMsg, searchContainer.nextSibling);
    }
    
    // Remove message after 5 seconds
    setTimeout(() => {
        if (noResultsMsg.parentNode) {
            noResultsMsg.parentNode.removeChild(noResultsMsg);
        }
    }, 5000);
}

/**
 * Set up help category navigation
 */
function setupCategoryNavigation() {
    const categoryButtons = document.querySelectorAll('.category-card .btn');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get category
            const category = e.target.closest('.category-card').querySelector('h4').textContent;
            
            // Show relevant content for this category
            showCategoryContent(category);
        });
    });
}

/**
 * Show content for selected help category
 * @param {string} category - Category name
 */
function showCategoryContent(category) {
    // For now, just search for the category in FAQs
    searchHelp(category);
    
    // Future enhancement: Load category-specific content
    // This would typically load content from a database or API
    showNotification(`Browsing "${category}" help articles`, 'success');
}

/**
 * Set up contact support functionality
 */
function setupContactSupport() {
    const contactButton = document.querySelector('.contact-support .btn');
    
    contactButton.addEventListener('click', (e) => {
        e.preventDefault();
        showContactSupportForm();
    });
}

/**
 * Show contact support form
 */
function showContactSupportForm() {
    // Create modal for contact form
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Contact Support</h2>
            <form id="support-form">
                <div class="form-group">
                    <label for="support-name">Your Name</label>
                    <input type="text" id="support-name" required>
                </div>
                <div class="form-group">
                    <label for="support-email">Your Email</label>
                    <input type="email" id="support-email" required>
                </div>
                <div class="form-group">
                    <label for="support-topic">Topic</label>
                    <select id="support-topic" required>
                        <option value="">-- Select Topic --</option>
                        <option value="account">Account Issues</option>
                        <option value="expert">Expert Verification</option>
                        <option value="meeting">Meeting Problems</option>
                        <option value="payment">Billing & Payments</option>
                        <option value="feedback">Feedback & Suggestions</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="support-message">Message</label>
                    <textarea id="support-message" rows="5" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Submit Request</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Pre-fill form if user is logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
        document.getElementById('support-name').value = currentUser.fullname;
        document.getElementById('support-email').value = currentUser.email;
    }
    
    // Close modal when clicked on x
    modal.querySelector('.close').addEventListener('click', () => {
        modal.remove();
    });
    
    // Close modal when clicked outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Handle form submission
    document.getElementById('support-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('support-name').value;
        const email = document.getElementById('support-email').value;
        const topic = document.getElementById('support-topic').value;
        const message = document.getElementById('support-message').value;
        
        // In a real application, this would send the data to a server
        // For this prototype, we'll just show a success message
        
        // Close modal
        modal.remove();
        
        // Show success notification
        showNotification('Your support request has been submitted. We\'ll get back to you soon!', 'success');
    });
}

/**
 * Add sample FAQ content
 * This would typically come from a database or API in a real application
 */
function loadSampleFAQs() {
    const faqContainer = document.getElementById('faq-accordion');
    if (!faqContainer) return;
    
    // Check if FAQs are already loaded
    if (faqContainer.children.length > 0) return;
    
    const sampleFAQs = [
        {
            question: 'How do I schedule a meeting with a financial expert?',
            answer: 'To schedule a meeting with an expert, log in to your account and navigate to the "Explore Experts" section in your dashboard. Browse through available experts, view their profiles, and click on "Schedule a Meeting" with your preferred expert. Select a convenient date and time, specify the topic you\'d like to discuss, and provide any additional details to help the expert prepare for your session.'
        },
        {
            question: 'How are financial experts verified on FinWise?',
            answer: 'We have a rigorous verification process for all experts on our platform. Each expert must provide proof of their credentials, professional certifications, and years of experience in the financial industry. We verify their professional background, check references, and ensure they have the necessary expertise in their claimed specialties. Only after thorough vetting do we approve experts to offer services on our platform.'
        },
        {
            question: 'Is my financial information secure on this platform?',
            answer: 'Yes, we take data security very seriously. All communications between you and financial experts are encrypted and confidential. We never share your personal or financial information with third parties without your explicit consent. Our platform uses industry-standard security protocols to protect your data, and we regularly update our security measures to maintain the highest level of protection.'
        },
        {
            question: 'How can I become a financial expert on FinWise?',
            answer: 'If you\'re a qualified financial professional interested in joining our expert network, you can apply through your user account. Go to your dashboard and select "Become an Expert." You\'ll need to provide details about your credentials, experience, specialties, and professional background. Our team will review your application, verify your information, and contact you regarding the next steps. We look for experts with proven expertise and a commitment to providing quality financial guidance.'
        },
        {
            question: 'What types of financial topics can I get help with?',
            answer: 'FinWise covers a wide range of financial topics including but not limited to: budgeting and saving, debt management, investment strategies, retirement planning, tax optimization, estate planning, insurance needs, credit improvement, and general financial literacy. Our diverse expert network includes specialists in various areas, so you can find guidance tailored to your specific financial needs and goals.'
        }
    ];
    
    sampleFAQs.forEach((faq, index) => {
        const item = document.createElement('div');
        item.className = 'accordion-item';
        if (index === 0) item.classList.add('active');
        
        item.innerHTML = `
            <div class="accordion-header">
                <h4>${faq.question}</h4>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="accordion-content">
                <p>${faq.answer}</p>
            </div>
        `;
        
        faqContainer.appendChild(item);
    });
    
    // Set up accordion functionality for the newly added items
    setupFaqAccordion();
}

/**
 * Add CSS for help center highlights 
 * This adds styling for search results highlighting
 */
function addHelpCenterStyles() {
    // Check if styles already exist
    if (document.getElementById('help-center-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'help-center-styles';
    styleElement.textContent = `
        .accordion-item.highlight .accordion-header {
            background-color: var(--light-color);
        }
        
        .help-no-results {
            background-color: var(--light-gray);
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
        
        .modal {
            display: block;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.5);
        }
        
        .modal-content {
            background-color: var(--white-color);
            margin: 10% auto;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            width: 80%;
            max-width: 600px;
            position: relative;
        }
        
        .close {
            position: absolute;
            right: 20px;
            top: 15px;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
        }
    `;
    
    document.head.appendChild(styleElement);
}

// Call this when the DOM is loaded to add styles
document.addEventListener('DOMContentLoaded', () => {
    addHelpCenterStyles();
});
