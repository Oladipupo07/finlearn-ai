# 🎯 AtlasLearn AI

AtlasLearn AI is a premium, gamified personal finance education platform and utility suite tailored specifically for students. It leverages Google Gemini AI and real-time data to help students budget smarter, learn investing fundamentals, identify phishing scams, and track their daily financial learning progress.

---

## 🚀 Key Features

*   **🤖 AI Finance Tutor**
    An interactive chatbot powered by Google Gemini that breaks down complex financial terms, investing principles, taxes, and money management concepts into easy-to-understand student-friendly explanations. Includes pre-filled prompt suggestions for quick learning.
*   **💼 Smart Budget Planner**
    An intuitive, real-time budget tracking dashboard. Users can set their weekly/monthly income, define target savings goals, add individual expenses with categorized emojis (e.g., Food 🍔, Utilities ⚡), and view automatic breakdowns.
*   **🛡️ Phishing & Scam Detector**
    An AI-powered scanning utility. Students can paste any suspicious SMS, DM, email, or chat message to analyze pattern risks (Low, Medium, High) with linguistic red-flag keywords, confidence metrics, and safety tips.
*   **🏆 Gamified Quizzes & Daily Streaks**
    Tracks and rewards daily learning activity. Integrated streak systems show daily active streaks with visual fire/flame counters on the dashboard and navigation panel, encouraging consistent financial habit-building.

---

## 🛠️ Technology Stack

*   **Frontend Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with PostCSS & CSS custom properties
*   **Database & Auth**: [Firebase (Cloud Firestore & Authentication)](https://firebase.google.com/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/) for smooth glassmorphism micro-animations
*   **Visualizations**: [Recharts](https://recharts.org/) for interactive financial breakdown area & pie charts
*   **AI Engine**: [Google Gemini API](https://ai.google.dev/) via `@google/genai`

---

## 📂 Project Structure

```text
├── app/
│   ├── (auth)/             # Authentication routes (Login, Signup)
│   ├── (dashboard)/        # User workspace routes
│   │   ├── budget/         # Smart Budget Planner
│   │   ├── chatbot/        # AI Finance Tutor page (Mobile Responsive)
│   │   ├── dashboard/      # Overview & Analytics Dashboard
│   │   ├── quiz/           # Gamified financial literacy quizzes
│   │   └── scam-checker/   # Phishing & Scam Detector
│   ├── api/                # Next.js Serverless API endpoints (Gemini AI route)
│   ├── globals.css         # Tailwind v4 globals and variables
│   └── layout.tsx          # Root template, theme toggles, and global providers
├── components/             # Reusable UI widgets and navigation layouts
├── contexts/               # React Context Providers (AuthContext, StreakContext)
├── lib/                    # Firebase/Gemini initialization clients & helpers
└── public/                 # PWA manifests, icons, and static assets
```

---

## 💻 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 2. Install Dependencies
Clone the repository and run:
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory and configure the following variables:
```env
# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📱 Mobile Responsiveness & Design

*   **PWA Ready**: Configured with full support for Progress Web Application (PWA) installs, including custom icons, viewport settings, and manifest schemas.
*   **Edge-to-Edge Chat**: The AI Tutor page has custom negative-margin classes and dynamic viewport height calculations (`100dvh`) to guarantee an immersive, mobile-native chat experience without nested double-scrollbars.
*   **Adaptive Theme**: Supports auto-detected Dark/Light modes powered by `next-themes` and full glassmorphic styling overlays.
