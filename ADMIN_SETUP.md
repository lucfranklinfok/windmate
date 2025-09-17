# Admin Panel Setup Guide

## Overview
WindMate includes a powerful admin panel for managing user feedback. Access is controlled via URL parameters and environment variables for security.

## Admin Access Methods

### 🔧 Development Access
```
http://localhost:3002?admin=true
```
- **No security key required** in development mode
- Perfect for testing and development

### 🔒 Production Access
```
https://yourapp.com?key=your_secret_admin_key
```
- **Requires matching environment variable**
- URL parameter is automatically cleared for security
- Admin key must match `REACT_APP_ADMIN_KEY`

## Environment Variable Setup

### Development (.env)
```bash
# Admin panel access key for development
REACT_APP_ADMIN_KEY=dev_admin_123
```

### Production Environment Variables
Set the following environment variable in your production hosting platform:

#### Vercel
```bash
REACT_APP_ADMIN_KEY=wx2024_admin_$ecure!Key_987
```

#### Netlify
```bash
REACT_APP_ADMIN_KEY=wx2024_admin_$ecure!Key_987
```

#### Heroku
```bash
heroku config:set REACT_APP_ADMIN_KEY=wx2024_admin_$ecure!Key_987
```

#### AWS Amplify
Add to environment variables in the console:
```
REACT_APP_ADMIN_KEY = wx2024_admin_$ecure!Key_987
```

## Security Best Practices

### 🔐 Admin Key Requirements
- **Minimum 20 characters**
- **Mix of letters, numbers, and symbols**
- **No dictionary words**
- **Unique for each deployment**

### ✅ Good Admin Key Examples
```
wx2024_admin_$ecure!Key_987
WindMate_2024_Admin_9x8z7y
FeedbackAdmin_2024_Secure_Key_789!
```

### ❌ Bad Admin Key Examples
```
admin123
password
weatherapp
dev_admin_123  (only for development!)
```

### 🛡️ Additional Security Measures
1. **Change default key** immediately after setup
2. **Use different keys** for staging and production
3. **Regularly rotate keys** (monthly recommended)
4. **Never commit keys** to version control
5. **Share keys securely** (password managers, encrypted channels)

## Admin Panel Features

### 📊 Analytics Dashboard
- Total feedback count
- Average rating with stars
- Bug reports counter
- Feature requests counter

### 🔍 Feedback Management
- **Filter by category**: All, General, Bug Reports, Feature Requests
- **Sort options**: Newest First, Oldest First, Highest Rating
- **Search and filter** through feedback
- **Individual item deletion**

### 📤 Data Export
- **JSON export** of all feedback data
- **Timestamp included** for each entry
- **User agent and URL tracking**
- **Bulk data management**

### 🗑️ Data Management
- **Clear all feedback** with confirmation
- **Refresh data** from localStorage
- **Real-time updates**

## Production Deployment Checklist

### Before Deployment
- [ ] Generate secure admin key (20+ characters)
- [ ] Set `REACT_APP_ADMIN_KEY` environment variable
- [ ] Test admin access in staging environment
- [ ] Verify environment variable is not committed to git

### After Deployment
- [ ] Test production admin access: `https://yourapp.com?key=your_admin_key`
- [ ] Verify URL parameter is cleared after access
- [ ] Test feedback submission and admin viewing
- [ ] Document admin key in secure location

### Regular Maintenance
- [ ] Monitor feedback for actionable insights
- [ ] Export feedback data regularly
- [ ] Rotate admin keys monthly
- [ ] Review access logs if available

## Troubleshooting

### Admin Panel Won't Open
1. **Check environment variable** is set correctly
2. **Verify key format** matches exactly (case-sensitive)
3. **Clear browser cache** and try again
4. **Check browser console** for error messages

### Environment Variable Not Working
1. **Restart development server** after adding to .env
2. **Verify variable name** starts with `REACT_APP_`
3. **Check deployment platform** environment variable settings
4. **Ensure no trailing spaces** in the key value

### Production Access Issues
1. **Verify deployment** includes environment variables
2. **Check build logs** for environment variable warnings
3. **Test in incognito/private** browser window
4. **Confirm HTTPS** is being used (not HTTP)

## Contact & Support

For additional setup assistance or security questions, refer to your development team or system administrator.

## Security Notice
This admin panel provides access to user feedback data. Ensure admin keys are kept secure and access is limited to authorized personnel only.