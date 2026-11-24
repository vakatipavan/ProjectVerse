# ProjectVerse – Global Problem-to-Solution Discovery Platform

> **"Discover Problems. Explore Solutions. Build the Future."**

ProjectVerse is a modern, responsive web application connecting people who have real-world problems with innovators who have already built the solutions. Instead of treating projects as mere portfolio showcases, ProjectVerse organizes discovery around **real-world problem statements, domain categories, and proven software solutions**.

---

## 🌟 Key Features

1. **Problem-to-Solution Discovery Engine (`/find-solutions`)**
   - Natural keyword-matching search querying across problem statements, proposed solutions, categories, tech stacks, and tags.
   - Highlights *why* each project is relevant to the searched query.
   - Ready for AI/semantic search integration.

2. **Comprehensive Project Discovery (`/explore`)**
   - Search across projects.
   - Multi-attribute filtering: Category, Technology Stack, Project Status (`Active`, `Completed`, `Under Development`), and Project Type.
   - Sorting by newest, most viewed, and most liked.
   - Responsive Grid and List layouts.

3. **10 Real-World Problem Categories (`/categories`)**
   - Agriculture & Farming, Retail & Business, Food & Sustainability, Healthcare, Education, Environment & Energy, Transportation, Technology & AI, Finance, and Smart Cities.
   - Real-time project counts calculated from available data.

4. **Project Submission with Moderation (`/submit`)**
   - Comprehensive submission form capturing:
     - Problem Statement & Proposed Solution
     - Detailed Architecture & Description
     - Category, Tech Stacks, Status, Project Type
     - Live URL, GitHub URL, Media Screenshot
     - Creator & Institutional Affiliation
     - Collaboration Status
   - Automatically enters Firestore with `moderationStatus: "pending"` and `approved: false`.

5. **Individual Project Details (`/projects/:id`)**
   - Rich presentation with Cover Image, Problem vs. Solution breakdown, Features, and Tech Stack pills.
   - Engagement buttons: Like, Save/Bookmark, Share, Report submission, and Collaboration Request modal.
   - "Visit Live Project" and "View Source Code" deep-links opening safely in external tabs (`rel="noopener noreferrer"`).
   - Dynamic similar projects section based on category relevance.

6. **User Authentication & Profiles (`/profile`)**
   - Email/password authentication and Google OAuth.
   - Public creator profile: bio, organization, technical skills, published solutions, and saved bookmarks.
   - Profile editing and management of user submissions.

7. **Admin Dashboard & Moderation Console (`/admin`)**
   - Protected route with role-based authorization.
   - High-level KPI metrics: Total Projects, Users, Pending Submissions, Approved Live, and Rejected.
   - Review submitted projects with 1-click Approval or feedback-driven Rejection.

8. **Zero-Config Demo Mode**
   - Runs out-of-the-box with **12 realistic demonstration projects** (such as *Nourish Network*, *AgroSense*, *RetailPulse*, *LearnBridge*, *MediConnect*, *CityFlow*, etc.) when Firebase credentials are not yet supplied.

9. **SEO & Search Engine Readiness**
   - Dynamic meta tags, Open Graph and Twitter cards via `react-helmet-async`.
   - Semantic HTML5 structure and JSON-LD structured data.
   - `public/robots.txt` disallowing private user routes and allowing indexing of public discoveries.
   - XML Sitemap (`public/sitemap.xml`) indexing only public, approved projects.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite
- **Language:** JavaScript (ESNext)
- **Styling:** Tailwind CSS (custom modern palette: Slate 900 text, Electric Blue & Violet accents, soft card shadows)
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **Routing:** React Router v7
- **Backend / Database:** Google Firebase Authentication, Cloud Firestore, Firebase Storage
- **Hosting Compatibility:** Vercel, Render, Netlify, Firebase Hosting

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or yarn

### 2. Installation
```bash
# Clone the repository and enter directory
cd ProjectVerse

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate `.env` with your Firebase project credentials from [Firebase Console](https://console.firebase.google.com):
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

> **Note:** If `.env` is omitted, the application automatically enters **Demo Mode**, utilizing 12 realistic demonstration projects with mock authentication.

### 4. Running Locally
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 5. Production Build
```bash
npm run build
npm run preview
```

---

## 🔒 Firestore Security Rules

ProjectVerse includes production-ready Firestore rules in `firestore.rules`:
- Users can create and edit only their own profile data, without self-escalating the `role` field.
- Unapproved projects with `approved: false` are accessible only to the project owner and administrators.
- Only administrators can modify `approved` and `moderationStatus`.
- Duplicate likes and bookmarks are guarded by composite document IDs (`userId_projectId`).
- Reports and collaboration requests can only be dispatched by authenticated users.

Deploy rules using the Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 🌐 Deployment Instructions

### Deploy to Vercel
1. Push your code to a GitHub/GitLab repository.
2. In Vercel, click **Add New Project** and select your repository.
3. Build Settings are pre-configured:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. In **Environment Variables**, add the `VITE_FIREBASE_*` keys from `.env.example`.
5. Deploy. The included `vercel.json` ensures all client-side routes redirect cleanly to `index.html`.

### Deploy to Render
1. In Render Dashboard, click **New +** -> **Static Site**.
2. Connect your Git repository.
3. Configure settings:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. In **Redirects/Rewrites**:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`
5. Add Environment Variables under the **Environment** tab.
6. Click **Create Static Site**.

---

## 📄 License

MIT License. Built for problem-solvers, students, and global innovators.
