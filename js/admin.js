// Admin Panel Management
class AdminPanel {
    constructor() {
        this.users = [];
        this.filteredUsers = [];
        this.init();
    }

    async init() {
        await this.loadUsers();
        this.setupEventListeners();
        this.updateStatistics();
    }

    async loadUsers() {
        try {
            const response = await fetch('api/admin.php?action=getUsers');
            const data = await response.json();
            
            if (data.success) {
                this.users = data.users;
                this.filteredUsers = [...this.users];
                this.renderUsers();
                this.updateStatistics();
            } else {
                this.showError('Failed to load users: ' + data.message);
            }
        } catch (error) {
            console.error('Error loading users:', error);
            this.showError('Error loading users');
        }
    }

    setupEventListeners() {
        // Search functionality
        document.getElementById('searchUsers').addEventListener('input', (e) => {
            this.filterUsers(e.target.value);
        });

        // Sort functionality
        document.getElementById('sortUsers').addEventListener('change', (e) => {
            this.sortUsers(e.target.value);
        });

        // Refresh button
        document.getElementById('refreshData').addEventListener('click', () => {
            this.loadUsers();
        });

        // Delete user button
        document.getElementById('deleteUserBtn').addEventListener('click', () => {
            this.deleteUser();
        });
    }

    filterUsers(searchTerm) {
        const term = searchTerm.toLowerCase();
        this.filteredUsers = this.users.filter(user => 
            user.username.toLowerCase().includes(term) ||
            (user.personal && user.personal.name && user.personal.name.toLowerCase().includes(term)) ||
            (user.personal && user.personal.email && user.personal.email.toLowerCase().includes(term))
        );
        this.renderUsers();
    }

