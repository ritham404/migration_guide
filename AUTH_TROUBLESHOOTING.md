# Firebase Authentication Troubleshooting

## Error: `auth/invalid-credential`

This error means Firebase rejected the email/password combination. Here's how to debug:

### Step 1: Test Firebase Configuration
1. Start the frontend: `npm run dev`
2. Navigate to: `http://localhost:3000/debug-auth`
3. Click **"Test Sign Up"** with the default email/password
4. Check the result:
   - ✅ **Success**: Firebase is properly configured
   - ❌ **Error**: There's a Firebase configuration issue

### Step 2: If Sign Up Works
If the sign-up test succeeds, you now have a test account. Use those credentials:
1. Go to `http://localhost:3000/auth/signin`
2. Enter the same email and password from the test
3. You should now be able to sign in

### Step 3: If Both Fail
Firebase might be improperly configured. Check:

**1. Firebase Project Status:**
- Ensure project `migrate-346c7` is active
- Check Firebase Console: https://console.firebase.google.com/project/migrate-346c7

**2. Authentication Method:**
- Go to: Authentication → Sign-in method
- Email/Password should be **ENABLED** (green status)
- If disabled, click enable

**3. Firestore Security Rules:**
- Go to: Firestore Database → Rules
- Check if you're in **TEST MODE** (allows all reads/writes)
- If in production mode, ensure rules allow authentication

**4. API Key:**
Verify the API key in `lib/firebase.ts`:
```typescript
apiKey: "AIzaSyCYvx1mVGqftSrTIYam-lF3PTtWKqrweZc"
```

### Step 4: Check Browser Console
1. Open browser DevTools: F12
2. Go to **Console** tab
3. Look for detailed error messages
4. Take a screenshot of any errors

### Step 5: Full Reset (If Still Failing)

Try creating a completely fresh account:
1. Go to debug page: `http://localhost:3000/debug-auth`
2. Change email to something unique: `test-${Date.now()}@example.com`
3. Use password: `123456`
4. Click "Test Sign Up"
5. Once successful, use those credentials to sign in

## Quick Checklist

- [ ] Frontend running on `http://localhost:3000`
- [ ] Backend running on `http://localhost:8000`
- [ ] Visited `/debug-auth` page
- [ ] Tested Sign Up with debug page
- [ ] Created test account successfully
- [ ] Tried signing in with test account credentials
- [ ] Checked Firebase project status (project ID: `migrate-346c7`)
- [ ] Verified Email/Password auth is enabled in Firebase
- [ ] Checked browser console for error details

## Next Steps

Once authentication is working:
1. Create a new migration chat from home page
2. Upload a Python project ZIP file
3. Verify the migration results display correctly
4. Check that chat appears in sidebar history
5. Refresh page - chat should persist
6. Sign out and back in - chats should still be there
