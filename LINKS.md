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

---
*Created during deployment on Feb 25, 2026*
