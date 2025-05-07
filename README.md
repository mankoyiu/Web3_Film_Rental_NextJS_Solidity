# Film Rental DApp

A decentralized film rental platform built on blockchain technology.

---

 Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Pages Overview](#pages-overview)
- [Technologies Used](#technologies-used)

---

 Introduction
Film Rental DApp is a next-generation decentralized application (DApp) that allows users to browse, rent, and enjoy movies securely using blockchain technology. The platform provides a seamless and transparent film rental experience, leveraging smart contracts for security and instant access.

---

 Features
- User Authentication: Secure login and role-based access for users, staff, and admin.
- Film Catalog: Browse a wide selection of films with detailed information and search/filter capabilities.
- Film Management: Staff/admin can create, edit, and delete films via a dedicated dashboard.
- Blockchain Rentals: Rent films using crypto payments; all transactions are recorded on-chain.
- Personal Film Library: Users can view and manage their current and past rentals.
- Data Visualization: Staff dashboard provides rental stats, revenue, and genre analytics.
- Responsive Design: Optimized for desktop and mobile devices.
- Instant Access: Watch rented films immediately after payment.

---

 Installation
To set up the project locally:


git clone <repository-url>
cd <project-directory>
npm install
npm run dev

---

 Usage
1. Start the development server:
   npm run dev
   
2. Access the app:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. User Flows:
   - Browse Films: Go to `/films` to view and search available films.
   - Rent a Film: Click on a film and follow the prompts to rent using your connected wallet.
   - View Rentals: Access `/rentals` to see your current and past rentals.
   - Staff/Admin: Log in and access `/staff/dashboard` for film management and analytics.
   - Add New Film: Staff can add films at `/staff/films/new`.
   - Change Password: Staff/admin can change their password at `/staff/change-password`.

---

 Pages Overview
- Home Page (`/`): Welcome, feature highlights, and quick links to browse or view rentals.
- Films Page (`/films`): Film catalog with search, filter, and rental options.
- Rentals Page (`/rentals`): User's personal film library (current and past rentals).
- Login Page (`/login`): User authentication modal for login.
- Staff Dashboard (`/staff/dashboard`): Film management, statistics, and admin features.
- Add New Film (`/staff/films/new`): Staff-only form to add films.
- Change Password (`/staff/change-password`): Staff/admin password update page.
- Admin Page (`/admin`): (If enabled) Admin-specific management features.

> Note: Dedicated About and Contact pages are not present in the current codebase. General info is included on the Home page.

---

 Technologies Used
- Frontend:
  - Next.js (React framework)
  - React
  - TypeScript
  - Ant Design (UI library)
  - Tailwind CSS
  - Ethers.js (Web3 integration)
  - Wagmi (Web3 React hooks)
  - Axios (API requests)
  - React Query (data fetching)
- Backend/Smart Contracts:
  - Solidity (for blockchain contracts, not included in this repo)
  - Node.js (API integration)
- Other:
  - Responsive CSS
  - Modern authentication and role-based access
  - Data visualization (Ant Design, custom charts)
