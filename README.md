# JobDone 🛠️

> **A hyper-local, visual-first Progressive Web App (PWA) designed to connect the unorganized blue-collar workforce with clients through a trust-based reference system.**

## 📖 About the Project

**JobDone** is built to solve a critical real-world problem: the lack of verifiable digital reputation for unorganized blue-collar workers (plumbers, carpenters, electricians, homemakers, daily laborers). 

Currently, hiring in this sector relies heavily on word-of-mouth. JobDone replaces this with a **verified, digital trust network**. Workers build their reputation through visual portfolios of their past work, while clients can hire with confidence by performing real-time reference checks with a worker's past clients.

## 🎯 Target Audience & UX Philosophy

JobDone serves two primary groups, with a UX designed specifically for their needs:

1. **The Worker (Provider):** 
   - **Needs:** Easy access, simple visuals, no complex text typing.
   - **Solution:** A frictionless, **Zero-Text UX**. We use highly recognizable icons, Voice-to-Text APIs, and visual portfolios instead of written resumes.
   
2. **The Client (Seeker):** 
   - **Needs:** Fast solutions, transparency, and proof of quality.
   - **Solution:** Quick job posting with photos, nearby worker discovery, and a "Trust Engine" that allows direct chat with previous clients.

## ✨ Core Features

- **📍 Hyper-Local Matching:** Post a job, and workers within a specific radius (e.g., 5km) receive instant notifications.
- **📸 Visual Portfolios:** Workers showcase completed jobs through a photo grid, serving as their digital resume.
- **💬 The Trust Engine (Reference Checks):** Clients can verify a worker's quality by starting a real-time, private chat with the client of a past job.
- **🎙️ Voice-First Interface:** Integrated Web Speech API allows users to dictate their job requirements instead of typing.
- **📱 Progressive Web App (PWA):** Feels like a native app on mobile, requiring minimal storage space and offering Push Notifications.

## 🛠️ Tech Stack

- **Frontend:** Next.js built as a Progressive Web App (PWA)
- **Styling:** Tailwind CSS
- **Backend:** Node.js with Express
- **Database:** MongoDB Atlas (utilizing `2dsphere` geospatial indexes for precise location matching)
- **Real-Time Communication:** Socket.io (for instant peer-to-peer reference chats)
- **Media Storage:** Cloudinary (for compressing and hosting portfolio photos)

## 🚀 Getting Started (Local Setup Guide)

Follow these steps to run **JobDone** locally on your machine.

### Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **Git**

You will also need to set up free accounts for the following services to get your API keys:
- **MongoDB Atlas** (for the database)
- **Cloudinary** (for image storage)
- **Firebase** (for OTP Authentication)

### 1. Clone the Repository
Open your terminal and run:
```bash
git clone https://github.com/Naman1313/JobDone.git
cd JobDone
```

### 2. Backend Setup
The backend runs on **Node.js** & **Express** (Port 5000).

1. Navigate to the backend directory:
   ```bash
   cd jobdone-backend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Create an environment variables file:
   - Create a file named `.env` in the `jobdone-backend` folder.
   - Add the following keys (replace the placeholders with your actual credentials):
     ```env
     PORT=5000
     CLIENT_URL=http://localhost:3000
     
     # MongoDB
     MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority
     
     # JWT (JSON Web Token)
     JWT_SECRET=your_super_secret_jwt_key_here
     JWT_EXPIRES_IN=7d
     
     # Firebase Admin SDK (From Firebase Project Settings -> Service Accounts -> Generate New Private Key)
     FIREBASE_PROJECT_ID=your-firebase-project-id
     FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
     FIREBASE_CLIENT_EMAIL=your-firebase-client-email@project-id.iam.gserviceaccount.com
     
     # Cloudinary (From Cloudinary Dashboard)
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *(Keep this terminal open)*

### 3. Frontend Setup
The frontend runs on **React (Next.js)** (Port 3000).

1. Open a **new terminal window** and navigate to the frontend directory:
   ```bash
   cd jobdone-frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Create an environment variables file:
   - Create a file named `.env.local` in the `jobdone-frontend` folder.
   - Add the following keys (from your Firebase Project Settings -> General -> Web App):
     ```env
     NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
     NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
     ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

### 4. You're All Set! 🎉
Open your browser and visit: [http://localhost:3000](http://localhost:3000)

- You should see the JobDone landing page.
- You can log in using your phone number via Firebase OTP.
- The app will automatically connect to your local backend on port 5000.

---
*Built with ❤️ by:*
- **Harsh Panchal** ([@Harsh-Panchal-1](https://github.com/Harsh-Panchal-1))
- **Naman Chaudhaury** ([@Naman1313](https://github.com/Naman1313))
- **Paras Tripathi** ([@paras738](https://github.com/paras738))
