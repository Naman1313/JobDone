# End-to-End Test Plan: Phase 1 & 2

This guide provides a comprehensive, step-by-step procedure for a tester to verify all features built in Phase 1 (Foundation) and Phase 2 (Core Features) of JobDone.

## Part 1: Environment Setup & Initialization

Before testing, the tester must ensure the local environment is correctly configured.

1.  **Clone the Repository:** Pull the latest code containing the monorepo structure (`jobdone-backend`, `jobdone-frontend`, `shared`).
2.  **Environment Variables:** Ensure `.env` files are present in both the frontend and backend.
    *   Backend needs: `MONGO_URI`, `JWT_SECRET`, `FIREBASE_PROJECT_ID`, `CLOUDINARY_URL`, etc.
    *   Frontend needs: `NEXT_PUBLIC_FIREBASE_API_KEY`, etc.
3.  **Install Dependencies & Build Shared Package:**
    Open a terminal and run the following commands sequentially:
    ```bash
    # Build the shared monorepo package first
    cd shared
    npm install
    npm run build

    # Install Backend
    cd ../jobdone-backend
    npm install

    # Install Frontend
    cd ../jobdone-frontend
    npm install
    ```
4.  **Start the Servers:**
    *   **Backend:** In `jobdone-backend`, run `npm run dev` (starts on `http://localhost:5000`).
    *   **Frontend:** In a new terminal inside `jobdone-frontend`, run `npm run dev` (starts on `http://localhost:3000`).

---

## Part 2: Feature Testing Workflows

The tester should perform the following workflows using a mobile-sized browser window (e.g., Chrome DevTools -> Toggle Device Toolbar -> iPhone 14) as the UI is mobile-first.

### Workflow 1: PWA & Onboarding (Phase 1)
1.  Navigate to `http://localhost:3000/splash`.
2.  **Verify:** The splash screen should show a bouncing animation and, after 2.5 seconds, automatically redirect to `/onboarding`.
3.  **Verify:** On `/onboarding`, clicking "Next" should cycle through 3 distinct slides (Build Identity, Find Work, Get Paid) with changing colors and icons.
4.  **Verify:** Clicking "Get Started" on the final slide should route to `/auth`.
5.  **Verify (PWA):** Check Chrome DevTools > Application > Manifest to ensure `manifest.json` is loaded correctly. 

### Workflow 2: Authentication (Phase 1 & 2)
1.  On the `/auth` page, enter a test phone number (e.g., `+919999999999`).
2.  Complete the Firebase reCAPTCHA (if prompted) and enter the OTP sent to the device (or use a test OTP if configured in Firebase).
3.  **Verify:** Successful login should direct the user to the Role Selection screen (Worker vs Client) or directly to `/profile/setup` if they are a new user.

### Workflow 3: Worker Profile Setup & Editing (Phase 2)
1.  **Setup:** As a new Worker, fill out the multi-step profile setup wizard. Add a name, select a trade (e.g., Plumber), and set an hourly rate.
2.  **Verify:** Submitting the form should redirect to the `/home` feed.
3.  **Edit Profile:** Click the "Profile" icon in the Bottom Navigation Bar, then click "Edit Profile" (navigating to `/profile/me`).
4.  **Verify:** Change the hourly rate or availability status to "Busy right now" and click "Save Profile". The app should alert success and redirect to `/home`.

### Workflow 4: Social Feed & Media Upload (Phase 2)
1.  From the `/home` feed, click the "Post" icon in the bottom navigation bar to go to `/posts/create`.
2.  Write a text update (e.g., "Just finished a massive plumbing job!").
3.  Click **"Add Photo / Video"** and select a test image from the local computer.
4.  Click **"Post"**.
5.  **Verify:** You should be redirected to `/home` and see your new post at the top of the feed, complete with the uploaded image.
6.  **Verify:** Click the Heart icon on the post. The like count should increment.

### Workflow 5: Job Board (Phase 2)
> [!NOTE]
> This requires two accounts. The tester should use an Incognito window to log in as a Client, and their main window to log in as a Worker.

1.  **Client Posts Job:** In the Client window, navigate to the Jobs tab and click "Post Job" (`/jobs/post`). Fill out the form (Trade, Budget, Urgency, Description) and submit.
2.  **Worker Views Job:** In the Worker window, navigate to the Jobs tab (`/jobs`). 
    *   **Verify:** The newly created job card should be visible. Use the filter bar to test filtering by Trade or Urgency.
3.  **Worker Applies:** The worker clicks "Apply" on the job card.
4.  **Client Hires:** Back in the Client window, the client clicks on their job to view applicants (`/jobs/:id/applicants`), sees the Worker's mini-profile card, and clicks "Hire".
    *   **Verify:** The job status in the UI (and database) should change to "filled".

---

## Part 3: Database Verification

After completing the UI flows, the tester should log into **MongoDB Atlas** (using the cluster URI in the `.env` file) to verify the data integrity.

1.  **Check `users` Collection:** Ensure the test accounts exist with the correct `role` (worker/client).
2.  **Check `workerprofiles` Collection:** Ensure the Worker account has the correct `trade`, `hourlyRate`, and `availability` status matching the edits made in Workflow 3.
3.  **Check `posts` Collection:** Find the post created in Workflow 4. Verify the `mediaUrls` array contains a valid `res.cloudinary.com` URL. Verify the `likes` array contains the user's ID.
4.  **Check `jobs` Collection:** Find the job created in Workflow 5. Verify its `status` is set to `filled`.
5.  **Check `bookings` Collection:** Verify that when the Client clicked "Hire" in Workflow 5, a new document was created in the `bookings` collection linking the `jobId`, `clientId`, and `workerId`.
