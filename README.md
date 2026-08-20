# 🏛️ CIVIC AI — Intelligent Public Grievance Redressal & SLA Accountability System

> **Transforming Municipal Governance with AI-Driven Severity Classification, Real-Time SLA Watchdogs, Historical Precedent Advisories, and Two-Key Citizen Verification.**

---

## 🌟 Overview

**CIVIC AI** is a next-generation civic grievance redressal and municipal operations platform designed to solve systemic failures in public administration: slow response times, bureaucratic opacity, duplicate complaints, and premature ticket closures without verifiable ground resolution.

Equipped with Gemini AI and deterministic NLP heuristics, **CIVIC AI** automatically classifies complaints by risk, matches incoming reports against historically resolved cases to recommend technical remedies to officers, enforces strict dynamic SLA countdowns with multi-tier escalation, and introduces a **Two-Key Citizen Verification Gate** to ensure tickets are only marked resolved when the reporting citizen validates the work.

---

## ✨ Key Features

### 1. 🤖 AI-Powered Grievance Intake & Classification
- **Automated Severity & Risk Assessment**: Analyzes natural language descriptions and images to calculate severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), estimate public risk, and determine population impact.
- **Intelligent Department Routing**: Directs issues to the right municipal authority (Electricity/BESCOM, Public Works, Water Supply & Sewerage, Health & Sanitation, Traffic Engineering).
- **Duplicate & Cluster Detection**: Vector similarity and geospatial proximity detect recurring complaints to prevent redundant ticket dispatches.

### 2. 📜 Historical Precedent Advisory (Non-Binding Officer Guidance)
- **Precedent Comparison Engine**: Compares new complaints against past verified resolutions in the same ward and category.
- **Officer Discretion Advisory**: Provides field engineers with actionable suggestions derived from past successful repairs without overriding human judgment or ground verification.

### 3. ⏱️ Automated SLA Countdown & Escalation Watchdog
- **Real-Time Timers**: Live countdowns customized per priority (e.g., 4 hrs for Critical Gas/Electric Hazards, 24 hrs for Sanitation, 72 hrs for Road Repairs).
- **Multi-Tier Escalation**: Automatically alerts supervisory officers and escalates breached tickets directly to the Municipal Commissioner's dashboard.

### 4. 🔑 Two-Key Citizen Verification Gate
- **Tamper-Resistant Proof of Work**: Officers must submit on-site photo evidence, repair notes, and cost expenditure before marking a ticket as *"Pending Citizen Verification"*.
- **Citizen Closeout Authority**: Only the reporting citizen (or system timeout with audit trail) can accept the resolution or reject it with comments to trigger re-work.

### 5. 👥 Multi-Persona Access & Citizen Registration
- **Role-Based Portals**: Tailored interfaces for **Citizens**, **Department Officers**, and **Municipal Administrators**.
- **One-Click Persona Switcher**: Instant live switching between demonstration accounts (`Aarav Sharma`, `Priya Nair`, `Dr. K. S. Rao`).
- **Complete Registration System**: Seamless onboarding for new citizens and officers with phone and email verification.

### 6. 🗺️ Interactive Geospatial Map & Audit Timeline
- **Interactive GIS Map**: Visualizes open, in-progress, and critical ward grievances with category filters and heat clusters.
- **Tamper-Evident Audit Timeline**: Every state change, officer assignment, escalation, and verification is permanently recorded in an immutable event log.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Leaflet GIS Maps, Motion Transitions.
- **Backend / API**: Node.js, Express.js, TypeScript.
- **AI & NLP**: Google Gemini API (`gemini-2.5-flash`, `text-embedding-004`) + Built-in deterministic Civic Intelligence Fallback Engine.
- **Database & State**: In-Memory / Structured State Database with guaranteed unique monotonic event sequencing and SLA daemons.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Thanushree9207/CIVIC-AI.git
   cd CIVIC-AI
