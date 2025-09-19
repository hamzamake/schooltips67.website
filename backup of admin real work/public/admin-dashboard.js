// admin-dashboard.js - Admin dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    checkAuthentication();
    
    // Load users on page load
    loadUsers();
    
    // Event listeners
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('addUserForm').addEventListener('submit', addUser);
    document.getElementById('editUserForm').addEventListener('submit', editUser);
    document.getElementById('cancelEdit').addEventListener('click', closeEditModal);
    
    async function checkAuthentication() {
        try {
            const response = await fetch('/api/session');
            const data = await response.json();
            
            if (!data.authenticated || data.user.role !== 'admin') {
                window.location.href = 'index.html';
                return;
            }
            
            document.getElementById('welcomeUser').textContent = `Welcome, ${data.user.username}`;
        } catch (error) {
            console.error('Authentication check failed:', error);
            window.location.href = 'index.html';
        }
    }
    
    async function loadUsers() {
        try {
            const response = await fetch('/api/admin/users');
            const users = await response.json();
            
            if (response.ok) {
                displayUsers(users);
            } else {
                showError('Failed to load users');
            }
        } catch (error) {
            console.error('Error loading users:', error);
            showError('Error loading users');
        }
    }
    
    function displayUsers(users) {
        const container = document.getElementById('usersContainer');
        
        if (users.length === 0) {
            container.innerHTML = '<p>No users found.</p>';
            return;
        }
        
        container.innerHTML = users.map(user => `
            <div class="user-card">
                <div class="user-info-card">
                    <h4>${user.username}</h4>
                    <p>Role: <span class="role-badge role-${user.role}">${user.role.toUpperCase()}</span></p>
                    <p>Created: ${new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="user-actions">
                    <button class="btn btn-edit" onclick="openEditModal(${user.id}, '${user.username}', '${user.role}')">Edit</button>
                    <button class="btn btn-delete" onclick="deleteUser(${user.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }
    
    async function addUser(e) {
        e.preventDefault();
        
        const username = document.getElementById('newUsername').value.trim();
        const password = document.getElementById('newPassword').value;
        const role = document.getElementById('newRole').value;
        
        if (!username || !password) {
            showError('Please fill in all fields');
            return;
        }
        
        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, role })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showSuccess('User added successfully');
                document.getElementById('addUserForm').reset();
                loadUsers(); // Refresh the users list
            } else {
                showError(data.error || 'Failed to add user');
            }
        } catch (error) {
            console.error('Error adding user:', error);
            showError('Error adding user');
        }
    }
    
    window.openEditModal = function(id, username, role) {
        document.getElementById('editUserId').value = id;
        document.getElementById('editUsername').value = username;
        document.getElementById('editRole').value = role;
        document.getElementById('editPassword').value = '';
        document.getElementById('editModal').style.display = 'flex';
    };
    
    function closeEditModal() {
        document.getElementById('editModal').style.display = 'none';
    }
    
    async function editUser(e) {
        e.preventDefault();
        
        const id = document.getElementById('editUserId').value;
        const username = document.getElementById('editUsername').value.trim();
        const password = document.getElementById('editPassword').value;
        const role = document.getElementById('editRole').value;
        
        const updateData = { username, role };
        if (password) {
            updateData.password = password;
        }
        
        try {
            const response = await fetch(`/api/admin/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                showSuccess('User updated successfully');
                closeEditModal();
                loadUsers(); // Refresh the users list
            } else {
                showError(data.error || 'Failed to update user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            showError('Error updating user');
        }
    }
    
    window.deleteUser = async function(id) {
        if (!confirm('Are you sure you want to delete this user?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                showSuccess('User deleted successfully');
                loadUsers(); // Refresh the users list
            } else {
                showError(data.error || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            showError('Error deleting user');
        }
    };
    
    async function logout() {
        try {
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = 'index.html';
        }
    }
    
    function showError(message) {
        showNotification(message, 'error');
    }
    
    function showSuccess(message) {
        showNotification(message, 'success');
    }
    
    function showNotification(message, type) {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1001;
            ${type === 'error' ? 'background: #dc3545;' : 'background: #28a745;'}
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
});