# CryptoVaultX Router Setup

This directory contains the React Router v6 implementation for CryptoVaultX with lazy-loaded pages and protected routes.

## Files Created

### Router Core
- `AppRouter.tsx` - Main router configuration with React Router v6
- `ProtectedRoute.tsx` - Authentication guard component
- `index.ts` - Router exports

### Page Wrappers
- `../pages/HomePage.tsx` - Home/landing page wrapper
- `../pages/LoginPage.tsx` - Login page wrapper  
- `../pages/RegisterPage.tsx` - Register page wrapper
- `../pages/DashboardPage.tsx` - Dashboard page wrapper
- `../pages/AnalyticsPage.tsx` - Analytics page wrapper
- `../pages/FilesPage.tsx` - Files management page wrapper
- `../pages/SecurityPage.tsx` - Security settings page wrapper
- `../pages/FeaturesPage.tsx` - Features showcase page wrapper
- `../pages/HelpPage.tsx` - Help and support page wrapper
- `../pages/NotFoundPage.tsx` - 404 error page

## Routes Configured

### Public Routes
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/help` - Help and support

### Protected Routes (require authentication)
- `/dashboard` - Main dashboard
- `/dashboard/analytics` - Analytics view
- `/dashboard/files` - File management
- `/security` - Security settings
- `/features` - Features overview
- `*` - Catch-all redirects to home

## Manual Setup Required

To enable the router, make ONE of these changes to `src/main.tsx`:

### Option 1: Replace the render call
```tsx
import { createRoot } from "react-dom/client";
import AppRouter from "./router"; // Add this import
import "./index.css";

createRoot(document.getElementById("root")!).render(<AppRouter />); // Replace <App /> with <AppRouter />
```

### Option 2: Import and use directly
```tsx
import { createRoot } from "react-dom/client";
import { AppRouter } from "./router"; // Add this import
import "./index.css";

createRoot(document.getElementById("root")!).render(<AppRouter />); // Replace <App /> with <AppRouter />
```

## Features

- **Lazy Loading**: All pages are lazy-loaded for better performance
- **Protected Routes**: Dashboard, security, and features require authentication
- **Authentication**: Uses localStorage 'authToken' for auth checks
- **Fallback**: Loading spinner while components load
- **404 Handling**: Catch-all route with custom 404 page
- **Type Safety**: Full TypeScript support

## Notes

- All existing components remain unchanged
- Page wrappers import and render existing components
- Some import paths in Analytics and Files pages may need adjustment
- Authentication is client-side only (consider server-side validation for production)
- Router uses BrowserRouter (requires server configuration for SPA routing)

## Dependencies Required

Make sure `react-router-dom` is installed:
```bash
npm install react-router-dom
npm install --save-dev @types/react-router-dom
```
