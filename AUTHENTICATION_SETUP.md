# AgriFriend Authentication Setup

## 🔄 Current Status: READY FOR REAL SUPABASE AUTHENTICATION

The application is configured to use **real Supabase authentication**. Follow the setup guide to enable it.

## 🧪 Testing Authentication

### 1. **Create Account (Sign Up)**
- Click "Login / Sign Up" in the navbar
- Fill out the registration form:
  - **Full Name**: Any name (e.g., "John Farmer")
  - **Email**: Any valid email format (e.g., "john@example.com")
  - **Phone**: Any phone number (e.g., "9876543210")
  - **Password**: Any password (e.g., "password123")
- Click "Create Account"
- ✅ Account will be created and you'll be logged in automatically

### 2. **Sign In (Existing Account)**
- Click "Login / Sign Up" in the navbar
- Click "Already have an account? Sign In"
- Use the same email and password you created
- ✅ You'll be logged in successfully

### 3. **Test Protected Routes**
After logging in, you can access:
- Dashboard (`/dashboard`)
- Market Prices (`/market-prices`)
- AI Predictions (`/predictions`)
- Farm Profile (`/farm-profile`)
- All other protected pages

### 4. **Logout**
- Click on your name in the navbar (top-right)
- Click "Logout"
- ✅ You'll be logged out and redirected to the landing page

## 🔧 Mock Authentication Features

✅ **Working Features:**
- User registration with profile data
- Email/password login
- Session persistence (survives page refresh)
- Protected routes
- User profile storage
- Logout functionality

⚠️ **Mock Limitations:**
- Data is stored in browser localStorage (not persistent across devices)
- No real email verification
- No password reset functionality
- No real SMS/OTP verification

## 🚀 Setting Up Real Supabase Authentication

**📋 Follow the complete setup guide**: See `SUPABASE_SETUP_GUIDE.md` for detailed instructions.

**Quick Setup Summary**:

1. **Create Supabase Project** at [supabase.com](https://supabase.com)
2. **Get your credentials** (Project URL + Anon Key)
3. **Update `.env` file** with real credentials
4. **Run SQL setup script** in Supabase SQL Editor
5. **Restart development server**

**⚠️ Important**: The environment variables are already configured to use Supabase mode. You just need to replace the placeholder values with your real credentials.

## 🎯 Current Application URLs

- **Frontend**: http://localhost:3000
- **ML Backend**: http://localhost:8000

The authentication system is now fully functional for development and testing!