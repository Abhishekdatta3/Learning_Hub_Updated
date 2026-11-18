# Learning Hub

Learning Hub has a React/Vite frontend and a Node.js/Express backend backed by MongoDB.

## Local development

1. Create `backend/.env` from `backend/.env.example` and set `MONGO_URI` and `JWT_SECRET`.
2. Start the backend:

   ```sh
   cd backend
   npm install
   npm run dev
   ```

3. In a separate terminal, start the frontend:

   ```sh
   cd frontend
   npm install
   npm run dev
   ```

The frontend runs at `http://localhost:5173` and proxies `/api` requests to the backend at `http://localhost:5000`.

## Production deployment (Render)

Deploy the backend as a **Web Service** and the frontend as a **Static Site**. Create a MongoDB Atlas database and configure Atlas network access for the backend host before deploying.

### Backend Web Service

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Add these environment variables in the hosting dashboard:
  - `MONGO_URI`: the Atlas connection string
  - `JWT_SECRET`: a long, unique secret
  - `JWT_EXPIRE`: for example, `30d`
  - `FRONTEND_URL`: the exact deployed frontend origin, such as `https://learning-hub.onrender.com`
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` if uploads are used
  - `EMAIL_USER` and `EMAIL_PASS` if email is used

The host provides `PORT`; do not commit credentials or deploy a local `.env` file.

### Frontend Static Site

- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Set `VITE_API_URL` to the backend's public origin, such as `https://learning-hub-api.onrender.com`, with no trailing slash.
- Add a rewrite rule from `/*` to `/index.html` so client-side routes work when refreshed.

`VITE_API_URL` is used at build time. Rebuild the static site after changing it. The backend's `FRONTEND_URL` must match the frontend's actual origin for API and Socket.IO CORS.

## Environment files

`backend/.env.example` and `frontend/.env.example` are templates only. Copy the backend template to `backend/.env` for local work; the root `.gitignore` excludes `.env` files.
