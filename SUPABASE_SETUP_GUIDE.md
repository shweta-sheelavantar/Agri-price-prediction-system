# 🚀 AgriFriend Supabase Authentication Setup Guide

## Overview
This guide will help you set up real Supabase authentication for the AgriFriend platform, replacing the current mock authentication system.

## Prerequisites
- A GitHub account (for Supabase signup)
- Access to the AgriFriend project files

## Step-by-Step Setup

### 1. Create Supabase Project

1. **Visit [supabase.com](https://supabase.com)**
2. **Sign up/Sign in** using your GitHub account
3. **Click "New Project"**
4. **Fill in project details**:
   - **Organization**: Select or create one
   - **Project Name**: `agrifriend-platform`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
5. **Click "Create new project"**
6. **Wait 1-2 minutes** for project initialization

### 2. Get Your Credentials

1. **Go to Project Settings** (gear icon in sidebar)
2. **Click "API" tab**
3. **Copy these values**:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon public key**: Long string starting with `eyJhbGciOiJIUzI1NiIs...`

### 3. Update Environment Variables

1. **Open `agrifriend/.env` file**
2. **Replace the placeholder values**:
   ```env
   # Replace these with your actual Supabase credentials:
   VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
   
   # Change auth mode to use real Supabase
   VITE_AUTH_MODE=supabase
   ```

### 4. Set Up Database Tables

1. **Go to your Supabase dashboard**
2. **Click "SQL Editor" in the sidebar**
3. **Click "New query"**
4. **Copy and paste the entire contents** of `agrifriend/supabase-setup.sql`
5. **Click "Run"** to execute the script
6. **Verify success**: You should see "Success. No rows returned" message

### 5. Configure Authentication Settings

1. **Go to Authentication** → **Settings** in Supabase dashboard
2. **Site URL**: Set to `http://localhost:3000` (for development)
3. **Redirect URLs**: Add `http://localhost:3000/**`
4. **Email Templates** (optional): Customize signup/reset emails
5. **Enable Email Confirmations**: 
   - For production: Enable
   - For development: You can disable for easier testing

### 6. Test the Setup

1. **Restart your development server**:
   ```bash
   cd agrifriend
   npm run dev
   ```

2. **Test Registration**:
   - Go to http://localhost:3000
   - Click "Login / Sign Up"
   - Try creating a new account
   - Check your email for confirmation (if enabled)

3. **Test Login**:
   - Use the account you just created
   - Verify you can access protected pages

4. **Verify Database**:
   - Go to Supabase → **Table Editor**
   - Check `user_profiles` table for your data

## 🔧 Troubleshooting

### Common Issues:

**1. "Failed to fetch" errors**
- Check your VITE_SUPABASE_URL is correct
- Ensure no trailing slashes in the URL

**2. "Invalid API key" errors**
- Verify VITE_SUPABASE_ANON_KEY is the anon (public) key, not service key
- Check for any extra spaces or characters

**3. "Row Level Security" errors**
- Ensure you ran the complete SQL setup script
- Check that RLS policies were created correctly

**4. Profile not created automatically**
- Verify the trigger function was created
- Check Supabase logs for any errors

### Verification Checklist:

- [ ] Supabase project created successfully
- [ ] Environment variables updated with real credentials
- [ ] SQL setup script executed without errors
- [ ] Authentication settings configured
- [ ] Development server restarted
- [ ] Test registration works
- [ ] Test login works
- [ ] User profile data appears in database

## 🎯 Production Deployment

For production deployment:

1. **Update Site URL** in Supabase to your production domain
2. **Add production redirect URLs**
3. **Enable email confirmations**
4. **Set up custom email templates**
5. **Configure proper CORS settings**
6. **Update environment variables** in your hosting platform

## 📞 Support

If you encounter issues:

1. **Check Supabase logs**: Dashboard → Logs
2. **Verify network connectivity**: Can you access supabase.com?
3. **Test with curl**: 
   ```bash
   curl -H "apikey: YOUR_ANON_KEY" https://your-project.supabase.co/rest/v1/
   ```

## 🔐 Security Notes

- **Never commit** real Supabase keys to version control
- **Use environment variables** for all sensitive data
- **Enable Row Level Security** (already done in setup script)
- **Regularly rotate** your service keys (not anon key)
- **Monitor usage** in Supabase dashboard

---

**✅ Once completed, your AgriFriend platform will have production-ready authentication with real user accounts, email verification, and secure data storage!**