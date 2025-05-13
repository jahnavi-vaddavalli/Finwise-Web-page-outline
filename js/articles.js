// Articles functionality for FinWise platform
document.addEventListener('DOMContentLoaded', () => {
    // Initialize articles
    initArticles();
});

/**
 * Initialize articles functionality
 */
function initArticles() {
    // Set up article loading
    setupArticles();
}

/**
 * Set up articles
 */
function setupArticles() {
    // Load homepage articles
    loadHomePageArticles();
}

/**
 * Load articles for homepage
 */
function loadHomePageArticles() {
    // Get all article cards
    const articleCards = document.querySelectorAll('.article-card');
    
    // Add click event to each article card
    articleCards.forEach(card => {
        card.addEventListener('click', () => {
            const articleId = card.getAttribute('data-id');
            if (articleId) {
                viewArticle(articleId);
            } else {
                // For demo articles that don't have a real ID
                const title = card.querySelector('h3').textContent;
                const summary = card.querySelector('p').textContent;
                const author = card.querySelector('.article-meta').textContent.split('|')[0].trim();
                const date = new Date().toISOString().split('T')[0]; // Today's date
                
                // Create a temporary article object
                const tempArticle = {
                    id: 'temp-' + Math.random().toString(36).substring(2),
                    title: title,
                    author: author,
                    date: date,
                    summary: summary,
                    content: `<p>${summary}</p>
                    <p>This is a sample article content. In a real application, this would contain the full text of the article with proper formatting, images, and other media.</p>
                    <p>The article would discuss various aspects of ${title.toLowerCase()}, providing valuable insights and practical advice for readers interested in this topic.</p>
                    <p>Stay tuned for more detailed articles from our expert financial advisors!</p>`,
                    tags: ['Financial Literacy', 'Education', title.split(' ')[0]],
                    image: card.querySelector('img')?.src || getRandomImageForCategory('investing')
                };
                
                // Store the temp article in localStorage temporarily
                const articles = JSON.parse(localStorage.getItem('articles') || '[]');
                articles.push(tempArticle);
                localStorage.setItem('articles', JSON.stringify(articles));
                
                // View the temporary article
                viewArticle(tempArticle.id);
            }
        });
    });
}

/**
 * Load articles for user dashboard
 */
