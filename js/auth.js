// Authentication related functions for FinWise platform
document.addEventListener('DOMContentLoaded', () => {
    // Initialize authentication system
    initAuth();
});

/**
 * Initialize authentication system
 */
function initAuth() {
    // Set up login form
    setupLoginForm();
    
    // Set up registration form
    setupRegisterForm();
    
    // Set up logout
    setupLogout();
    
    // Set up authentication links
    setupAuthLinks();
}

/**
 * Set up login form handling
 */
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const accountType = document.querySelector('input[name="login-account-type"]:checked').value;
        
        // Initialize app data if needed (to ensure sample users exist)
        initializeAppDataIfNeeded();
        
        login(email, password, accountType);
    });
}

/**
 * Set up register form handling
 */
function setupRegisterForm() {
    const registerForm = document.getElementById('register-form');
    
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const fullname = document.getElementById('register-fullname').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const accountType = document.querySelector('input[name="register-account-type"]:checked').value;
        
        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }
        
        register(fullname, email, password, accountType);
    });
}

/**
 * Set up logout handling
 */
function setupLogout() {
    // Main header logout button
    const logoutBtn = document.getElementById('logout-btn');
    
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
    
    // Footer logout button
    const footerLogoutBtn = document.querySelector('#footer-logout-btn a');
    if (footerLogoutBtn) {
        footerLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}

/**
 * Set up authentication links
 */
function setupAuthLinks() {
    // Link from login to register
    document.querySelector('a[href="#register"].link-auth').addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('register');
    });
    
    // Link from register to login
    document.querySelector('a[href="#login"].link-auth').addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('login');
    });
    
    // Header nav Login button
    const loginBtn = document.querySelector('#login-btn a');
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('login');
        });
    }
    
    // Header nav Register button
    const registerBtn = document.querySelector('#register-btn a');
    if (registerBtn) {
        registerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('register');
        });
    }
    
    // Footer Login button
    const footerLoginBtn = document.querySelector('#footer-login-btn a');
    if (footerLoginBtn) {
        footerLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('login');
        });
    }
    
    // Footer Register button
    const footerRegisterBtn = document.querySelector('#footer-register-btn a');
    if (footerRegisterBtn) {
        footerRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('register');
        });
    }
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} accountType - Account type (user/expert)
 */
function login(email, password, accountType) {
    // Initialize app data if needed to ensure we have sample users
    initializeAppDataIfNeeded();
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    console.log("Attempting login with:", { email, accountType });
    console.log("Available users:", users);
    
    // Find user with matching credentials
    const user = users.find(u => 
        u.email === email && 
        u.password === password && 
        u.type === accountType
    );
    
    if (user) {
        console.log("User found:", user);
        // Store current user in localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Update UI
        updateHeaderBasedOnAuth(user);
        
        // Navigate to dashboard
        if (user.type === 'expert') {
            console.log("Navigating to expert dashboard");
            // Update the dashboard name display
            const nameElement = document.getElementById('expert-dashboard-name');
            if (nameElement) {
                nameElement.textContent = user.fullname;
            }
            
            // Navigate to expert dashboard
            navigateTo('expert-dashboard');
            
            // Update expert dashboard
            if (typeof updateExpertDashboard === 'function') {
                updateExpertDashboard(user);
            }
        } else {
            console.log("Navigating to user dashboard");
            // Update the dashboard name display
            const nameElement = document.getElementById('user-dashboard-name');
            if (nameElement) {
                nameElement.textContent = user.fullname;
            }
            
            // Navigate to user dashboard
            navigateTo('user-dashboard');
            
            // Update user dashboard
            if (typeof updateUserDashboard === 'function') {
                updateUserDashboard(user);
            }
        }
        
        showNotification('Login successful', 'success');
        return true;
    } else {
        console.log("User not found");
        showNotification('Invalid credentials', 'error');
        return false;
    }
}

/**
 * Register new user
 * @param {string} fullname - User's full name
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} accountType - Account type (user/expert)
 */
