/**
 * SecureVault Pro - Enterprise Password Manager
 * Version 3.0.0 - Premium Homepage Edition
 */

class SecureVaultApp {
    constructor() {
        this.currentPage = 'homepage';
        this.passwords = [];
        this.masterPassword = '';
        this.isAuthenticated = false;
        
        // Initialize the app
        this.init();
    }

    init() {
        console.log('🚀 SecureVault Pro initializing...');
        
        // Bind all event listeners
        this.bindEvents();
        
        // Set up smooth scrolling
        this.setupSmoothScrolling();
        
        // Initialize animations
        this.initializeAnimations();
        
        // Check authentication status
        this.checkAuthStatus();
        
        console.log('✅ SecureVault Pro initialized successfully');
    }

    // Page Management
    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;
        }
    }

    showHomepage() {
        this.showPage('homepage');
    }

    showAuthPage() {
        this.showPage('authPage');
    }

    showDashboard() {
        this.showPage('dashboardPage');
        this.loadDashboardContent();
    }

    // Authentication Status Check
    checkAuthStatus() {
        const hasMasterPassword = localStorage.getItem('masterPasswordHash');
        const isAuthenticated = sessionStorage.getItem('authenticated');

        if (hasMasterPassword && isAuthenticated) {
            this.isAuthenticated = true;
            this.masterPassword = sessionStorage.getItem('masterPassword') || '';
            this.loadPasswords();
        }
    }

    // Event Binding
    bindEvents() {
        // Homepage navigation
        document.getElementById('loginBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showAuthPage();
            this.showLoginForm();
        });

        document.getElementById('getStartedBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showAuthPage();
            this.showSignupForm();
        });

        document.getElementById('startFreeTrialBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showAuthPage();
            this.showSignupForm();
        });

        document.getElementById('finalCtaBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showAuthPage();
            this.showSignupForm();
        });

        // Demo buttons
        document.getElementById('watchDemoBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.startDemo();
        });

        // Auth page navigation
        document.getElementById('backToHomeBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showHomepage();
        });

        document.getElementById('showSignupBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSignupForm();
        });

        document.getElementById('showLoginBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });

        // Form submissions
        document.getElementById('masterPasswordForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('createMasterPasswordForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        // Password visibility toggles
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.togglePasswordVisibility(e.target);
            });
        });

        // Password strength monitoring
        document.getElementById('newMasterPassword')?.addEventListener('input', (e) => {
            this.updatePasswordStrength(e.target.value);
        });

        // Biometric login
        document.getElementById('biometricLoginBtn')?.addEventListener('click', () => {
            this.handleBiometricLogin();
        });

        // Mobile menu toggle
        document.getElementById('mobileMenuToggle')?.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Pricing toggle
        document.getElementById('pricingToggle')?.addEventListener('change', (e) => {
            this.togglePricing(e.target.checked);
        });

        // Toast close
        document.getElementById('toastClose')?.addEventListener('click', () => {
            this.hideToast();
        });

        // Smooth scroll for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Auth Form Management
    showLoginForm() {
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById('loginForm')?.classList.add('active');
    }

    showSignupForm() {
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById('signupForm')?.classList.add('active');
    }

    // Authentication Handlers
    handleLogin() {
        const password = document.getElementById('masterPassword')?.value;
        if (!password) {
            this.showToast('Please enter your master password', 'error');
            return;
        }

        const storedHash = localStorage.getItem('masterPasswordHash');
        const hash = this.hashPassword(password);

        if (hash === storedHash) {
            this.masterPassword = password;
            sessionStorage.setItem('authenticated', 'true');
            sessionStorage.setItem('masterPassword', password);
            this.isAuthenticated = true;
            this.loadPasswords();
            this.showDashboard();
            this.showToast('Welcome back! 🎉', 'success');
            
            // Clear form
            document.getElementById('masterPassword').value = '';
        } else {
            this.showToast('Incorrect master password', 'error');
            this.addShakeAnimation(document.getElementById('masterPasswordForm'));
        }
    }

    handleSignup() {
        const password = document.getElementById('newMasterPassword')?.value;
        const confirmPassword = document.getElementById('confirmMasterPassword')?.value;

        if (!password || !confirmPassword) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showToast('Passwords do not match', 'error');
            return;
        }

        const strength = this.calculatePasswordStrength(password);
        if (strength.score < 3) {
            this.showToast('Please choose a stronger password', 'error');
            return;
        }

        // Create account
        const hash = this.hashPassword(password);
        localStorage.setItem('masterPasswordHash', hash);
        this.masterPassword = password;
        sessionStorage.setItem('authenticated', 'true');
        sessionStorage.setItem('masterPassword', password);
        this.isAuthenticated = true;
        
        this.showDashboard();
        this.showToast('Your secure vault has been created! 🔐', 'success');
        
        // Clear forms
        document.getElementById('newMasterPassword').value = '';
        document.getElementById('confirmMasterPassword').value = '';
    }

    handleBiometricLogin() {
        if (!('credentials' in navigator)) {
            this.showToast('Biometric authentication not supported on this device', 'error');
            return;
        }

        this.showToast('Biometric authentication coming soon! 👆', 'info');
    }

    // Password Utilities
    hashPassword(password) {
        // Simple hash function for demo (use proper hashing in production)
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    calculatePasswordStrength(password) {
        let score = 0;
        let feedback = 'Enter password';

        if (!password) return { score: 0, feedback };

        // Length checks
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;

        // Character variety
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        // Common patterns penalty
        if (/(.)\1{2,}/.test(password)) score -= 1;
        if (/123|abc|qwerty|password/i.test(password)) score -= 1;

        score = Math.max(0, Math.min(4, score));

        if (score === 0) feedback = 'Very Weak';
        else if (score === 1) feedback = 'Weak';
        else if (score === 2) feedback = 'Fair';
        else if (score === 3) feedback = 'Good';
        else feedback = 'Strong';

        return { score, feedback };
    }

    updatePasswordStrength(password) {
        const { score, feedback } = this.calculatePasswordStrength(password);
        const indicator = document.getElementById('strengthIndicator');
        const text = document.getElementById('strengthText');

        if (!indicator || !text) return;

        // Remove existing classes
        indicator.className = 'strength-fill';

        // Add new class based on score
        if (score >= 1) indicator.classList.add('weak');
        if (score >= 2) indicator.classList.add('fair');
        if (score >= 3) indicator.classList.add('good');
        if (score >= 4) indicator.classList.add('strong');

        text.textContent = feedback;
    }

    togglePasswordVisibility(button) {
        const input = button.closest('.password-input')?.querySelector('input');
        const icon = button.querySelector('i');

        if (!input || !icon) return;

        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    // Password Management (Basic)
    loadPasswords() {
        try {
            const encrypted = localStorage.getItem('passwordVault');
            if (encrypted && this.masterPassword) {
                // Simple decryption for demo
                this.passwords = JSON.parse(atob(encrypted)) || [];
            }
        } catch (error) {
            console.error('Failed to load passwords:', error);
            this.passwords = [];
        }
    }

    savePasswords() {
        try {
            if (this.masterPassword) {
                // Simple encryption for demo
                const encrypted = btoa(JSON.stringify(this.passwords));
                localStorage.setItem('passwordVault', encrypted);
            }
        } catch (error) {
            console.error('Failed to save passwords:', error);
        }
    }

    // Dashboard Content Loading
    loadDashboardContent() {
        const dashboardPage = document.getElementById('dashboardPage');
        if (!dashboardPage) return;

        // Create basic dashboard HTML
        dashboardPage.innerHTML = `
            <div class="dashboard-container">
                <header class="dashboard-header">
                    <div class="header-brand">
                        <div class="brand-logo">
                            <i class="fas fa-shield-alt"></i>
                            <span class="brand-name">SecureVault<span class="brand-pro">Pro</span></span>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button id="addPasswordBtn" class="btn-primary">
                            <i class="fas fa-plus"></i>
                            Add Password
                        </button>
                        <button id="logoutBtn" class="btn-secondary">
                            <i class="fas fa-sign-out-alt"></i>
                            Logout
                        </button>
                    </div>
                </header>
                
                <main class="dashboard-main">
                    <div class="dashboard-stats">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-key"></i>
                            </div>
                            <div class="stat-info">
                                <h3>${this.passwords.length}</h3>
                                <p>Total Passwords</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-shield-check"></i>
                            </div>
                            <div class="stat-info">
                                <h3>100%</h3>
                                <p>Security Score</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div class="stat-info">
                                <h3>0</h3>
                                <p>Compromised</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dashboard-content">
                        <div class="welcome-card">
                            <h2>Welcome to SecureVault Pro! 🚀</h2>
                            <p>Your enterprise-grade password manager is ready. Start by adding your first password or explore the advanced security features.</p>
                            <div class="welcome-actions">
                                <button class="btn-primary">
                                    <i class="fas fa-plus"></i>
                                    Add Your First Password
                                </button>
                                <button class="btn-secondary">
                                    <i class="fas fa-chart-line"></i>
                                    View Security Dashboard
                                </button>
                            </div>
                        </div>
                        
                        <div class="feature-highlights">
                            <h3>Available Features</h3>
                            <div class="features-grid">
                                <div class="feature-item">
                                    <i class="fas fa-fingerprint"></i>
                                    <h4>Biometric Authentication</h4>
                                    <p>Unlock with fingerprint or Face ID</p>
                                </div>
                                <div class="feature-item">
                                    <i class="fas fa-shield-virus"></i>
                                    <h4>Breach Monitoring</h4>
                                    <p>Real-time password breach detection</p>
                                </div>
                                <div class="feature-item">
                                    <i class="fas fa-random"></i>
                                    <h4>Password Generator</h4>
                                    <p>Create strong, unique passwords</p>
                                </div>
                                <div class="feature-item">
                                    <i class="fas fa-users"></i>
                                    <h4>Team Sharing</h4>
                                    <p>Secure password sharing for teams</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;

        // Add dashboard-specific styles
        this.addDashboardStyles();
        
        // Bind dashboard events
        this.bindDashboardEvents();
    }

    bindDashboardEvents() {
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.logout();
        });

        document.getElementById('addPasswordBtn')?.addEventListener('click', () => {
            this.showToast('Password management coming soon! 🔐', 'info');
        });
    }

    logout() {
        sessionStorage.clear();
        this.isAuthenticated = false;
        this.masterPassword = '';
        this.passwords = [];
        this.showHomepage();
        this.showToast('Logged out successfully', 'info');
    }

    // UI Utilities
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        const toastIcon = document.getElementById('toastIcon');

        if (!toast || !toastMessage || !toastIcon) return;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        toastMessage.textContent = message;
        toastIcon.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i>`;
        toast.className = `toast ${type}`;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    hideToast() {
        document.getElementById('toast')?.classList.remove('show');
    }

    addShakeAnimation(element) {
        if (!element) return;
        
        element.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }

    // Demo functionality
    startDemo() {
        this.showToast('Interactive demo coming soon! 🎬', 'info');
    }

    // Mobile menu
    toggleMobileMenu() {
        const navMenu = document.getElementById('navMenu');
        navMenu?.classList.toggle('active');
    }

    // Pricing toggle
    togglePricing(isYearly) {
        document.querySelectorAll('.amount').forEach(amount => {
            const monthlyPrice = amount.dataset.monthly;
            const yearlyPrice = amount.dataset.yearly;
            
            if (monthlyPrice && yearlyPrice) {
                amount.textContent = isYearly ? yearlyPrice : monthlyPrice;
            }
        });

        document.querySelectorAll('.period').forEach(period => {
            period.textContent = isYearly ? '/year' : '/month';
        });
    }

    // Smooth scrolling setup
    setupSmoothScrolling() {
        // Add smooth scrolling behavior
        document.documentElement.style.scrollBehavior = 'smooth';
    }

    // Initialize animations
    initializeAnimations() {
        // Add intersection observer for animations
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-fadeIn');
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.feature-card, .testimonial-card, .pricing-card').forEach(el => {
                observer.observe(el);
            });
        }
    }

    // Dashboard Styles
    addDashboardStyles() {
        if (document.getElementById('dashboard-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'dashboard-styles';
        styles.textContent = `
            .dashboard-container {
                min-height: 100vh;
                background: var(--gray-50);
            }
            
            .dashboard-header {
                background: var(--white);
                padding: 1rem 2rem;
                border-bottom: 1px solid var(--gray-200);
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: var(--shadow-sm);
            }
            
            .header-actions {
                display: flex;
                gap: 1rem;
            }
            
            .dashboard-main {
                padding: 2rem;
                max-width: 1400px;
                margin: 0 auto;
            }
            
            .dashboard-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }
            
            .stat-card {
                background: var(--white);
                padding: 1.5rem;
                border-radius: var(--radius-xl);
                box-shadow: var(--shadow-md);
                border: 1px solid var(--gray-200);
                display: flex;
                align-items: center;
                gap: 1rem;
                transition: all var(--transition-normal);
            }
            
            .stat-card:hover {
                transform: translateY(-4px);
                box-shadow: var(--shadow-lg);
            }
            
            .stat-icon {
                width: 60px;
                height: 60px;
                border-radius: var(--radius-lg);
                background: var(--gradient-primary);
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--white);
                font-size: 1.5rem;
            }
            
            .stat-info h3 {
                font-size: 2rem;
                font-weight: 800;
                margin: 0;
                color: var(--gray-900);
            }
            
            .stat-info p {
                margin: 0;
                color: var(--gray-600);
                font-weight: 500;
            }
            
            .welcome-card {
                background: var(--white);
                padding: 2rem;
                border-radius: var(--radius-xl);
                box-shadow: var(--shadow-md);
                border: 1px solid var(--gray-200);
                text-align: center;
                margin-bottom: 2rem;
            }
            
            .welcome-card h2 {
                margin-bottom: 1rem;
                color: var(--gray-900);
            }
            
            .welcome-card p {
                color: var(--gray-600);
                margin-bottom: 2rem;
                max-width: 600px;
                margin-left: auto;
                margin-right: auto;
            }
            
            .welcome-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .feature-highlights {
                background: var(--white);
                padding: 2rem;
                border-radius: var(--radius-xl);
                box-shadow: var(--shadow-md);
                border: 1px solid var(--gray-200);
            }
            
            .feature-highlights h3 {
                margin-bottom: 1.5rem;
                text-align: center;
                color: var(--gray-900);
            }
            
            .features-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;
            }
            
            .feature-item {
                text-align: center;
                padding: 1.5rem;
                border-radius: var(--radius-lg);
                background: var(--gray-50);
                border: 1px solid var(--gray-200);
                transition: all var(--transition-normal);
            }
            
            .feature-item:hover {
                transform: translateY(-4px);
                box-shadow: var(--shadow-md);
            }
            
            .feature-item i {
                font-size: 2rem;
                color: var(--primary);
                margin-bottom: 1rem;
            }
            
            .feature-item h4 {
                margin-bottom: 0.5rem;
                color: var(--gray-900);
            }
            
            .feature-item p {
                color: var(--gray-600);
                font-size: 0.9rem;
                margin: 0;
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// CSS Shake Animation
const shakeCSS = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;

// Add shake animation styles
if (!document.getElementById('shake-styles')) {
    const shakeStyles = document.createElement('style');
    shakeStyles.id = 'shake-styles';
    shakeStyles.textContent = shakeCSS;
    document.head.appendChild(shakeStyles);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.secureVaultApp = new SecureVaultApp();
});

// Export for debugging
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecureVaultApp;
}