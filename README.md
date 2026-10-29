# VISIONFLIX — PERSONAL NETFLIX MANAGEMENT SYSTEM
**Mobile-First Personal Netflix Account, Hardware, and TV Activation Manager**

> **Independent Personal Tool Disclosure:**  
> VisionFlix is an independent personal streaming management dashboard designed for personal use with accounts and registered email inboxes that you own or are authorized to manage. VisionFlix is not affiliated with, endorsed by, or sponsored by Netflix, Inc. or Google LLC.

---

## 1. System Overview

**VisionFlix** transforms Netflix account management into a unified, secure dashboard designed for personal hardware, TV activations, and Netflix household verifications.

### Key Capabilities:
- **Private Admin Account Manager (`/admin/accounts`):** Add, edit, delete, and search personal Netflix account references, nicknames, registered email inboxes, subscription plans, notes, and hardware. Zero Netflix password collection.
- **Gmail OAuth Notification Sync (`/api/auth/google`):** Connects to your own Google account using official read-only OAuth (`https://www.googleapis.com/auth/gmail.readonly`). Fetches relevant Netflix sign-in and Household verification email alerts, displaying timestamp, sender, subject, and deep links to open the original email securely inside Gmail.
- **Security & Token Sanitization:** OTPs, verification codes, and authentication URLs are automatically redacted on the server before client presentation. VisionFlix never automatically extracts, stores, forwards, or submits authentication tokens.
- **Mobile-First TV Activation Screen (`/tv-activation`):** 8-character code input with automatic cursor movement, complete paste support, quick launch to official `https://www.netflix.com/activate`, code copying, and manual activation completion tracking.
- **Household Management (`/household`):** Device verification tracking, diagnostic walkthroughs for Netflix household policies, and live email stream for household update notices.
- **Personal Device Registry (`/admin/devices` & `/settings`):** Track hardware models (Samsung Tizen, LG webOS, Apple TV 4K, Fire TV, Roku, Google TV), household locations, and linked accounts.

---

## 2. Technology Stack & Security

- **Framework:** Next.js 14 App Router
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS (Dark charcoal `#08080A`, `#121217` with cinematic red `#E50914`)
- **Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication:** Supabase Auth (Email/Password session persistence)
- **Email Synchronization:** Google Cloud OAuth 2.0 (`gmail.readonly` scope)
- **Icons:** Lucide React

---

## 3. Security & Zero-Credential Architecture

1. **Zero Netflix Password Collection:** The application never asks for or stores Netflix passwords. Netflix authentication is performed through Netflix's official website.
2. **Read-Only Gmail Permissions:** Uses the minimal necessary permission `https://www.googleapis.com/auth/gmail.readonly`. VisionFlix cannot send, delete, or modify any emails.
3. **Server-Side Token Sanitization:** All email message snippets are parsed on the server to strip any 4–8 digit verification numbers and secure URLs before reaching the browser, replacing them with `[SECURITY CODE REDACTED]` and direct links to open the message securely in Gmail.
4. **Encrypted Storage:** OAuth refresh tokens and access tokens are kept in protected Supabase tables secured with Row Level Security (RLS).
5. **No Fake Activation Responses:** Does not simulate automatic Netflix activation or call undocumented Netflix endpoints.

---

## 4. Supabase Database Schema

The database schema is defined in [`supabase/migrations/20250101000000_init_visionflix.sql`](file:///c:/Users/hhshu/OneDrive/Desktop/NETFLIXSUPPORT-VISIONFLIX/supabase/migrations/20250101000000_init_visionflix.sql):

| Table | Purpose | Row Level Security (RLS) |
| :--- | :--- | :--- |
| `profiles` | User profiles with active status and role | Owner can read/update own record |
| `admin_roles` | Admin privilege mappings | Protected; Admin only |
| `netflix_accounts` | Personal Netflix accounts (email, nickname, inbox, plan, status, notes) | Protected to owner/admin |
| `personal_devices` | Registered smart TVs, streaming sticks, and hardware | Protected to owner/admin |
| `tv_activations` | TV activation submissions (code, device, tracking number, status) | Protected to owner/admin |
| `household_verifications` | Household verification logs & resolution notes | Protected to owner/admin |
| `gmail_integrations` | OAuth access and refresh tokens for Gmail synchronization | Protected to authenticated owner |
| `audit_logs` | Audit trail of administrative actions | Admin only |

---

## 5. Local Setup & Configuration

### Prerequisites
- Node.js 18+ (tested on Node.js 24)
- npm or pnpm
- Supabase account (free tier works great)
- Google Cloud Console project (for Gmail OAuth)

---

### Step 1: Install Dependencies

```bash
npm install
```

---

### Step 2: Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard.
3. Open [`supabase/migrations/20250101000000_init_visionflix.sql`](file:///c:/Users/hhshu/OneDrive/Desktop/NETFLIXSUPPORT-VISIONFLIX/supabase/migrations/20250101000000_init_visionflix.sql) and run the full SQL script.
4. Go to **Project Settings -> API** and copy:
   - Project URL
   - `anon` `public` key
   - `service_role` secret key

---

### Step 3: Google Cloud OAuth Setup (for Gmail Notification Sync)

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `VisionFlix-Manager`).
3. Enable the **Gmail API**:
   - Go to **APIs & Services -> Library**
   - Search for **Gmail API** and click **Enable**.
4. Configure the **OAuth Consent Screen**:
   - User Type: **External** (for personal testing, add your own email as a Test User).
   - Scopes: Add `https://www.googleapis.com/auth/gmail.readonly`.
5. Create OAuth Credentials:
   - Go to **APIs & Services -> Credentials -> Create Credentials -> OAuth Client ID**.
   - Application type: **Web application**.
   - Name: `VisionFlix Web Client`.
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/google/callback
     ```
   - Click **Create** and copy your **Client ID** and **Client Secret**.

---

### Step 4: Environment Variables

Create `.env.local` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Google OAuth (Gmail read-only sync)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

### Step 5: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Step 6: Verify Production Build

```bash
npm run build
```

---

## 6. Project Architecture

```
src/
├── app/
│   ├── admin/
│   │   ├── accounts/      # Personal Netflix Account Manager & Gmail Sync
│   │   ├── devices/       # Personal Device Registry
│   │   ├── tickets/       # TV Activations & Household Activity Queue
│   │   └── page.tsx       # Admin Metrics & Audit Trail
│   ├── api/
│   │   ├── auth/google/   # Google OAuth Start & Callback Handlers
│   │   └── gmail/         # Status, Messages, and Disconnect Endpoints
│   ├── dashboard/         # Personal Overview Dashboard
│   ├── household/         # Household Support & Official Email Notifications
│   ├── tv-activation/     # TV 8-Character Code Screen & Activation Flow
│   ├── tickets/           # Personal Request Activity & Tracking
│   ├── settings/          # Registered Personal Hardware
│   └── page.tsx           # Home Screen with Hero & Tracking
├── components/
│   ├── gmail/             # GmailNotificationInbox component
│   ├── layout/            # Navbar, BottomNav, Footer
│   ├── tv/                # TvCodeInput with 8-character auto-focus & paste
│   └── ui/                # DisclaimerBanner and modals
├── lib/
│   ├── adapters/          # IActivationProviderAdapter interface
│   ├── gmail/             # Gmail service (OAuth, fetch, sanitize)
│   ├── store/             # AppContext live state management
│   └── supabase/          # Supabase client and database queries
└── types/                 # TypeScript data models and enums
```
