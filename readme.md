# Cloud Migration Assistant - Setup and Testing Guide

## Overview
The application consists of a Python FastAPI backend for code migration and a Next.js frontend with Firebase authentication and Firestore database for chat persistence.

## Architecture

### Backend (Python)
- **Location**: `/backend/`
- **Framework**: FastAPI with Uvicorn
- **Services**: Gemini AI for code migration
- **Endpoints**: 
  - `POST /migrate/file` - Upload ZIP file for migration
  - `POST /migrate/url` - Migrate from Git repository URL
  - `GET /` - Health check

### Frontend (Next.js)
- **Location**: `/frontend/`
- **Framework**: Next.js 16.1.1 with React 19.2.3
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Email/Password)
- **State Management**: Zustand
- **UI Components**: Custom React components with Framer Motion animations


### Database (Firebase)
- **Project**: `migrate-346c7`
- **Collections**:
  - `migration_chats` - User chat sessions
  - `migration_chats/{chatId}/messages` - Messages within each chat

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm 9+
- Git (for repository cloning)

### Backend Setup

1. **Install Python dependencies**:
```bash
cd backend
pip install -r requirements.txt
```

2. **Set environment variables**:
Create a `.env` file in the backend directory:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

3. **Start the server**:
```bash
python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

The server will be available at `http://localhost:8000`

### Frontend Setup

1. **Install dependencies**:
```bash
cd frontend
npm install --legacy-peer-deps
```

2. **Start development server**:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Testing Workflow

### 1. User Registration & Authentication
1. Navigate to `http://localhost:3000/auth/signup`
2. Enter email and password
3. Confirm password
4. Click "Sign Up"
5. You should be redirected to the home page

### 2. User Login
1. Navigate to `http://localhost:3000/auth/signin`
2. Enter your email and password
3. Click "Sign In"
4. You should see the main chat interface

### 3. Create New Migration
1. Click "Start New Migration" button in the home page
2. A new chat should be created and appear in the sidebar
3. The title will be "Migration - [current date]"

### 4. Upload and Process File
1. In the ChatWindow, you can choose between two migration modes:
   - **📁 Upload ZIP**: Upload a ZIP file containing your code
   - **🔗 GitHub URL**: Paste a GitHub repository URL

#### Via ZIP File
1. Click the "📁 Upload ZIP" tab
2. Click the upload icon or drag a ZIP file into the chat
3. Add a description of the migration (optional)
4. Click the send button
5. The file will be sent to the backend at `http://localhost:8000/migrate/file`
6. Results will display with workspace path and migration report

#### Via GitHub Repository
1. Click the "🔗 GitHub URL" tab
2. Enter the GitHub repository URL (e.g., `https://github.com/user/repo`)
3. Click the send button
4. The backend will clone the repository and process the code
5. Results will display with workspace path and migration report
6. Supported formats:
   - `https://github.com/user/repo`
   - `https://github.com/user/repo.git`
   - Any valid Git repository URL

### 5. View Chat History
1. In the sidebar, you'll see all your previous migrations
2. Click on any chat to view it
3. You can edit the chat title by clicking the edit icon
4. You can delete chats with the trash icon

### 6. End-to-End Test

#### ZIP File Migration
```
1. Sign up with a test account
2. Create a new migration chat
3. Click "📁 Upload ZIP" tab
4. Upload a sample Python project ZIP file
5. Verify migration results display correctly
6. Check that chat appears in history
7. Refresh the page - chat should persist in Firestore
8. Logout and sign back in - previous chats should still be there
```

#### GitHub Repository Migration
```
1. Sign up with a test account
2. Create a new migration chat
3. Click "🔗 GitHub URL" tab
4. Enter a GitHub repository URL (e.g., https://github.com/torvalds/linux)
5. Click send and wait for the repository to be cloned
6. Verify migration results display correctly
7. Check that chat appears in history with the GitHub URL
8. Refresh the page - chat should persist in Firestore
```

#### Test GitHub Migration via Backend
```bash
cd backend
python test_github.py https://github.com/user/repo
```

## File Structure

### Created/Modified Files:

**Frontend Components:**
- `app/page.tsx` - Main home page with Sidebar + ChatWindow layout
- `app/layout.tsx` - Root layout with AuthProvider wrapper
- `app/auth/signup/page.tsx` - User registration page
- `app/auth/signin/page.tsx` - User login page
- `app/components/ChatWindow.tsx` - Main chat interface with file upload
- `app/components/Sidebar.tsx` - Chat history sidebar

**Frontend Services:**
- `lib/firebase.ts` - Firebase SDK initialization
- `lib/auth-context.tsx` - Firebase Auth context provider
- `lib/store.ts` - Zustand store for chat state
- `lib/firestore.ts` - Firestore CRUD operations

