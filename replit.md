# Artemis Gate

## Overview
Artemis Gate is a **frontend-only** backoffice web application that consumes the external ARISE Backend API. It allows OPS and RISK team members to review loan proposals, view member details, evidence, and make approval/rejection decisions.

## Current State
- MVP fully implemented
- Connected to ARISE Backend at: https://artemis-arise--arthursmt89.replit.app

## Tech Stack
- React + TypeScript + Vite
- Tailwind CSS for styling
- TanStack Query for data fetching
- wouter for routing

## Project Structure

```
client/src/
├── config/
│   └── api.ts           # API base URL configuration with validation
├── lib/
│   ├── api.ts           # API client with fetch wrappers
│   ├── apiStatus.tsx    # API health check context provider
│   ├── gateStore.ts     # localStorage for role/userId
│   ├── imageUtils.ts    # Base64 image detection and protection
│   ├── selectors.ts     # Robust data extraction helpers
│   ├── stages.ts        # Centralized stage/role types and constants
│   └── queryClient.ts   # TanStack Query client
├── types/
│   └── gate.ts          # TypeScript interfaces
├── components/
│   └── gate/
│       ├── GateLayout.tsx        # Main layout with sidebar
│       ├── RoleSelector.tsx      # OPS/RISK role dropdown
│       ├── StageBadge.tsx        # Stage status badge
│       ├── ApiNotConfiguredBanner.tsx
│       ├── ApiStatusIndicator.tsx # Header status dot
│       ├── EvidenceGallery.tsx   # Evidence thumbnails with lightbox
│       ├── MemberDetails.tsx     # Member info cards
│       ├── ContractSection.tsx   # Contract and signatures
│       ├── DecisionPanel.tsx     # Approve/Reject UI with validation
│       └── AuditTrail.tsx        # Decision history
├── pages/
│   └── gate/
│       ├── home.tsx              # Operational overview (default landing)
│       ├── inbox.tsx             # Proposals table
│       ├── debug.tsx             # API connectivity test
│       └── proposal-details.tsx  # 3-panel details view
└── App.tsx                       # Routes configuration
```

## Routes
- `/gate/home` - Operational overview (default landing page)
- `/gate/inbox` - Proposals inbox with filtering
- `/gate/proposals/:proposalId` - Proposal details with 3-panel layout
- `/gate/debug` - API connectivity testing page

## Environment Variables
- `VITE_API_BASE_URL` - The ARISE backend URL (required, must start with http:// or https://)

## API Consumption
The app consumes the following ARISE endpoints:
- `GET /api/health` - Health check
- `GET /api/gate/proposals?stage=<stage>` - List proposals
- `GET /api/gate/proposals/:proposalId` - Get proposal details
- `POST /api/gate/proposals/:proposalId/decision` - Submit decision

## Role System
- OPS: Can make decisions only at DOC_REVIEW stage
- RISK: Can make decisions only at RISK_REVIEW stage
- Role stored in localStorage (key: gateRole)
- User ID auto-generated and persisted (key: gateUserId)

## Stage Types
Centralized in `lib/stages.ts`:
- Valid backend stages: DOC_REVIEW, RISK_REVIEW, APPROVED, REJECTED
- Home page derives "In Progress" and "Completed" from valid stages
- API calls only use valid stages to avoid 400 errors

## Hardening Features
- API URL normalization (trim, validate http/https prefix)
- Base64 image protection (>200KB shows placeholder)
- API status indicator in header
- Decision form validation (REJECT requires >=10 char comment + reason)
- CORS-friendly error messages on debug page

## Running the App
The app binds to port 5000 via the existing Vite setup.
