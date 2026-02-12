# PDP - Gestão de Oradores

## Overview
A speaker scheduling and management PWA built with React, Vite, and TypeScript. The app allows managing speakers, scheduling talks, creating outlines, and exporting data. Uses localStorage for data persistence.

## Project Architecture
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS (via CDN)
- **Storage**: Browser localStorage (via `services/storage.ts`)
- **Key Libraries**: lucide-react (icons), date-fns (dates), uuid, jspdf (PDF export)

## Structure
- `/components/` - Reusable UI components (Button, Card, Layout, Sheet, Toast)
- `/pages/` - Page views (Dashboard, NewSchedule, Speakers, Outlines, Settings, Information)
- `/services/` - Storage service
- `/types.ts` - TypeScript type definitions
- `/constants.ts` - App constants

## Running
- Dev: `npm run dev` (port 5000)
- Build: `npm run build` (output to `dist/`)
- Deploy: Static deployment from `dist/`
