# Session Validation API Endpoint

Add this endpoint to your backend routes to validate sessions:

```javascript
// Add these imports at the top of your authController.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');

// Session Validation Endpoint
export const validateSession = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: "NO_TOKEN", message: "No token provided" }
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user and check if current session token matches
    let user = null;
    
    // Check Admin collection
    user = await Admin.findOne({ 
      _id: decoded.sub,
      currentSessionToken: token,
      isOnline: true 
    }).populate('roleId');
    
    // Check Employee collection if not found in Admin
    if (!user) {
      user = await Employee.findOne({ 
        _id: decoded.sub,
        currentSessionToken: token,
        isOnline: true 
      }).populate('roleId');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: "SESSION_INVALIDATED", message: "Session invalidated by new login" }
      });
    }

    // Session is valid
    return res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        isOnline: user.isOnline,
        sessionIssuedAt: user.sessionIssuedAt
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: { code: "INVALID_TOKEN", message: "Invalid token" }
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { code: "TOKEN_EXPIRED", message: "Token expired" }
      });
    }

    console.error("Session validation error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Internal server error" }
    });
  }
};
```

## Route Registration

Add this route to your backend router:

```javascript
// In your routes file (e.g., auth.js or main router)
router.get('/validate-session', validateSession);
```

## Frontend Integration

The frontend is already configured to:

1. **Check session on app load** - Validates session when user returns to the app
2. **Periodic validation** - Checks session every 30 seconds while user is active
3. **Auto-logout** - Automatically logs out user if session is invalidated
4. **User notification** - Shows alert when session is terminated due to new login

## How It Works

1. **Login**: Backend sets `currentSessionToken` and `isOnline: true` for the user
2. **Validation**: Frontend sends token to `/api/auth/validate-session`
3. **Check**: Backend verifies token matches user's `currentSessionToken`
4. **New Login**: When same user logs in elsewhere, new token overwrites `currentSessionToken`
5. **Invalidation**: Old session validation fails, triggering auto-logout

## Database Schema Updates

Make sure your User/Admin/Employee models have these fields:

```javascript
// Add to your user schema
currentSessionToken: {
  type: String,
  default: null
},
sessionIssuedAt: {
  type: Date,
  default: null
},
isOnline: {
  type: Boolean,
  default: false
},
lastLogin: {
  type: Date,
  default: null
}
```

## 🔧 Backend Fix Required

The error `TypeError: verify is not a function` indicates you need to:

1. **Import JWT library**: Add `const jwt = require('jsonwebtoken');` at the top of your authController.js
2. **Import Models**: Make sure Admin and Employee models are imported
3. **Add Route**: Register the `/validate-session` endpoint in your router

## Example authController.js Structure

```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');

// Your existing login function should already have these imports
// Just add the validateSession function below it
