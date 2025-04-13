# GitHub Copilot Instructions for Library API

## Project Overview

This is a RESTful API for a library management system built with:

- Node.js and Express.js
- TypeScript
- SQLite database
- JWT for authentication
- Nodemailer for email notifications
- Integrates with OpenLibrary API for book data

## Project Architecture

### Directory Structure

```
library-api/
├── db/                  # Database files
│   └── library.db       # SQLite database
├── src/                 # Source code
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── db/              # Database connection and setup
│   ├── middleware/      # Express middleware
│   ├── models/          # Data models/interfaces
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions and helpers
│   └── index.ts         # Application entry point
├── Dockerfile           # Docker configuration
├── package.json         # NPM dependencies
└── tsconfig.json        # TypeScript configuration
```

### Core Components

#### 1. Models

- `User.ts` - User account model
- `Book.ts` - Book information model
- `Author.ts` - Author information model
- `UserCollection.ts` - User's book collection model

#### 2. Controllers

- `authController.ts` - User authentication logic
- `booksController.ts` - Book management logic
- `authorsController.ts` - Author management logic

#### 3. Routes

- `authRoutes.ts` - Authentication endpoints
- `bookRoutes.ts` - Book management endpoints
- `authorRoutes.ts` - Author management endpoints

#### 4. Database

- SQLite database with tables for users, books, authors, and user collections
- Many-to-many relationship between books and authors via author_books junction table

## Coding Standards & Practices

### TypeScript

- Use TypeScript interfaces for defining data models
- Maintain strict type checking
- Use async/await for asynchronous operations

### API Design

- Follow RESTful API principles
- Use proper HTTP status codes
- Implement rate limiting for external API calls
- Structure endpoints like `/api/[resource]`

### Database Operations

- Use parameterized queries to prevent SQL injection
- Implement transactions for multi-step database operations
- Check for existing records before insertion to prevent duplicates

### Authentication

- Use JWT (JSON Web Tokens) for authentication
- Implement middleware to protect routes
- Store hashed passwords using bcryptjs
- Include token expiration and verification

### Error Handling

- Use try-catch blocks for error handling
- Return appropriate error responses with meaningful messages
- Log errors for debugging

## Common Patterns

### Database Access

```typescript
// Pattern for database operations
const db = await connectDatabase();
try {
  // Start a transaction for multi-step operations
  await db.run("BEGIN TRANSACTION");

  // Execute database operations

  // Commit if successful
  await db.run("COMMIT");
} catch (error) {
  // Rollback on error
  await db.run("ROLLBACK");
  throw error;
}
```

### Authentication Middleware

```typescript
// Protected route pattern
router.get("/protected-resource", auth, controllerFunction);
```

### Error Response Pattern

```typescript
try {
  // Operation code
} catch (error: any) {
  console.error("Error description:", error.message);
  res.status(500).json({ message: "Error message", error: error.message });
}
```

## Best Practices

### 1. When Adding New Features

- Keep the existing architecture and patterns consistent
- Add new models in the models directory
- Add new controllers in the controllers directory
- Register new routes in the appropriate route file and in index.ts

### 2. Database Schema Changes

- Update the `initializeTables` function in `database.ts`
- Add migration code if needed to handle existing data

### 3. External API Integration

- Use rate limiting to prevent abuse of external APIs
- Cache frequently accessed data when appropriate
- Use proper error handling for external API calls

### 4. Authentication

- Always use the auth middleware for protected routes
- Validate user input thoroughly
- Follow security best practices for password handling

### 5. Code Style

- Use camelCase for variables and functions
- Use PascalCase for interfaces and types
- Add appropriate comments for complex logic
- Keep functions focused on a single responsibility

## Common Tasks

### Adding a New API Endpoint

1. Create or update model interface in `src/models/`
2. Add controller function in `src/controllers/`
3. Add route in appropriate route file in `src/routes/`
4. Register the route in `src/index.ts` if adding a new resource

### Adding a New Database Table

1. Update `initializeTables` function in `src/db/database.ts`
2. Create corresponding model interface in `src/models/`
3. Add appropriate controllers and routes

## Testing

- Ensure all API endpoints return expected responses
- Verify database operations with correct data
- Test authentication and authorization flows

## Deployment

- The application is containerized using Docker
- Configure environment variables according to deployment environment
- Ensure database persistence in production environment
