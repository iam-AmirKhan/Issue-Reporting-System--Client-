# InfraCare - Public Infrastructure Issue Reporting System (Client)

InfraCare is a full-stack platform designed to bridge the gap between citizens, municipal staff, and administrators for reporting and tracking public infrastructure issues like potholes, broken lights, and water leakages.

## 🚀 Technology Stack
- **Framework**: Vite + React
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Authentication**: Firebase Authentication (Google & Email/Password)
- **Icons & Animations**: Framer Motion, Lucide (via SVG)
- **Utilities**: Axios, SweetAlert2, jsPDF, Recharts

## ✨ Core Features
- **Citizen Dashboard**: Report issues (3 issue limit for free tier), boost priority via payments, and track progress.
- **Staff Dashboard**: Manage assigned tasks, update status, and add timeline notes.
- **Admin Hub**: Manage users (Block/Unblock), recruit staff, assign/reject issues, and track revenue with PDF invoices.
- **Public Feed**: Searchable and filterable list of all reported issues with a real-time timeline audit trail.
- **Premium Subscription**: Unlimited issue reporting for dedicated community contributors.

## 📦 Installation & Setup
1. Clone the repository.
2. Navigate to the client directory: `cd public-issue-client`
3. Install dependencies: `npm install`
4. Create a `.env` file and add your Firebase configurations:
   ```env
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
5. Run the development server: `npm run dev`

## 🛠️ Deployment
Build the production bundle:
```bash
npm run build
```
The output will be in the `dist/` folder, ready for hosting on platforms like Vercel or Netlify.
