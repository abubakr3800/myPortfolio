# Deployment Guide - myPortfolio

## 🚀 Deploying to RF.GD

This guide will help you deploy the myPortfolio platform to [RF.GD](http://rf.gd) hosting service.

### 📋 Prerequisites

- RF.GD hosting account
- FTP client (FileZilla, WinSCP, etc.)
- All project files ready for upload

### 📁 File Structure for Upload

```
portfolio/
├── index.html              # Main entry point
├── login.html              # Authentication page
├── dashboard.html          # Portfolio editing interface
├── admin.html              # Admin panel
├── test.html               # Test page
├── css/                    # Stylesheets
│   ├── style.css
│   └── dashboard.css
├── js/                     # JavaScript files
│   ├── portfolio.js
│   ├── dashboard.js
│   ├── auth.js
│   └── config.js
├── api/                    # PHP API endpoints
│   ├── auth.php
│   ├── data.php
│   ├── admin.php
│   └── upload.php
├── data/                   # Data storage
│   ├── data.json
│   └── users/
├── assets/                 # Media files
│   ├── projects/
│   ├── certificates/
│   ├── cv/
│   └── library/
├── vendor/                 # Third-party libraries
└── sendmail.php           # Email functionality
```

### 🔧 Configuration Steps

#### 1. **Update Configuration**
- Update `js/config.js` with your domain:
  ```javascript
  WEBSITE_URL: 'http://oursite.rf.gd',
  DESIGNER_URL: 'http://abubakr.rf.gd/',
  ```

#### 2. **Set File Permissions**
- Ensure `data/` directory is writable (755 or 777)
- Ensure `data/users/` directory is writable
- Ensure `assets/` directory is writable for uploads

#### 3. **Database Setup**
- RF.GD supports PHP and JSON files
- No database setup required (uses JSON storage)

### 📤 Upload Process

1. **Connect to RF.GD via FTP**
   - Host: Your RF.GD FTP server
   - Username: Your RF.GD username
   - Password: Your RF.GD password

2. **Upload Files**
   - Upload all files to your public_html directory
   - Maintain the folder structure
   - Ensure all PHP files are uploaded in binary mode

3. **Set Permissions**
   - Set `data/` directory to 755
   - Set `data/users/` directory to 755
   - Set PHP files to 644

### 🌐 Domain Configuration

#### **Main Website**
- **URL**: `http://oursite.rf.gd`
- **Entry Point**: `index.html`
- **Features**: Welcome page + Portfolio viewing

#### **User Portfolios**
- **Format**: `http://oursite.rf.gd?user=username`
- **Example**: `http://oursite.rf.gd?user=bkr`

#### **Authentication**
- **Login**: `http://oursite.rf.gd/login.html`
- **Dashboard**: `http://oursite.rf.gd/dashboard.html`
- **Admin**: `http://oursite.rf.gd/admin.html`

### 🔒 Security Considerations

1. **File Permissions**
   - Restrict access to sensitive directories
   - Set proper permissions for data files

2. **PHP Configuration**
   - Ensure PHP is enabled
   - Check file upload limits
   - Verify session support

3. **Data Protection**
   - Regular backups of user data
   - Monitor file uploads
   - Validate user inputs

### 📊 Testing After Deployment

1. **Basic Functionality**
   - [ ] Welcome page loads correctly
   - [ ] User registration works
   - [ ] Login system functions
   - [ ] Portfolio creation works

2. **Portfolio Features**
   - [ ] Projects display properly
   - [ ] Images load correctly
   - [ ] Contact form works
   - [ ] File uploads function

3. **User Management**
   - [ ] User data saves correctly
   - [ ] Authentication persists
   - [ ] Dashboard access works
   - [ ] Admin panel functions

### 🐛 Troubleshooting

#### **Common Issues**

1. **Files Not Loading**
   - Check file permissions
   - Verify file paths
   - Ensure all files uploaded

2. **PHP Errors**
   - Check PHP version compatibility
   - Verify PHP extensions
   - Review error logs

3. **Data Not Saving**
   - Check directory permissions
   - Verify JSON file access
   - Test file writing capabilities

#### **Error Logs**
- Check RF.GD error logs
- Monitor PHP error logs
- Review browser console for JavaScript errors

### 📈 Performance Optimization

1. **Image Optimization**
   - Compress images before upload
   - Use appropriate formats (JPEG, PNG, WebP)
   - Implement lazy loading

2. **Code Optimization**
   - Minify CSS and JavaScript
   - Enable GZIP compression
   - Optimize database queries

3. **Caching**
   - Implement browser caching
   - Use CDN for static assets
   - Optimize server response times

### 🔄 Maintenance

#### **Regular Tasks**
- Monitor website performance
- Update user data backups
- Check for security updates
- Review error logs

#### **Updates**
- Test updates on staging environment
- Backup data before updates
- Deploy during low-traffic periods
- Monitor after deployment

### 📞 Support

- **RF.GD Support**: Check RF.GD documentation
- **Technical Issues**: Review error logs
- **Designer Contact**: [Ahmed Mohamed Abubakr](http://abubakr.rf.gd/)

---

## 🎯 Quick Deployment Checklist

- [ ] Upload all files to RF.GD
- [ ] Set proper file permissions
- [ ] Update configuration files
- [ ] Test basic functionality
- [ ] Test user registration
- [ ] Test portfolio creation
- [ ] Test file uploads
- [ ] Verify email functionality
- [ ] Check mobile responsiveness
- [ ] Test all user flows

**Deployment Complete!** 🎉

Your myPortfolio platform is now live at [oursite.rf.gd](http://oursite.rf.gd)