function loadArticlesForUser() {
    const articlesContainer = document.getElementById('articles-container');
    if (!articlesContainer) return;
    
    // Get all article cards in user dashboard
    const articleCards = articlesContainer.querySelectorAll('.article-card');
    
    // Add click event to each article card
    articleCards.forEach(card => {
        card.addEventListener('click', () => {
            const articleId = card.getAttribute('data-id');
            if (articleId) {
                viewArticle(articleId);
            } else {
                // For demo articles that don't have a real ID
                const title = card.querySelector('h3')?.textContent || 'Financial Article';
                const summary = card.querySelector('p:not(.article-meta)')?.textContent || 'Learn about important financial concepts and strategies.';
                const author = card.querySelector('.article-meta')?.textContent.split('|')[0].trim() || 'Financial Expert';
                const date = new Date().toISOString().split('T')[0]; // Today's date
                
                // Create a temporary article object
                const tempArticle = {
                    id: 'temp-' + Math.random().toString(36).substring(2),
                    title: title,
                    author: author,
                    date: date,
                    summary: summary,
                    content: `<p>${summary}</p>
                    <p>This is a sample article content. In a real application, this would contain the full text of the article with proper formatting, images, and other media.</p>
                    <p>The article would discuss various aspects of ${title.toLowerCase()}, providing valuable insights and practical advice for readers interested in this topic.</p>
                    <p>Stay tuned for more detailed articles from our expert financial advisors!</p>`,
                    tags: ['Financial Literacy', 'Education', title.split(' ')[0]],
                    image: card.querySelector('img')?.src || getRandomImageForCategory('investing')
                };
                
                // Store the temp article in localStorage temporarily
                const articles = JSON.parse(localStorage.getItem('articles') || '[]');
                articles.push(tempArticle);
                localStorage.setItem('articles', JSON.stringify(articles));
                
                // View the temporary article
                viewArticle(tempArticle.id);
            }
        });
    });
    
    // Get articles from localStorage to add new articles if needed
    const articles = JSON.parse(localStorage.getItem('articles') || '[]');
    
    // Sort articles by date (newest first)
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Load articles for expert
 * @param {Object} expert - Expert object
 */
function loadExpertArticles(expert) {
    const articlesContainer = document.getElementById('expert-articles-list');
    
    // Clear container
    articlesContainer.innerHTML = '';
    
    if (!expert.articles || expert.articles.length === 0) {
        // Show empty state
        articlesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-newspaper"></i>
                <p>You haven't published any articles yet.</p>
                <button class="btn btn-small" data-target="create-article">Create Your First Article</button>
            </div>
        `;
        
        // Set up button click
        articlesContainer.querySelector('button').addEventListener('click', () => {
            activateExpertDashboardPanel('create-article');
        });
        
        return;
    }
    
    // Get articles from localStorage
    const allArticles = JSON.parse(localStorage.getItem('articles') || '[]');
    
    // Filter articles by expert
    const expertArticles = allArticles.filter(article => expert.articles.includes(article.id));
    
    // Sort articles by date (newest first)
    expertArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Create article cards
    expertArticles.forEach(article => {
        const articleCard = document.createElement('div');
        articleCard.className = 'article-card';
        articleCard.innerHTML = `
            <div class="article-image">
                <img src="${article.image}" alt="${article.title}">
            </div>
            <div class="article-content">
                <h4>${article.title}</h4>
                <p class="article-meta">Published: ${formatArticleDate(article.date)}</p>
                <p class="article-excerpt">${article.summary}</p>
                <div class="article-actions">
                    <button class="btn btn-small view-article" data-id="${article.id}">View</button>
                    <button class="btn btn-small btn-secondary edit-article" data-id="${article.id}">Edit</button>
                </div>
            </div>
        `;
        
        articlesContainer.appendChild(articleCard);
    });
    
    // Set up view article buttons
    articlesContainer.querySelectorAll('.view-article').forEach(btn => {
        btn.addEventListener('click', function() {
            const articleId = this.getAttribute('data-id');
            viewArticle(articleId);
        });
    });
    
    // Set up edit article buttons
    articlesContainer.querySelectorAll('.edit-article').forEach(btn => {
        btn.addEventListener('click', function() {
            const articleId = this.getAttribute('data-id');
            editArticle(articleId);
        });
    });
}

/**
 * View article
 * @param {string} articleId - Article ID
 */
function viewArticle(articleId) {
    // Get article from localStorage
    const articles = JSON.parse(localStorage.getItem('articles') || '[]');
    const article = articles.find(a => a.id === articleId);
    
    if (!article) {
        showNotification('Article not found', 'error');
        return;
    }
    
    // Create article modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content article-modal">
            <span class="close">&times;</span>
            <div class="article-header">
                <div class="article-image">
                    <img src="${article.image}" alt="${article.title}">
                </div>
                <h2>${article.title}</h2>
                <p class="article-meta">By ${article.author} | ${formatArticleDate(article.date)}</p>
            </div>
            <div class="article-body">
                <p class="article-summary">${article.summary}</p>
                <div class="article-content">${formatContentForDisplay(article.content)}</div>
            </div>
            <div class="article-footer">
                <div class="article-tags">
                    ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="article-share">
                    <p>Share this article:</p>
                    <div class="share-buttons">
                        <button class="share-btn"><i class="fab fa-facebook-f"></i></button>
                        <button class="share-btn"><i class="fab fa-twitter"></i></button>
                        <button class="share-btn"><i class="fab fa-linkedin-in"></i></button>
                        <button class="share-btn"><i class="far fa-envelope"></i></button>
                    </div>
                </div>
            </div>
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
 * Edit article
 * @param {string} articleId - Article ID
 */
function editArticle(articleId) {
    // Get article from localStorage
    const articles = JSON.parse(localStorage.getItem('articles') || '[]');
    const article = articles.find(a => a.id === articleId);
    
    if (!article) {
        showNotification('Article not found', 'error');
        return;
    }
    
    // Navigate to create article and fill form
    activateExpertDashboardPanel('create-article');
    
    document.getElementById('article-title').value = article.title;
    document.getElementById('article-category').value = article.category;
    document.getElementById('article-summary').value = article.summary;
    document.getElementById('article-content').value = article.content;
    document.getElementById('article-tags').value = article.tags.join(', ');
    
    // Add article ID to form for update
    document.getElementById('create-article-form').setAttribute('data-article-id', articleId);
    
    // Change submit button text
    document.querySelector('#create-article-form button[type="submit"]').textContent = 'Update Article';
    
    // Update form submission handler
    document.getElementById('create-article-form').onsubmit = function(e) {
        e.preventDefault();
        updateArticle(articleId);
    };
}

/**
 * Update article
 * @param {string} articleId - Article ID
 */
function updateArticle(articleId) {
    const title = document.getElementById('article-title').value;
    const category = document.getElementById('article-category').value;
    const summary = document.getElementById('article-summary').value;
    const content = document.getElementById('article-content').value;
    const tags = document.getElementById('article-tags').value;
    
    if (!title || !category || !summary || !content) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    // Get articles from localStorage
    const articles = JSON.parse(localStorage.getItem('articles') || '[]');
    const articleIndex = articles.findIndex(a => a.id === articleId);
    
    if (articleIndex === -1) {
        showNotification('Article not found', 'error');
        return;
    }
    
    // Update article
    articles[articleIndex].title = title;
    articles[articleIndex].category = category;
    articles[articleIndex].summary = summary;
    articles[articleIndex].content = content;
    articles[articleIndex].tags = tags ? tags.split(',').map(tag => tag.trim()) : [];
    
    // Save articles to localStorage
    localStorage.setItem('articles', JSON.stringify(articles));
    
    // Reset form
    document.getElementById('article-title').value = '';
    document.getElementById('article-category').value = '';
    document.getElementById('article-summary').value = '';
    document.getElementById('article-content').value = '';
    document.getElementById('article-tags').value = '';
    
    // Reset form submission handler
    document.getElementById('create-article-form').onsubmit = function(e) {
        e.preventDefault();
        createArticle();
    };
    
    // Reset submit button text
    document.querySelector('#create-article-form button[type="submit"]').textContent = 'Publish';
    
    // Navigate to my articles
    activateExpertDashboardPanel('expert-articles');
    
    // Reload articles
    loadExpertArticles(getCurrentUser());
    
    showNotification('Article updated successfully', 'success');
}

/**
 * Format content for display
 * @param {string} content - Raw content
 * @returns {string} - Formatted HTML content
 */
function formatContentForDisplay(content) {
    // Replace newlines with paragraphs
    const paragraphs = content.split('\n\n');
    return paragraphs.map(p => `<p>${p}</p>`).join('');
}

/**
 * Format article date
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
function formatArticleDate(dateString) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const date = new Date(dateString);
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}
