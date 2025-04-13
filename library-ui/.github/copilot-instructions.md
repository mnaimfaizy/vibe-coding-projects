# Library UI Project - AI Assistant Instructions

## Project Overview

The Library UI is a React-based frontend application for a library management system. It allows users to browse, search, and manage books, manage their personal book collections, and interact with author information. The application provides a complete authentication system and integrates with a backend API.

## Project Architecture

### Technology Stack

- **React 19** with **TypeScript**
- **Vite** as the build tool and development server
- **React Router** (v7) for navigation
- **Redux Toolkit** for state management
- **Axios** for API communication
- **Tailwind CSS** for styling
- **Shadcn UI** components library (built on top of Radix UI)
- **React Hook Form** with **Zod** for form handling and validation

### Project Structure

- `/src` - Main source code directory
  - `/assets` - Static assets like images and SVGs
  - `/components` - React components organized by feature
    - `/auth` - Authentication related components (login, signup, etc.)
    - `/books` - Book management components (listing, details, editing)
    - `/landing` - Landing page components
    - `/profile` - User profile management
    - `/shared` - Common layout components (header, footer, navigation)
    - `/ui` - Reusable UI components (buttons, forms, modals, etc.)
  - `/lib` - Utility libraries and helper functions
  - `/services` - API service layer
  - `/store` - Redux store configuration and slices
  - `App.tsx` - Main application component with routing definitions
  - `main.tsx` - Application entry point

## Key Features

### Authentication System

The application uses token-based authentication with JWT. The authentication flow includes:

1. User registration (signup)
2. Email verification
3. Login/logout
4. Password reset functionality
5. Profile management

Authentication state is managed in Redux and tokens are stored in localStorage. The `AuthGuard` component protects routes that require authentication.

### Book Management

Users can:

- Browse the library catalog
- Search for books (both in local database and via Open Library API)
- View detailed book information
- Add books to their personal collection
- Add new books to the library (admin feature)
- Edit and delete books (admin feature)

### API Integration

- The application communicates with a backend API using Axios
- API requests are configured with interceptors for authentication and error handling
- Services are organized by domain (auth, books, authors)

## Development Guidelines

### Adding New Features

1. Create new components in the appropriate directory under `/components`
2. For API integration, add service methods to the relevant service file
3. For new routes, update the routing configuration in `App.tsx`
4. For new state management, add slices to the Redux store

### UI Components

- Use the existing Shadcn UI components whenever possible
- Follow the established patterns for forms, buttons, and layouts
- Theme customization is handled in `tailwind.config.js`

### Data Flow

1. User interactions trigger component events
2. Components call service methods to interact with the API
3. Services make API requests and return responses
4. State updates are managed through Redux actions and reducers
5. Components re-render based on state changes from Redux

### Navigation

The application uses a custom navigation utility to allow programmatic navigation from non-component code (like services). Use the `appNavigate` function from `/lib/navigation` for redirects.

## Error Handling

- API errors are handled in the service layer and exposed to components
- The application uses toast notifications for user feedback
- Authentication errors automatically redirect to the login page

## Testing

When writing tests, focus on:

- Component rendering
- User interaction flows
- API service mocking
- Redux state management

## Common Development Tasks

### Adding a New Page

1. Create the page component in the appropriate directory
2. Add a route in `App.tsx`
3. Update navigation links if needed

### Adding a New API Endpoint

1. Add the appropriate method to the relevant service file
2. Create interfaces for request/response data
3. Implement error handling

### Adding New UI Components

1. Check if there's an existing Shadcn UI component first
2. For custom components, create them in the `/components/ui` directory
3. Follow the project's styling conventions using Tailwind CSS

## Build and Deployment

- Development server: `npm run dev`
- Production build: `npm run build`
- The application is containerized with Docker for easy deployment

## Backend Integration

The application expects a REST API backend with the following endpoints:

- `/api/auth/*` - Authentication endpoints
- `/api/books/*` - Book management endpoints
- `/api/authors/*` - Author management endpoints

## Troubleshooting Common Issues

1. Authentication issues: Check localStorage token and Redux auth state
2. API connection errors: Verify API_BASE_URL in api.ts
3. Component rendering problems: Check prop passing and Redux connections
4. Styling issues: Check Tailwind classes and component styles
