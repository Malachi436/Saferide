# ROSAgo Authentication Flow Guide

## 🔐 How Authentication Works

### For Parents (Self-Registration)

1. **Open App** → User sees Login screen
2. **Tap "Create Parent Account"** → Navigate to ParentSignUpScreen
3. **Fill Registration Form:**
   - Full Name
   - Email
   - Phone Number
   - Password (min 6 characters)
   - Confirm Password
4. **Tap "Create Account"** → Account created
5. **Redirected to Login** → Login with new credentials
6. **Auto-routed to Parent Dashboard**

### For Drivers (Admin-Created Accounts)

1. **Receive credentials from company admin** (via email/SMS)
2. **Open App** → Login screen
3. **Enter email and password**
   - Email MUST contain the word "driver" (e.g., `driver@company.com`, `john.driver@example.com`)
4. **Tap Login** → Auto-routed to Driver Dashboard

## 🎯 Email-Based Role Detection (Mock Logic)

```typescript
// Current mock implementation in LoginScreen.tsx
if (email.toLowerCase().includes("driver")) {
  // Login as Driver
  login(mockDriver);
} else {
  // Login as Parent
  login(mockParent);
}
```

**Production Implementation:**
Replace with actual API call that returns user role from backend:

```typescript
// Future production code
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

const { user, token, role } = await response.json();

// Role is determined by backend, not email pattern
login({ ...user, role }); // role: "parent" | "driver"
```

## 🧪 Testing the Flow

### Test as Parent
```
Email: parent@example.com
Password: password123
→ Routes to Parent Dashboard
```

### Test as Driver
```
Email: driver@company.com
Password: password123
→ Routes to Driver Dashboard
```

### Test Parent Signup
```
1. Tap "Create Parent Account"
2. Enter:
   - Name: John Doe
   - Email: john@example.com
   - Phone: +233 XX XXX XXXX
   - Password: securepass
   - Confirm: securepass
3. Tap "Create Account"
4. Return to login
5. Login with john@example.com
→ Routes to Parent Dashboard
```

## 🔄 Navigation Flow

```
┌─────────────┐
│   App Start │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  hasHydrated?    │ No → Loading Spinner
└──────┬───────────┘
       │ Yes
       ▼
┌──────────────────┐
│ isAuthenticated? │
└──────┬───────────┘
       │
       ├─ No  → ┌─────────────┐
       │        │ LoginScreen │ ←→ ParentSignUpScreen
       │        └─────────────┘
       │
       └─ Yes → ┌──────────────┐
                │ Check Role   │
                └──────┬───────┘
                       │
                       ├─ "parent" → ParentNavigator (Bottom Tabs)
                       │
                       └─ "driver" → DriverNavigator (Stack)
```

## 📝 State Management

### AuthStore (Zustand + AsyncStorage)

```typescript
interface AuthState {
  user: Parent | Driver | null;
  role: "parent" | "driver" | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  login: (user) => void;
  logout: () => void;
}
```

**Persistence:** Auth state is saved to AsyncStorage and persists across app restarts.

## 🚀 Backend Integration Requirements

To replace mock authentication with real backend:

### 1. Login Endpoint
```typescript
POST /api/auth/login
Body: { email: string, password: string }
Response: {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: "parent" | "driver";
    // ... role-specific fields
  },
  token: string; // JWT
}
```

### 2. Parent Registration Endpoint
```typescript
POST /api/auth/register/parent
Body: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}
Response: {
  success: boolean;
  message: string;
}
```

### 3. JWT Token Management
```typescript
// Store token in AuthStore
// Include in all API requests:
headers: {
  'Authorization': `Bearer ${token}`
}
```

### 4. Role Verification
```typescript
// Backend determines role, NOT email pattern
// Example JWT payload:
{
  userId: "123",
  role: "parent", // OR "driver"
  email: "user@example.com"
}
```

## 🔒 Security Notes

1. **Passwords:**
   - Min 6 characters (increase to 8+ in production)
   - Add password strength requirements
   - Hash passwords on backend (bcrypt/argon2)

2. **JWT Tokens:**
   - Short expiration (e.g., 24 hours)
   - Implement refresh tokens
   - Store securely (AsyncStorage encrypted)

3. **Email Verification:**
   - Add email verification step for parent signups
   - Send confirmation link/code

4. **Driver Accounts:**
   - Only company admins can create
   - Driver cannot self-register
   - Admin dashboard (web) manages driver accounts

## ✅ Current Implementation Status

- ✅ Login UI complete
- ✅ Parent signup UI complete
- ✅ Form validation working
- ✅ Role-based routing working
- ✅ State persistence working
- ✅ Mock authentication functional
- 🔄 Backend integration pending (TODO markers in code)

---

**Ready for production after:**
1. Backend API integration
2. Email verification system
3. JWT token management
4. Password security enhancements
