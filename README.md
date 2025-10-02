# RFQ Management System - Frontend

A **React + Tailwind CSS** frontend for the RFQ Management System. This UI allows buyers and sellers to interact with the backend API, submit bids, view RFQs, and receive real-time notifications.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Screenshots](#screenshots)
- [Future Enhancements](#future-enhancements)

---

## Features

- View RFQ dashboard.
- Buyers can create RFQs and award bids.
- Sellers can submit bids and counteroffers.
- Real-time notifications displayed in header.
- Unread notification badge and dropdown.
- Role-based UI elements (Buyer / Seller / Admin).
- Responsive layout using Tailwind CSS.

---

## Tech Stack

- **Frontend:** React, Tailwind CSS  
- **State Management:** React Hooks  
- **Realtime:** Socket.io-client  
- **HTTP Client:** Axios  
- **Version Control:** Git, GitHub  

---

## Project Structure

```text
client/
├─ src/
│  ├─ components/       # Reusable UI components (Button, Table, Header, etc.)
│  ├─ pages/            # React pages (RFQ dashboard, RFQ details)
│  ├─ utils/            # Axios service, Socket manager
│  ├─ App.jsx
│  └─ index.jsx
├─ package.json
└─ tailwind.config.js

## Installation

### Frontend

```bash
# Navigate to frontend folder
cd client

# Install dependencies
npm install


## Running the Application

**Frontend URL:** [http://localhost:3000](http://localhost:3000)

### Steps to Run

1. Make sure you have installed all dependencies as per the [Installation](#installation) section.
2. Start the frontend:

```bash
cd client
npm start      # Runs the React app on http://localhost:3000



## Future Enhancements

- Add filtering and search for RFQs in the UI.
- Improve UI/UX with charts and dashboards.
- Implement push notifications.
- Role-specific dashboards with analytics.
- Pagination for RFQ lists.
- Mobile-first responsiveness improvements.
- Deploy frontend on cloud services (e.g., Vercel, Netlify).
