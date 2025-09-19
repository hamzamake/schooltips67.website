// admin.js - Secure admin login functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                showError('Please fill in all fields');
                return;
            }
            
            attemptLogin(username, password);
        });
    }
    
    async function attemptLogin(username, password) {
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Logging in...';
        submitButton.disabled = true;
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Successful login - redirect to admin dashboard
                window.location.href = 'admin-dashboard.html';
            } else {
                showError(data.error || 'Login failed');
            }
        } catch (error) {
            showError('Connection error. Please try again.');
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }
    
    function showError(message) {
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            color: #d32f2f;
            margin-bottom: 20px;
            padding: 12px;
            background: #ffebee;
            border: 1px solid #ffcdd2;
            border-radius: 5px;
            font-size: 14px;
        `;
        errorDiv.textContent = message;
        
        const loginContainer = document.querySelector('.login-container');
        const h2 = document.querySelector('h2');
        loginContainer.insertBefore(errorDiv, h2.nextSibling);
        
        // Auto-remove error after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }
});