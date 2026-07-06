# ScholarTrack Desktop (Electron + React)

Modern desktop client for the ScholarTrack Spring Boot backend.
Stack: Electron 33 · React 18 · TypeScript · Vite · Tailwind CSS · TanStack Query · Recharts · STOMP WebSocket.

## Run (development)
1. Start the backend:  `cd ..\backend` then `mvn spring-boot:run`
2. In this folder:
       npm install        (first time only; downloads Electron, takes a few minutes)
       npm run dev        (opens the desktop window with hot reload)
   No Electron? `npm run dev:web` serves the same UI at http://localhost:5173 in your browser.

Demo logins: student/student123 · teacher/teacher123 · hod/hod123
(Teacher and HOD screens arrive in the next milestones; those roles currently see a "coming soon" page.)

## Other commands
    npm run typecheck   TypeScript check
    npm run build       type-check + production bundle into dist/
    npm start           build, then open the production bundle in Electron

## Server address
Login screen -> "Server settings" (or Settings page). Default http://localhost:8080.
For a cloud build set VITE_API_URL before building; set VITE_SHOW_DEMO=false to hide the demo-account buttons.

## Live updates demo
Keep the app open as the student, then run  `powershell -ExecutionPolicy Bypass -File .\scripts\demo-live-update.ps1`
The teacher's change appears instantly (toast + bell + refreshed numbers).

## Structure
    electron/        main process (window, external-link safety) + preload
    src/lib/         API client (envelope, errors, downloads), types, query hooks, formatters, config
    src/state/       auth, theme, toast, live (STOMP) providers
    src/components/  design system (ui.tsx), charts, application shell
    src/pages/       Login, Settings, ComingSoon, student/* (12 screens)
