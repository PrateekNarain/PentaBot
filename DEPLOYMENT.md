Frontend Vercel deployment (penta-bot.vercel.app)

1. In the `frontend/` project, ensure `package.json` has a build script (usually `vite build` or `npm run build`).
2. Create a Vercel project, link the GitHub repo `PrateekNarain/PentaBot` and set the root directory to `frontend`.
3. Add Environment Variables (on Vercel project settings -> Environment Variables):
   - `VITE_API_BASE` = `https://penta-bot-backend.vercel.app` (or the backend URL you provision)
4. Deploy. After the build completes, your frontend will be available at `https://penta-bot.vercel.app`.

Backend Vercel deployment (penta-bot-backend.vercel.app)

1. This repo contains a `backend/` folder with an Express server. Vercel Serverless Functions support is limited—recommended options:
   - Deploy the `backend/` as a separate project on Vercel using Vercel's Node.js Serverless Functions (convert your Express app to serverless handlers), OR
   - Deploy the backend on a VM/container or platform (Render, Railway, Heroku) and use that URL as `VITE_API_BASE`.

2. If deploying backend on Vercel as a separate project:
   - In Vercel create a new project and link the repo. Set the Root Directory to `backend`.
   - Configure Build & Output Settings as needed. For a plain Node Express app you may need to use a custom server setup or switch to serverless handlers.

3. Environment Variables (in backend project settings or platform):
   - `DATABASE_URL` or DB connection vars (DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT)
   - `JWT_SECRET` = <your-secret>
   - `FRONTEND_ORIGINS` = `http://localhost:5173,https://penta-bot.vercel.app,https://pentabot-1.onrender.com`

4. CORS: server is configured to accept requests from any origin listed in `FRONTEND_ORIGINS`. The default includes:
   - `http://localhost:5173` (Vite dev server)
   - `https://penta-bot.vercel.app` (frontend on Vercel)
   - `https://pentabot-1.onrender.com` (example deployed backend URL)

   Update `FRONTEND_ORIGINS` on the backend host to allow additional origins if necessary.

Notes & Checklist
- After both deployments, the frontend will call the backend using `VITE_API_BASE`.
- If you can't deploy the Express app as-is to Vercel, deploy the backend on Render/Railway and update `VITE_API_BASE` in the frontend project environment.
- Verify that your `.env` secrets are set in the hosting provider and that the database is reachable from the backend host.

Example env on backend host:
JWT_SECRET=supersecret
DB_HOST=<your-db-host>
DB_USER=<user>
DB_PASS=<password>
DB_NAME=<db>
DB_PORT=5432
FRONTEND_ORIGIN=https://penta-bot.vercel.app

Example env for frontend on Vercel:
VITE_API_BASE=https://penta-bot-backend.vercel.app
*** End Patch