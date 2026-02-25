# Aura Focus OS - Deployment Reference

Here are the important links and resources for the production deployment of Aura Focus OS.

## 🚀 Live Application
* **Production App (Frontend):** [https://ai-focus-timer.vercel.app](https://ai-focus-timer.vercel.app)
* **Production API (Backend):** [https://ai-focus-timer.onrender.com](https://ai-focus-timer.onrender.com)

## 💻 Source Code & Hosting
* **GitHub Repository:** [https://github.com/Shahbaz18-netizen/ai-focus-timer](https://github.com/Shahbaz18-netizen/ai-focus-timer)
* **Vercel Dashboard (Frontend Hosting):** [https://vercel.com/shahbazjr2-9308s-projects/ai-focus-timer](https://vercel.com/shahbazjr2-9308s-projects/ai-focus-timer)
* **Render Dashboard (Backend Hosting):** [https://dashboard.render.com/](https://dashboard.render.com/)

## 🔑 Backend Services
* **Supabase Dashboard (Database & Auth):** [https://supabase.com/dashboard/](https://supabase.com/dashboard/)

## 🛠️ Environment Variables Reference
*These are documented for reference. The actual keys are securely stored in Vercel and Render.*

### Frontend (Vercel)
* `NEXT_PUBLIC_SUPABASE_URL`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`
* `NEXT_PUBLIC_API_URL` (Points to the Render API link above)

### Backend (Render)
* `SUPABASE_URL`
* `SUPABASE_KEY`
* `DATABASE_URL`
* `OPENAI_API_KEY`
* `PYTHON_VERSION` (Set to 3.11.0 due to ChromaDB requirements)

## � Supabase Auth Configuration
If you ever need to set up a new Supabase project or modify authentication, remember these critical settings we changed during deployment:

**1. Authentication > URL Configuration**
*   **Site URL:** `https://ai-focus-timer.vercel.app` (The main production URL)
*   **Redirect URLs:** Add BOTH `http://localhost:3000/**` AND `https://ai-focus-timer.vercel.app/**` so that logging in works on both your local machine and the live site.

**2. Authentication > Providers > Google**
*   **Callback URL (for Google Cloud Console):** Ensure the `Authorized redirect URIs` in your Google Cloud Console matches the exact Supabase callback URL provided in your Supabase dashboard (e.g., `https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback`).

## �💻 Running Locally

If you want to test changes locally before pushing them to production, you need to run both the frontend and backend servers.

**1. Start the Backend API (FastAPI)**
Open a terminal, activate your virtual environment, and run:
`uvicorn app.main:app --reload`
*(This will start the backend on http://localhost:8000)*

**2. Start the Frontend (Next.js)**
Open a second terminal, navigate to the `frontend` folder, and run:
`npm run dev`
*(This will start the frontend on http://localhost:3000)*

> The local frontend is configured in `frontend/.env.local` to talk to `http://localhost:8000/api/v1` automatically when running locally.

---
*Created during deployment on Feb 25, 2026*