function register(fullname, email, password, accountType) {
    // Get existing users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if email already exists
    const emailExists = users.some(user => user.email === email);
    
    if (emailExists) {
        showNotification('Email already registered', 'error');
        return;
    }
    
    // Create user object
    const userId = generateId();
    const user = {
        id: userId,
        fullname,
        email,
        password,
        type: accountType,
        joinDate: new Date().toISOString().split('T')[0],
        interests: accountType === 'user' ? ['Investing', 'Retirement', 'Budgeting'] : [],
        specialty: accountType === 'expert' ? 'Financial Advisor' : '',
        credentials: accountType === 'expert' ? 'CFP, CFA' : '',
        experience: accountType === 'expert' ? '8-12 years' : '',
        bio: accountType === 'expert' 
            ? 'Experienced financial advisor with expertise in personalized investment strategies and retirement planning. My mission is to help clients achieve financial freedom through education and strategic planning.'
            : '',
        articles: [],
        meetings: [],
        messages: [],
        clients: accountType === 'expert' ? [] : null
    };
    
    // Add user to users array
    users.push(user);
    
    // Save users to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // Set current user
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Initialize application data if first time
    initializeAppDataIfNeeded();
    
    // Update UI
    updateHeaderBasedOnAuth(user);
    
    // Navigate to dashboard
    if (accountType === 'expert') {
        // Update the dashboard name display
        document.getElementById('expert-dashboard-name').textContent = user.fullname;
        
        // Navigate to expert dashboard
        navigateTo('expert-dashboard');
        
        // Update expert dashboard with empty state for new expert
        updateExpertDashboard(user);
    } else {
        // Update the dashboard name display
        document.getElementById('user-dashboard-name').textContent = user.fullname;
        
        // Navigate to user dashboard
        navigateTo('user-dashboard');
        
        // Update user dashboard with empty state for new user
        updateUserDashboard(user);
    }
    
    showNotification('Registration successful', 'success');
}

/**
 * Logout user
 */
