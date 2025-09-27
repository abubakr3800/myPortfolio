// Authentication System
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExistingSession();
    }

    setupEventListeners() {
        // Form switching
        const switchCheckbox = document.getElementById('switchToRegister');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        switchCheckbox.addEventListener('change', () => {
            if (switchCheckbox.checked) {
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
                switchCheckbox.nextElementSibling.textContent = 'Already have an account? Login';
            } else {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
                switchCheckbox.nextElementSibling.textContent = "Don't have an account? Register";
            }
            this.clearAlerts();
        });

        // Login form submission
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Register form submission
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
    }

    checkExistingSession() {
        const session = localStorage.getItem('portfolio_session');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                if (sessionData.username && sessionData.timestamp) {
                    // Check if session is still valid (24 hours)
                    const now = new Date().getTime();
                    const sessionTime = new Date(sessionData.timestamp).getTime();
                    const hoursDiff = (now - sessionTime) / (1000 * 60 * 60);
                    
                    if (hoursDiff < 24) {
                        // Session is valid, redirect to dashboard
                        window.location.href = 'dashboard.html';
                        return;
                    } else {
                        // Session expired, clear it
                        localStorage.removeItem('portfolio_session');
                    }
                }
            } catch (error) {
                console.error('Error parsing session data:', error);
                localStorage.removeItem('portfolio_session');
            }
        }
    }

    async handleLogin() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!username || !password) {
            this.showAlert('Please fill in all fields', 'danger');
            return;
        }

        this.setLoading('login', true);

        try {
            const response = await fetch('api/auth.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'login',
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (data.success) {
                // Store session
                const sessionData = {
                    username: username,
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem('portfolio_session', JSON.stringify(sessionData));
                
                this.showAlert('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                this.showAlert(data.message || 'Login failed', 'danger');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showAlert('An error occurred. Please try again.', 'danger');
        } finally {
            this.setLoading('login', false);
        }
    }

    async handleRegister() {
        const username = document.getElementById('registerUsername').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!username || !password || !confirmPassword) {
            this.showAlert('Please fill in all fields', 'danger');
            return;
        }

        if (password !== confirmPassword) {
            this.showAlert('Passwords do not match', 'danger');
            return;
        }

        if (password.length < 6) {
            this.showAlert('Password must be at least 6 characters long', 'danger');
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            this.showAlert('Username can only contain letters, numbers, and underscores', 'danger');
            return;
        }

        this.setLoading('register', true);

        try {
            const response = await fetch('api/auth.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'register',
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showAlert('Account created successfully! You can now login.', 'success');
                // Switch to login form
                document.getElementById('switchToRegister').checked = false;
                document.getElementById('switchToRegister').dispatchEvent(new Event('change'));
                // Clear register form
                document.getElementById('registerForm').reset();
            } else {
                this.showAlert(data.message || 'Registration failed', 'danger');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showAlert('An error occurred. Please try again.', 'danger');
        } finally {
            this.setLoading('register', false);
        }
    }

    setLoading(formType, isLoading) {
        const textElement = document.getElementById(`${formType}Text`);
        const loadingElement = document.getElementById(`${formType}Loading`);
        const submitButton = document.querySelector(`#${formType}Form button[type="submit"]`);

        if (isLoading) {
            textElement.style.display = 'none';
            loadingElement.classList.add('show');
            submitButton.disabled = true;
        } else {
            textElement.style.display = 'inline';
            loadingElement.classList.remove('show');
            submitButton.disabled = false;
        }
    }

    showAlert(message, type) {
        const alertContainer = document.getElementById('alert-container');
        const alertId = 'alert-' + Date.now();
        
        const alertHtml = `
            <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        alertContainer.innerHTML = alertHtml;
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const alert = document.getElementById(alertId);
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    }

    clearAlerts() {
        document.getElementById('alert-container').innerHTML = '';
    }

    static logout() {
        localStorage.removeItem('portfolio_session');
        window.location.href = 'login.html';
    }

    static checkAuth() {
        const session = localStorage.getItem('portfolio_session');
        if (!session) {
            window.location.href = 'login.html';
            return null;
        }

        try {
            const sessionData = JSON.parse(session);
            const now = new Date().getTime();
            const sessionTime = new Date(sessionData.timestamp).getTime();
            const hoursDiff = (now - sessionTime) / (1000 * 60 * 60);
            
            if (hoursDiff >= 24) {
                localStorage.removeItem('portfolio_session');
                window.location.href = 'login.html';
                return null;
            }
            
            return sessionData.username;
        } catch (error) {
            localStorage.removeItem('portfolio_session');
            window.location.href = 'login.html';
            return null;
        }
    }
}

// Initialize authentication system
document.addEventListener('DOMContentLoaded', () => {
    new AuthSystem();
});
