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

- **Frontend:** React.js (via Vite) built as a Progressive Web App (PWA)
- **Styling:** Tailwind CSS
- **Backend:** Node.js with Express
- **Database:** MongoDB Atlas (utilizing `2dsphere` geospatial indexes for precise location matching)
- **Real-Time Communication:** Socket.io (for instant peer-to-peer reference chats)
- **Media Storage:** Cloudinary (for compressing and hosting portfolio photos)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Cloudinary account

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/JobDone.git
```

---
*Built with ❤️*