function logout() {
    // Remove current user from localStorage
    localStorage.removeItem('currentUser');
    
    // Update UI
    updateHeaderBasedOnAuth(null);
    
    // Navigate to home
    navigateTo('home');
    
    showNotification('Logout successful', 'success');
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
 * Initialize application data if needed
 */
function initializeAppDataIfNeeded() {
    // Check if users already exist
    if (!localStorage.getItem('users')) {
        // Create sample users for testing
        const sampleUsers = [
            {
                id: 'user1',
                fullname: 'John Smith',
                email: 'user@example.com',
                password: 'password',
                type: 'user',
                joinDate: '2025-06-01',
                interests: ['Investing', 'Retirement', 'Budgeting'],
                meetings: [],
                messages: []
            },
            {
                id: 'exp1',
                fullname: 'Sarah Johnson',
                email: 'sarah@example.com',
                password: 'password',
                type: 'expert',
                joinDate: '2025-01-15',
                specialty: 'Personal Finance',
                credentials: 'CFP, CFA',
                experience: '10+ years',
                bio: 'I am a Certified Financial Planner with over 10 years of experience helping individuals and families achieve their financial goals. My approach focuses on creating personalized strategies that align with each client\'s unique situation and aspirations. I specialize in budgeting, debt management, and creating sustainable savings plans that help build financial stability.',
                specialties: ['Personal Finance', 'Budgeting', 'Debt Management', 'Financial Education'],
                articles: ['art1'],
                meetings: [],
                messages: [],
                clients: []
            },
            {
                id: 'exp2',
                fullname: 'Michael Chen',
                email: 'michael@example.com',
                password: 'password',
                type: 'expert',
                joinDate: '2025-02-20',
                specialty: 'Investment Advisory',
                credentials: 'CFA, MBA',
                experience: '12+ years',
                bio: 'As a Certified Investment Advisor with extensive experience in market analysis, I help clients build diversified portfolios aligned with their long-term financial goals. My approach combines thorough research with personalized strategy development to navigate market volatility while pursuing consistent growth.',
                specialties: ['Investment Strategy', 'Portfolio Management', 'Market Analysis', 'Wealth Building'],
                articles: ['art2'],
                meetings: [],
                messages: [],
                clients: []
            },
            {
                id: 'exp3',
                fullname: 'David Williams',
                email: 'david@example.com',
                password: 'password',
                type: 'expert',
                joinDate: '2025-03-10',
                specialty: 'Retirement Planning',
                credentials: 'CFP, RMA',
                experience: '8+ years',
                bio: 'I specialize in helping clients prepare for comfortable, financially secure retirements. With over 8 years of experience in retirement planning, I develop comprehensive strategies that consider income needs, tax efficiency, healthcare costs, and estate planning to ensure my clients can enjoy their retirement years with peace of mind.',
                specialties: ['Retirement Planning', 'Estate Planning', 'Tax Strategy', 'Social Security Optimization'],
                articles: ['art3'],
                meetings: [],
                messages: [],
                clients: []
            }
        ];
        
        // Save sample users to localStorage
        localStorage.setItem('users', JSON.stringify(sampleUsers));
    }
    
    // Check if app data already exists
    if (!localStorage.getItem('appDataInitialized')) {
        // Initialize articles
        if (!localStorage.getItem('articles')) {
            const sampleArticles = [
                {
                    id: 'art1',
                    title: '5 Budgeting Strategies for Beginners',
                    author: 'Sarah Johnson',
                    authorId: 'exp1',
                    date: '2025-06-15',
                    category: 'budgeting',
                    summary: 'Learn how to create and stick to a budget that works for your financial goals and lifestyle.',
                    content: 'Creating a budget is one of the most important steps in taking control of your financial life. This article will guide you through effective budgeting strategies that are easy to implement and maintain over time.\n\n1. The 50/30/20 Rule\nThis popular budgeting method suggests allocating 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment. It\'s simple and flexible enough to work for most people.\n\n2. Zero-Based Budgeting\nWith this method, you give every dollar a job, ensuring your income minus expenses equals zero. This doesn\'t mean you spend everything; it means all money is allocated, including to savings and investments.\n\n3. Envelope System\nDivide cash into different envelopes for various spending categories. When an envelope is empty, you\'ve reached your spending limit for that category.\n\n4. Pay Yourself First\nAutomatically direct a portion of your income to savings before budgeting for expenses. This ensures saving is a priority, not an afterthought.\n\n5. Use Budgeting Apps\nTools like Mint, YNAB, or Personal Capital can automate much of the budgeting process and provide insights into your spending habits.\n\nRemember, the best budget is one you can stick to. Start small, be consistent, and adjust as needed.',
                    image: 'https://images.unsplash.com/photo-1631856952982-7db18c2bdca4',
                    tags: ['budgeting', 'beginners', 'financial planning']
                },
                {
                    id: 'art2',
                    title: 'Understanding Investment Risks',
                    author: 'Michael Chen',
                    authorId: 'exp2',
                    date: '2025-07-02',
                    category: 'investing',
                    summary: 'Discover different types of investment risks and strategies to mitigate them.',
                    content: 'Every investment carries some level of risk, and understanding these risks is crucial for making informed investment decisions. This article explores various types of investment risks and how to manage them effectively.\n\nMarket Risk\nAlso known as systematic risk, market risk affects the entire market and cannot be eliminated through diversification. Examples include economic recessions, political instability, or interest rate changes.\n\nInflation Risk\nInflation erodes purchasing power over time. Investments that don\'t outpace inflation will effectively lose value, even if their nominal value increases.\n\nLiquidity Risk\nThis refers to how quickly an investment can be converted to cash without significant loss of value. Real estate and certain types of bonds may be less liquid than stocks.\n\nCredit Risk\nCredit risk is the possibility that a borrower will default on their debt obligations. This is particularly relevant for bond investors.\n\nConcentration Risk\nPutting too much of your portfolio in one investment, sector, or asset class increases concentration risk. Diversification is the primary strategy to mitigate this risk.\n\nRisk Management Strategies\n- Diversification: Spread investments across different asset classes, sectors, and geographic regions\n- Asset Allocation: Adjust the mix of stocks, bonds, and cash based on your risk tolerance and time horizon\n- Dollar-Cost Averaging: Invest regular amounts over time to reduce the impact of market volatility\n- Regular Rebalancing: Periodically adjust your portfolio to maintain your target asset allocation\n\nRemember that risk and return are typically correlated. Higher potential returns usually come with higher risks. The key is to understand your personal risk tolerance and invest accordingly.',
                    image: 'https://images.unsplash.com/photo-1649954174454-767fd0a40fb6',
                    tags: ['investing', 'risk management', 'diversification']
                },
                {
                    id: 'art3',
                    title: 'Retirement Planning in Your 30s',
                    author: 'David Williams',
                    authorId: 'exp3',
                    date: '2025-07-10',
                    category: 'retirement',
                    summary: 'Why starting retirement planning early can make a significant difference in your financial future.',
                    content: 'Your 30s are a critical time for retirement planning. While retirement may seem distant, the power of compound interest makes this decade particularly valuable for building wealth. This article outlines key strategies for effective retirement planning in your 30s.\n\nLeverage Employer-Sponsored Plans\nMaximize contributions to your 401(k) or similar employer-sponsored retirement plan, especially if your employer offers matching contributions. This is essentially free money that can significantly boost your retirement savings.\n\nOpen an IRA\nConsider opening an Individual Retirement Account (IRA) in addition to your employer-sponsored plan. Traditional IRAs offer tax-deductible contributions, while Roth IRAs provide tax-free withdrawals in retirement.\n\nIncrease Savings Rate\nAim to save at least 15% of your income for retirement. If you can\'t reach this immediately, start where you can and increase your savings rate gradually, especially as your income grows.\n\nCreate a Diversified Portfolio\nDevelop an investment strategy that balances growth potential with an appropriate level of risk for your age. In your 30s, you generally have time to weather market volatility and can consider a more aggressive allocation.\n\nAutomate Your Savings\nSet up automatic transfers to your retirement accounts to ensure consistent contributions regardless of other financial demands.\n\nMinimize Debt\nWork to pay down high-interest debt, particularly credit cards and personal loans, which can erode your ability to save for retirement.\n\nThe Power of Starting Early\nIf you begin saving $500 monthly at age 30 with an average annual return of 7%, you could have approximately $1 million by age 65. Waiting until 40 to start the same savings plan would yield about half that amount.\n\nRemember that retirement planning is a marathon, not a sprint. Consistent contributions over time, coupled with a solid investment strategy, will put you on the path to financial security in retirement.',
                    image: 'https://images.unsplash.com/photo-1716878906849-17ed9e9e6186',
                    tags: ['retirement', '30s', 'financial planning', 'investing']
                }
            ];
            
            localStorage.setItem('articles', JSON.stringify(sampleArticles));
        }
        
        // Initialize experts
        if (!localStorage.getItem('experts')) {
            const sampleExperts = [
                {
                    id: 'exp1',
                    name: 'Sarah Johnson',
                    email: 'sarah@example.com',
                    password: 'password',
                    title: 'Personal Finance Specialist',
                    bio: 'I am a Certified Financial Planner with over 10 years of experience helping individuals and families achieve their financial goals. My approach focuses on creating personalized strategies that align with each client\'s unique situation and aspirations. I specialize in budgeting, debt management, and creating sustainable savings plans that help build financial stability.',
                    imgSrc: 'https://images.unsplash.com/photo-1542744173-05336fcc7ad4',
                    rating: '4.5',
                    reviewCount: 28,
                    specialty: 'Personal Finance',
                    credentials: 'CFP, CFA',
                    experience: '10+ years',
                    specialties: ['Personal Finance', 'Budgeting', 'Debt Management', 'Financial Education'],
                    articles: ['art1'],
                    type: 'expert'
                },
                {
                    id: 'exp2',
                    name: 'Michael Chen',
                    email: 'michael@example.com',
                    password: 'password',
                    title: 'Investment Advisor',
                    bio: 'As a Certified Investment Advisor with extensive experience in market analysis, I help clients build diversified portfolios aligned with their long-term financial goals. My approach combines thorough research with personalized strategy development to navigate market volatility while pursuing consistent growth.',
                    imgSrc: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74',
                    rating: '5.0',
                    reviewCount: 42,
                    specialty: 'Investment Advisory',
                    credentials: 'CFA, MBA',
                    experience: '12+ years',
                    specialties: ['Investment Strategy', 'Portfolio Management', 'Market Analysis', 'Wealth Building'],
                    articles: ['art2'],
                    type: 'expert'
                },
                {
                    id: 'exp3',
                    name: 'David Williams',
                    email: 'david@example.com',
                    password: 'password',
                    title: 'Retirement Planning Expert',
                    bio: 'I specialize in helping clients prepare for comfortable, financially secure retirements. With over 8 years of experience in retirement planning, I develop comprehensive strategies that consider income needs, tax efficiency, healthcare costs, and estate planning to ensure my clients can enjoy their retirement years with peace of mind.',
                    imgSrc: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
                    rating: '4.0',
                    reviewCount: 35,
                    specialty: 'Retirement Planning',
                    credentials: 'CFP, RMA',
                    experience: '8+ years',
                    specialties: ['Retirement Planning', 'Estate Planning', 'Tax Strategy', 'Social Security Optimization'],
                    articles: ['art3'],
                    type: 'expert'
                }
            ];
            
            localStorage.setItem('experts', JSON.stringify(sampleExperts));
            
            // Add sample experts to users
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            sampleExperts.forEach(expert => {
                if (!users.some(user => user.email === expert.email)) {
                    users.push(expert);
                }
            });
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        localStorage.setItem('appDataInitialized', 'true');
    }
}
