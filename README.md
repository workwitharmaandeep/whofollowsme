# WhoFollowsMe 🔍

> **100% In-Browser, Privacy-First Instagram Relationship & Unfollower Analytics**  
> *Zero server uploads. Zero passwords or cookies. Zero account ban risk.*

---

## ✨ Overview

**WhoFollowsMe** is an open-source, client-side web application designed to help you analyze your Instagram followers and following lists safely. 

Unlike traditional "follower tracker" apps that ask for your Instagram password or session cookies (which triggers security checkpoints, temporary locks, or permanent account bans), **WhoFollowsMe operates 100% in your browser** using official data exports downloaded directly from Meta's Accounts Center.

**Your data never leaves your computer.**

---

## 🚀 Key Features

- **🔒 100% Client-Side Privacy**: Zero data is ever sent to a server. Parsing, relationship computation, diff comparisons, and storage run entirely inside your browser's memory and local IndexedDB.
- **⚡ Automatic Account & Handle Detection**: Automatically detects your username from the official Instagram ZIP export name or internal profile metadata.
- **👥 Multi-Account Support with Strict Isolation**: Manage and switch between multiple Instagram accounts seamlessly. Whitelists, visited statuses, and diff baselines are strictly partitioned per account with zero cross-contamination.
- **📊 Comprehensive Relationship Breakdown**:
  - **Don't Follow Back**: Accounts you follow who do not follow you back.
  - **Mutuals**: Accounts that follow each other.
  - **Fans**: Accounts that follow you, but you don't follow back.
  - **Pending Requests**: Outgoing follow requests sent to private accounts.
  - **Recently Unfollowed**: Accounts you recently unfollowed according to your export.
  - **Close Friends Audit**: Inspect your Close Friends list and flag one-way connections.
- **📈 Snapshot Diff & History Tracking**:
  - Upload future exports to compare against past snapshots.
  - Instantly reveals who unfollowed you, new followers, and accounts you newly followed since your last export.
- **🗂️ Session & Snapshot Management**:
  - View all saved upload sessions with exact timestamps and follower counts.
  - Delete individual past snapshots or wipe entire account sessions with one click.
- **📲 Direct Profile Redirection**:
  - Tapping **"Unfollow"** on any user immediately redirects to their official Instagram profile via native app intent on mobile (`instagram://user?username=...`) or Instagram Web on desktop.
- **⭐ Whitelisting & Visited Badges**:
  - Whitelist celebrities, creators, or brand accounts you intentionally follow one-way so they don't clutter your unfollow list.
  - Automatically marks accounts as "Opened / Visited" as you review them.
- **💾 Flexible Data Exports**:
  - Export your relationship lists to **CSV**, **TXT**, or complete **JSON**.
- **🎨 Minimal, Editorial Design**:
  - Clean violet aesthetic with glassmorphism, responsive bottom-sheets on mobile, and smooth dark/light theme switching.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Client Storage**: [Dexie.js](https://dexie.org/) (IndexedDB wrapper) & `localStorage`
- **ZIP Extraction**: [JSZip](https://stuk.github.io/jszip/) (100% in-browser archive extraction)
- **Language**: TypeScript

---

## 📥 How to Get Your Instagram Export

To analyze your account with WhoFollowsMe:

1. Open the **Instagram App** on your phone.
2. Go to your **Profile** and tap the **Menu (≡)** in the top right.
3. Open **Accounts Center** $\rightarrow$ **Your information and permissions**.
4. Tap **Export your information** $\rightarrow$ **Create export**.
5. Select your Instagram profile and choose **Export to device**.
6. **Important Settings**:
   - **Format**: Select **`JSON`** *(HTML format is not supported)*.
   - **Date range**: Select **`All time`** *(ensures complete follower timestamps)*.
7. Tap **Start export**. Meta will notify you when the ZIP file is ready (usually 5–15 minutes).
8. Download the `.zip` file to your device and drop it into **WhoFollowsMe**!

---

## 💻 Getting Started Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.18 or newer recommended)
- `npm`, `pnpm`, or `yarn`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/whofollowsme.git
   cd whofollowsme
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   npm run start
   ```

---

## 🔒 Privacy & Security Guarantee

- **No Remote Servers**: WhoFollowsMe has no backend API routes. The entire build compiles to static client-side bundles.
- **No Credentials**: We never ask for your Instagram username, password, two-factor code, or cookies.
- **No Trackers**: Zero telemetry, zero analytics scripts, and zero third-party advertising cookies.
- **Inspectable**: Every line of code is open source and verifiable.

---

## ⚠️ Disclaimer

WhoFollowsMe is an independent open-source project and is **not affiliated, associated, authorized, endorsed by, or in any way officially connected with Instagram, Meta Platforms, Inc., or any of their subsidiaries or affiliates**.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

