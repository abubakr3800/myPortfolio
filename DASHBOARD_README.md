# Portfolio Dashboard System

A comprehensive dashboard-controlled portfolio system that allows users to manage their personal data, images, and portfolio content through a web interface.

## Features

### 🔐 User Authentication
- **Login/Register System**: Users can create accounts with username and password
- **Password Encryption**: Passwords are encrypted using MD5
- **Session Management**: 24-hour session validity with automatic logout
- **Secure Access**: All dashboard features require authentication

### 📊 Dashboard Management
- **Personal Information**: Manage name, location, phone, email, and professional objective
- **Education**: Track degree, institution, and graduation year
- **Experience**: Add, edit, and delete work experience entries
- **Volunteering**: Manage volunteering and leadership roles
- **Skills**: Organize technical, teaching, and language skills
- **Projects**: Categorize projects (Electronics, Web Development, Training)
- **Certificates**: Manage professional certificates and achievements
- **Media Manager**: Upload and organize images and documents

### 🌐 Dynamic Portfolio Display
- **URL-based Access**: View portfolios using `index.html?n=username`
- **Real-time Data**: Portfolio content updates immediately when dashboard changes are saved
- **Responsive Design**: Works on all devices and screen sizes
- **Modern UI**: Beautiful, professional portfolio presentation

### 👨‍💼 Admin Panel
- **User Management**: View all registered users and their statistics
- **User Details**: Detailed view of each user's portfolio data
- **User Deletion**: Remove users and all their associated data
- **Statistics Dashboard**: Overview of system usage and user activity

## File Structure

```
portfolio/
├── index.html              # Main portfolio display page
├── login.html              # User authentication page
├── dashboard.html          # Portfolio management dashboard
├── admin.html              # Admin panel for user management
├── css/
│   ├── style.css          # Main portfolio styles
│   └── dashboard.css      # Dashboard-specific styles
├── js/
│   ├── portfolio.js       # Portfolio display logic
│   ├── auth.js           # Authentication system
│   ├── dashboard.js      # Dashboard management
│   └── admin.js          # Admin panel functionality
├── api/
│   ├── auth.php          # Authentication API
│   ├── data.php          # Data management API
│   ├── upload.php        # File upload API
│   └── admin.php         # Admin panel API
├── data/
│   ├── data.json         # Default portfolio data
│   └── users/            # User-specific data storage
│       └── [username]/
│           ├── data.json # User's portfolio data
│           ├── images/   # Uploaded images
│           └── documents/# Uploaded documents
└── assets/               # Static assets (CSS, JS, images)
```

## How to Use

### 1. User Registration
1. Navigate to `login.html`
2. Click "Don't have an account? Register"
3. Enter username, password, and confirm password
4. Click "Create Account"

### 2. Dashboard Management
1. Login with your credentials
2. Use the sidebar navigation to access different sections:
   - **Personal Info**: Basic information and contact details
   - **Education**: Academic background
   - **Experience**: Work history and achievements
   - **Volunteering**: Leadership and volunteer roles
   - **Skills**: Technical, teaching, and language skills
   - **Projects**: Portfolio projects by category
   - **Certificates**: Professional certifications
   - **Media Manager**: File uploads and management

### 3. Adding Content
- **Experience**: Click "Add Experience" to add work history
- **Projects**: Use category-specific buttons to add projects
- **Certificates**: Click "Add Certificate" to add certifications
- **Skills**: Use the input fields to add skills to each category
- **Media**: Upload images and documents through the Media Manager

### 4. Viewing Portfolio
- **Your Portfolio**: Click "Preview Portfolio" in the dashboard
- **Direct Access**: Use `index.html?n=yourusername`
- **Public Sharing**: Share your portfolio URL with others

### 5. Admin Functions
1. Access the admin panel from the login page
2. View all users and their statistics
3. Click on users to see detailed information
4. Use the delete button to remove users (with confirmation)

## Technical Details

### Authentication System
- **Password Storage**: MD5 encrypted passwords
- **Session Management**: LocalStorage-based sessions
- **Security**: Username validation and input sanitization

### Data Storage
- **User Data**: JSON files stored per username
- **File Organization**: Separate directories for each user
- **Backup**: All data is stored in the `data/users/` directory

### API Endpoints
- `api/auth.php`: User authentication (login/register)
- `api/data.php`: Portfolio data management (get/save)
- `api/upload.php`: File upload handling
- `api/admin.php`: Admin panel functionality

### File Uploads
- **Supported Images**: JPEG, PNG, GIF, WebP
- **Supported Documents**: PDF, DOC, DOCX
- **File Size Limit**: 10MB per file
- **Organization**: Files stored in user-specific directories

## Security Features

1. **Input Validation**: All user inputs are validated and sanitized
2. **File Type Checking**: Only allowed file types can be uploaded
3. **Username Restrictions**: Usernames must contain only letters, numbers, and underscores
4. **Session Timeout**: Automatic logout after 24 hours
5. **Directory Protection**: User data is isolated in separate directories

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Responsive**: Works on tablets and smartphones
- **JavaScript Required**: All functionality requires JavaScript enabled

## Installation

1. Upload all files to your web server
2. Ensure PHP is enabled
3. Set proper file permissions (755 for directories, 644 for files)
4. Access `login.html` to start using the system

## Customization

### Styling
- Modify `css/style.css` for portfolio appearance
- Update `css/dashboard.css` for dashboard styling
- Customize colors, fonts, and layouts as needed

### Functionality
- Extend the dashboard with additional sections
- Add new project categories
- Implement additional file types for uploads
- Customize the admin panel features

## Support

For technical support or feature requests, please refer to the system documentation or contact the development team.

---

**Note**: This system is designed for personal portfolio management and should be used in a secure environment with proper server configuration and regular backups.
