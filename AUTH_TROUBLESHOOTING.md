# 🔧 AgriFriend Authentication Troubleshooting Guide

## Quick Diagnosis

If you're experiencing login issues, follow these steps:

### Step 1: Run Debug Script
1. Open your browser (Chrome/Firefox)
2. Go to your AgriFriend app (http://localhost:3000)
3. Press F12 to open Developer Tools
4. Go to Console tab
5. Copy and paste the contents of `test-auth-debug.js` and press Enter
6. Review the test results

### Step 2: Common Issues & Solutions

#### ❌ "Invalid login credentials" Error
**Cause**: User account doesn't exist or wrong password
**Solutions**:
- Try creating a new account first
- Use a real email address (not test@example.com)
- Ensure password is at least 6 characters

#### ❌ "Email not confirmed" Error
**Cause**: Supabase requires email confirmation
**Solutions**:
1. Check your email for confirmation link
2. OR disable email confirmations in Supabase:
   - Go to Supabase Dashboard → Authentication → Settings
   - Turn OFF "Enable email confirmations"
   - Save changes

#### ❌ "user_profiles table does not exist" Error
**Cause**: Database setup not completed
**Solutions**:
1. Go to Supabase Dashboard → SQL Editor
2. Copy entire contents of `supabase-setup.sql`
3. Paste and click "Run"
4. Verify success message appears

#### ❌ "Failed to fetch" or Connection Errors
**Cause**: Wrong Supabase credentials or network issues
**Solutions**:
1. Check `.env` file has correct values:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   VITE_AUTH_MODE=supabase
   ```
2. Restart development server: `npm run dev`
3. Clear browser cache and cookies

#### ❌ "No user logged in" in Modal
**Cause**: Authentication state not updating properly
**Solutions**:
1. Check browser console for error messages
2. Try refreshing the page
3. Clear browser storage:
   - F12 → Application → Storage → Clear site data

### Step 3: Verify Supabase Setup

1. **Check Project Status**:
   - Go to Supabase Dashboard
   - Ensure project is "Active" (not paused)

2. **Verify Authentication Settings**:
   - Go to Authentication → Settings
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/**`

3. **Check Database Tables**:
   - Go to Table Editor
   - Verify `user_profiles` table exists
   - Check if it has the correct columns

### Step 4: Test Authentication Flow

1. **Create New Account**:
   - Use a real email address
   - Use a strong password (8+ characters)
   - Fill all required fields

2. **Check Email** (if confirmations enabled):
   - Look for Supabase confirmation email
   - Click the confirmation link

3. **Try Logging In**:
   - Use the same credentials
   - Check browser console for any errors

### Step 5: Advanced Debugging

If issues persist, check these:

1. **Browser Console Logs**:
   - Look for red error messages
   - Note any 400/500 HTTP errors

2. **Supabase Logs**:
   - Go to Supabase Dashboard → Logs
   - Check for authentication errors

3. **Network Tab**:
   - F12 → Network tab
   - Try logging in and check for failed requests

## Environment Variables Checklist

Your `.env` file should look like this:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://qujtojenvsfbjbwhhjjw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1anRvamVudnNmYmpid2hoamp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NzgwMzYsImV4cCI6MjA4MTM1NDAzNn0.YCht6E4domJ9K9itYPCQ6dfrgnS2MxUvWgsOt2FRedA

# Authentication Mode
VITE_AUTH_MODE=supabase
```

## Quick Test Commands

Run these in your terminal:

```bash
# Restart development server
cd agrifriend
npm run dev

# Check if Supabase is accessible
curl -H "apikey: YOUR_ANON_KEY" https://qujtojenvsfbjbwhhjjw.supabase.co/rest/v1/
```

## Still Having Issues?

1. **Clear Everything**:
   - Clear browser cache and cookies
   - Delete `node_modules` and run `npm install`
   - Restart development server

2. **Check Supabase Status**:
   - Visit [status.supabase.com](https://status.supabase.com)
   - Ensure no ongoing outages

3. **Try Different Browser**:
   - Test in incognito/private mode
   - Try a different browser entirely

4. **Contact Support**:
   - Share the debug script output
   - Include browser console errors
   - Mention your Supabase project URL

---

**✅ Most authentication issues are resolved by running the SQL setup script and ensuring correct environment variables!**