    sortUsers(sortBy) {
        this.filteredUsers.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    const nameA = a.personal?.name || a.username;
                    const nameB = b.personal?.name || b.username;
                    return nameA.localeCompare(nameB);
                case 'created':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'last_login':
                    const loginA = a.last_login ? new Date(a.last_login) : new Date(0);
                    const loginB = b.last_login ? new Date(b.last_login) : new Date(0);
                    return loginB - loginA;
                default:
                    return 0;
            }
        });
        this.renderUsers();
    }

    renderUsers() {
        const container = document.getElementById('usersList');
        
        if (this.filteredUsers.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-users fa-3x text-muted mb-3"></i>
                    <p class="text-muted">No users found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredUsers.map(user => this.createUserCard(user)).join('');
    }

    createUserCard(user) {
        const avatar = user.personal?.name ? user.personal.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase();
        const name = user.personal?.name || 'No name set';
        const email = user.personal?.email || 'No email set';
        const createdDate = new Date(user.created_at).toLocaleDateString();
        const lastLogin = user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never';
        
        const experienceCount = user.experience ? user.experience.length : 0;
        const projectCount = user.projects ? 
            (user.projects.electronics?.length || 0) + 
            (user.projects.web?.length || 0) + 
            (user.projects.trainings?.length || 0) : 0;
        const certificateCount = user.certificates ? user.certificates.length : 0;

        return `
            <div class="user-card">
                <div class="row align-items-center">
                    <div class="col-md-1">
                        <div class="user-avatar">${avatar}</div>
                    </div>
                    <div class="col-md-3">
                        <h6 class="mb-1">${name}</h6>
                        <small class="text-muted">@${user.username}</small>
                    </div>
                    <div class="col-md-2">
                        <small class="text-muted">${email}</small>
                    </div>
                    <div class="col-md-2">
                        <small class="text-muted">Created: ${createdDate}</small><br>
                        <small class="text-muted">Last login: ${lastLogin}</small>
                    </div>
                    <div class="col-md-2">
                        <small class="text-muted">
                            ${experienceCount} exp • ${projectCount} proj • ${certificateCount} cert
                        </small>
                    </div>
                    <div class="col-md-2">
                        <div class="btn-group">
                            <button class="btn btn-sm btn-outline-primary" onclick="admin.viewUser('${user.username}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-success" onclick="admin.viewPortfolio('${user.username}')">
                                <i class="fas fa-external-link-alt"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="admin.confirmDeleteUser('${user.username}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async viewUser(username) {
        try {
            const response = await fetch(`api/admin.php?action=getUser&username=${username}`);
            const data = await response.json();
            
            if (data.success) {
                this.showUserModal(data.user);
            } else {
                this.showError('Failed to load user details: ' + data.message);
            }
        } catch (error) {
            console.error('Error loading user details:', error);
            this.showError('Error loading user details');
        }
    }

    showUserModal(user) {
        const modalBody = document.getElementById('userModalBody');
        const avatar = user.personal?.name ? user.personal.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase();
        
        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-4 text-center">
                    <div class="user-avatar mx-auto mb-3" style="width: 80px; height: 80px; font-size: 2rem;">${avatar}</div>
                    <h5>${user.personal?.name || 'No name set'}</h5>
                    <p class="text-muted">@${user.username}</p>
                </div>
                <div class="col-md-8">
                    <h6>Personal Information</h6>
                    <table class="table table-sm">
                        <tr><td><strong>Email:</strong></td><td>${user.personal?.email || 'Not set'}</td></tr>
                        <tr><td><strong>Phone:</strong></td><td>${user.personal?.phone || 'Not set'}</td></tr>
                        <tr><td><strong>Location:</strong></td><td>${user.personal?.location || 'Not set'}</td></tr>
                        <tr><td><strong>Created:</strong></td><td>${new Date(user.created_at).toLocaleString()}</td></tr>
                        <tr><td><strong>Last Login:</strong></td><td>${user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</td></tr>
                    </table>
                    
                    <h6 class="mt-3">Portfolio Statistics</h6>
                    <div class="row">
                        <div class="col-4">
                            <div class="text-center">
                                <div class="h4 text-primary">${user.experience?.length || 0}</div>
                                <small class="text-muted">Experience</small>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="text-center">
                                <div class="h4 text-success">${(user.projects?.electronics?.length || 0) + (user.projects?.web?.length || 0) + (user.projects?.trainings?.length || 0)}</div>
                                <small class="text-muted">Projects</small>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="text-center">
                                <div class="h4 text-warning">${user.certificates?.length || 0}</div>
                                <small class="text-muted">Certificates</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Store current user for deletion
        document.getElementById('deleteUserBtn').setAttribute('data-username', user.username);
        
        const modal = new bootstrap.Modal(document.getElementById('userModal'));
        modal.show();
    }

    viewPortfolio(username) {
        window.open(`index.html?n=${username}`, '_blank');
    }

    confirmDeleteUser(username) {
        if (confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
            this.currentDeleteUser = username;
            const modal = new bootstrap.Modal(document.getElementById('userModal'));
            modal.show();
        }
    }

    async deleteUser() {
        const username = document.getElementById('deleteUserBtn').getAttribute('data-username');
        
        if (!username) {
            this.showError('No user selected for deletion');
            return;
        }

        try {
            const response = await fetch('api/admin.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'deleteUser',
                    username: username
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.showSuccess(`User "${username}" deleted successfully`);
                bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
                this.loadUsers();
            } else {
                this.showError('Failed to delete user: ' + data.message);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showError('Error deleting user');
        }
    }

    updateStatistics() {
        document.getElementById('totalUsers').textContent = this.users.length;
        
        const activeUsers = this.users.filter(user => {
            if (!user.last_login) return false;
            const lastLogin = new Date(user.last_login);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return lastLogin > thirtyDaysAgo;
        }).length;
        
        document.getElementById('activeUsers').textContent = activeUsers;
        document.getElementById('totalPortfolios').textContent = this.users.length;
        
        // Calculate total files (this would need to be implemented in the backend)
        document.getElementById('totalFiles').textContent = 'N/A';
    }

    showSuccess(message) {
        this.showAlert(message, 'success');
    }

    showError(message) {
        this.showAlert(message, 'danger');
    }

    showAlert(message, type) {
        const alertContainer = document.createElement('div');
        alertContainer.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertContainer.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertContainer.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertContainer);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertContainer.parentNode) {
                alertContainer.remove();
            }
        }, 5000);
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.admin = new AdminPanel();
});
