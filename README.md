# PentaBot - Full-Stack LLM Chat Platform

## Frontend Screenshots
### Sign In Page
![Frontend Sign In](https://github.com/PrateekNarain/PentaBot/blob/main/Images/SignIn.png) 

### Sign Up Page
![Frontend Sign Up](https://github.com/PrateekNarain/PentaBot/blob/main/Images/SignUp.png) 
### Chat Interface
![Frontend Chat Interface](https://github.com/PrateekNarain/PentaBot/blob/main/Images/Chat%20Interface.png) 

### Notifications Panel
![Frontend Notifications](https://github.com/PrateekNarain/PentaBot/blob/main/Images/Notification.png)

## Backend Screenshot
### Supabase Messages Table
![Backend Messages Table](https://github.com/PrateekNarain/PentaBot/blob/main/Images/Messages.png) 
## Live Deployment Links
- **Frontend (Vercel)**: [https://your-vercel-frontend-url.vercel.app](https://pentabot.vercel.app/) 
- **Backend (Render)**: [https://your-render-backend-url.onrender.com](https://pentabot-zxzy.onrender.com)

## Project Description
PentaBot is a full-stack LLM-based chat platform built from scratch as per the assignment instructions. It allows authenticated users to chat with an integrated LLM (Google Gemini API), consume credits per usage, belong to organizations, and receive notifications. The platform uses Supabase (PostgreSQL) for storing user credentials and authenticating with username/password (Google OAuth is planned but not yet implemented). Onboarding creates a default organization and assigns the user as Admin. The UI closely matches the provided reference design, with a ChatGPT-style layout including sidebar for chat history, main chat area, and top bar for credits and notifications.

This project lays the foundation for future enhancements, with clean, modular code and production-ready quality.

## Features
- **Authentication & Onboarding**:
  - Username/password sign-up and sign-in, storing credentials securely in Supabase (PostgreSQL).
  - Authentication verifies correct credentials against the database.
  - Google Sign-In (OAuth 2.0) integration planned for federated authentication.
  - On first registration: Automatically creates a default organization and assigns the user as Admin.
  - Redirects to the main chat interface after onboarding.
  - Persists user details, authentication data, and onboarding progress in the database.

- **Application Interface**:
  - ChatGPT-style UI layout matching the reference design.
  - Left Sidebar: Displays chat history and navigation options (Home, Saved, Upgrade to Pro).
  - Main Chat Area: Shows messages between user and AI assistant, with timestamps and avatars.
  - Top Bar: Includes credits counter, notification bell (expandable panel), and user profile with logout.
  - Responsive and visually consistent across devices.
  - Reusable components for modularity.

- **Chat Functionality**:
  - Integrated with Google Gemini API for AI responses.
  - Supports multi-turn conversations with history.
  - Credit deduction per message (deducts from user's credits in database).
  - Displays remaining credits in top bar.
  - Character limit (2000) and loading indicators.

- **Organization Management**:
  - Users belong to organizations, with default creation on signup.
  - Admin role for organization management (rename, invite members via email records in DB).

- **Notifications**:
  - Real-time notifications via expandable panel in top bar.
  - Supports welcome messages and future expansions for global/targeted alerts.

## Tech Stack
### Frontend
- React.js with Vite
- Tailwind CSS for styling
- React Router DOM for routing
- Axios for API requests
- Environment: Node.js

### Backend
- Node.js with Express.js
- Sequelize ORM for PostgreSQL (Supabase)
- JWT and bcryptjs for authentication
- Google Generative AI SDK for LLM integration
- Environment: Node.js

## Prerequisites
- Node.js (v18+)
- npm
- Supabase account for PostgreSQL database
- Google AI Studio account for Gemini API key
- (Optional) Google Developer Console for OAuth credentials

## Installation
1. Clone the repository:
```bash
git clone https://github.com/your-username/pentabot.git
cd pentabot
```
2. Install frontend dependencies:
```bash
cd frontend
npm install
```
3. Install backend dependencies:
```bash
cd ../backend
npm install
```
## Environment Variables
### Frontend `.env` (in `frontend/` folder)
```bash
VITE_API_BASE=https://pentabot.onrender.com  # Backend API URL (change to Render URL in production)
VITE_GEMINI_API_KEY=your_gemini_api_key  # Gemini API key (if direct calls; otherwise backend handles)
```
### Backend `.env` (in `backend/` folder)
```bash
PORT=5000  # Server port
DATABASE_URL=postgresql://[supabase-user]:[supabase-password]@[supabase-host]:[port]/[db-name]  # Supabase connection string
JWT_SECRET=your_jwt_secret  # Secret for JWT tokens
GOOGLE_CLIENT_ID=your_google_client_id  # Google OAuth Client ID (for future integration)
GOOGLE_CLIENT_SECRET=your_google_client_secret  # Google OAuth Client Secret (for future integration)
GEMINI_API_KEY=your_gemini_api_key  # Google Gemini API key
ALLOW_DEBUG = true
DB_SSL=true
FRONTEND_ORIGINS=http://localhost:5173,https://chatbot.vercel.app
NODE_ENV=production
SKIP_DB_SYNC= true
```
## Running Locally
1. Start the backend:
```bash
cd backend
node src/server.js
```
Server runs on `http://localhost:5000`. It connects to Supabase and syncs models.

3. Start the frontend:
```bash
cd frontend
npm run dev
```
App runs on `http://localhost:5173`.

5. Access the app:
- Sign up at `/signup` or sign in at `/signin`.
- Chat at `/chat`.

## Deployment
### Frontend on Vercel
1. Push code to GitHub.
2. Create a Vercel project and link the `frontend` folder.
3. Add env vars in Vercel dashboard (e.g., `VITE_BACKEND_URL` to Render URL).
4. Deploy.

### Backend on Render
1. Push code to GitHub.
2. Create a Web Service on Render, link the `backend` folder.
3. Set build command: `npm install`, start command: `node src/server.js`.
4. Add env vars in Render dashboard (e.g., `DATABASE_URL`, `GEMINI_API_KEY`).
5. Deploy.

## Usage
- **Sign Up**: Create account with username, email, password. Defaults to user role; first user is admin.
- **Sign In**: Authenticate with credentials.
- **Chat**: Send messages to AI; credits deduct per response.
- **Notifications**: View welcome and system alerts in bell panel.
- **Credits**: Track in top bar; messaging restricted if low.

## Contributing
Fork, branch, commit, push, and PR. Ensure code follows modular structure.

## Acknowledgments
Built based on the Full-Stack LLM Chat Platform assignment.