**Backend:**
- `server.py` - FastAPI application with CORS enabled
- `main.py` - Migration orchestration logic
- `core/rewriter.py` - Code rewriting with Gemini AI
- `config/settings.py` - Configuration
- `.env` - Environment variables

## Known Issues & Limitations

1. **NextAuth & Prisma Integration**: Project includes NextAuth with Prisma adapter alongside Firebase Auth - currently using Firebase Auth, NextAuth setup available for future use
2. **Lucide React Compatibility**: Using `--legacy-peer-deps` due to React 19 compatibility
3. **Google AI SDK**: Using `google-generativeai` package for Gemini AI integration
4. **CORS**: Backend accepts all origins (`*`) - should be restricted in production
5. **Local Storage**: Firebase persistence requires browserLocalPersistence (enabled)
6. **Storage**: Firebase Storage initialized but not currently used in UI

## Troubleshooting

### Backend Exit Code 1
- The "exit code 1" error when starting uvicorn is not an actual server error
- The server starts successfully and listens on port 8000
- This is a PowerShell pipeline artifact when using filters

### Port Already in Use
- Backend default port: 8000
- Frontend default port: 3000
- If ports are already in use, specify different ports:
  - Backend: `python -m uvicorn server:app --port 8001`
  - Frontend: `npm run dev -- -p 3001`

### GitHub URL Not Working
- Ensure the GitHub repository URL is valid and publicly accessible
- Try both formats: `https://github.com/user/repo` and `https://github.com/user/repo.git`
- Check that Git is installed: `git --version`
- For private repositories, ensure appropriate permissions/credentials
- Check backend console for detailed error messages about the git clone
- Verify backend is running and healthy with the health check endpoint

### Firebase Authentication Not Working
- Verify Firebase project ID is correct: `migrate-346c7`
- Check that Firebase API key is properly set in `lib/firebase.ts`
- Ensure browser has JavaScript enabled
- Check browser console for detailed error messages

### Frontend Not Building
- Run `npm install --legacy-peer-deps` to resolve dependency conflicts
- Clear `.next` folder and `node_modules` then reinstall
- Ensure TypeScript version matches `tsconfig.json`

### File Upload Not Working
- Ensure backend is running on port 8000
- Check that ZIP file is valid and not corrupted
- Verify CORS is enabled in backend
- Check browser console Network tab for request errors

## API Reference

### POST /migrate/file
Upload a ZIP file for migration
- **Content-Type**: multipart/form-data
- **Parameters**: 
  - `file`: ZIP file (required)
  - `include_suggestions`: boolean (optional, default: false)
- **Response**:
```json
{
  "workspace": "/path/to/workspace",
  "report": "Migration report text..."
}
```

### POST /migrate/url
Migrate from a Git repository
- **Content-Type**: application/json
- **Body**:
```json
{
  "source_url": "https://github.com/user/repo",
  "include_suggestions": false
}
```
- **Response**: Same as /migrate/file

## Database Schema

### migration_chats
```
{
  id: string (auto)
  userId: string (Firebase UID)
  title: string
  createdAt: timestamp
  updatedAt: timestamp
  messages: [] (subcollection)
}
```

### migration_chats/{chatId}/messages
```
{
  id: string (auto)
  role: 'user' | 'assistant'
  content: string
  timestamp: timestamp
  file?: {
    name: string
    type: string
    size: number
  }
  migrationResult?: {
    workspace: string
    report: string
  }
}
```

## Backend Dependencies

Key packages installed:
- `google-generativeai` - Gemini AI integration
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `python-dotenv` - Environment configuration
- `GitPython` - Git repository handling
- `python-multipart` - File upload support
- `httpx` - HTTP client library
- `pytest` - Testing framework

## Frontend Dependencies

Key packages installed:
- `next` 16.1.1 - React framework
- `react` 19.2.3 - UI library
- `firebase` - Backend services
- `zustand` - State management
- `framer-motion` - Animations
- `next-auth` - Authentication framework
- `prisma` - Database ORM
- `tailwindcss` - CSS framework
- `adm-zip` - ZIP file handling
- `bcryptjs` - Password hashing
- `uuid` - ID generation

## Performance Notes

- Chat history is loaded on app mount
- Messages are updated in real-time with Framer Motion animations
- File uploads are processed directly by the backend
- Firestore queries are optimized with indexes on userId and updatedAt
- Firebase persistence enabled for offline support

## Next Steps for Production

1. **Authentication**: Decide between Firebase Auth (currently used) or NextAuth integration (available)
2. **Database**: Migrate from Firebase Firestore to self-hosted or cloud database if needed
3. Restrict CORS origins to specific frontend domain
4. Implement proper error boundaries and error handling
5. Add loading states and optimistic updates
6. Implement file size limits and validation
7. Add telemetry and analytics
8. Set up CI/CD pipeline for automated testing
9. Configure Firebase/database security rules for production
10. Add database backups and monitoring
11. Implement rate limiting on API endpoints
