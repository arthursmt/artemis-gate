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
│   └── api.ts           # API base URL configuration
├── lib/
│   ├── api.ts           # API client with fetch wrappers
│   ├── gateStore.ts     # localStorage for role/userId
│   ├── selectors.ts     # Robust data extraction helpers
│   └── queryClient.ts   # TanStack Query client
├── types/
│   └── gate.ts          # TypeScript interfaces
├── components/
│   └── gate/
│       ├── GateLayout.tsx        # Main layout with header
│       ├── RoleSelector.tsx      # OPS/RISK role dropdown
│       ├── StageBadge.tsx        # Stage status badge
│       ├── ApiNotConfiguredBanner.tsx
│       ├── EvidenceGallery.tsx   # Evidence thumbnails with lightbox
│       ├── MemberDetails.tsx     # Member info cards
│       ├── ContractSection.tsx   # Contract and signatures
│       ├── DecisionPanel.tsx     # Approve/Reject UI
│       └── AuditTrail.tsx        # Decision history
├── pages/
│   └── gate/
│       ├── inbox.tsx             # Proposals table
│       ├── debug.tsx             # API connectivity test
│       └── proposal-details.tsx  # 3-panel details view
└── App.tsx                       # Routes configuration
```

## Routes
- `/gate/inbox` - Proposals inbox with filtering
- `/gate/proposals/:proposalId` - Proposal details with 3-panel layout
- `/gate/debug` - API connectivity testing page

## Environment Variables
- `VITE_API_BASE_URL` - The ARISE backend URL (required)

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

## Running the App
The app binds to port 5000 via the existing Vite setup.
