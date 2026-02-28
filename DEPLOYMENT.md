# ZK Travels Deployment Guide

Your backend and frontend have been specially configured for deployment! Follow these steps to get your site live on the internet.

## 1. Push Code to GitHub
First, make sure all these recent changes are committed to a GitHub repository. Both Render and Vercel will connect to your GitHub repo to deploy automatically.

## 2. Deploy Backend (Render)
1. Go to [Render](https://render.com) and sign in.
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub account and select your `ZK Travels` repository.
4. Render will automatically detect the `render.yaml` file we just created.
5. Click **Apply** or **Create**.
6. Render will start building your Flask app and attach a 1GB Persistent Disk to store your `bookings.db` and `vehicles.json`.
7. Once deployed, Render will give you a live URL (e.g., `https://zk-travels-backend.onrender.com`). **Copy this URL**.

## 3. Deploy Frontend (Vercel)
1. Go to [Vercel](https://vercel.com) and sign in.
2. Click **Add New...** -> **Project**.
3. Import your `ZK Travels` GitHub repository.
4. Note: If your frontend code is inside a `frontend` folder, you might need to set the "Root Directory" to `frontend` during the project setup.
5. Open the **Environment Variables** section.
6. Add a new variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: *Paste the Render URL you copied in step 2.7* (e.g., `https://zk-travels-backend.onrender.com`)
7. Click **Deploy**.

Vercel will build your React app and provide you with a live domain. Your frontend will now securely communicate with your live Render backend!
