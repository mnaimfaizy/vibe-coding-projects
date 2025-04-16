# Library Management System API

A RESTful API for managing a library system, built with Node.js, Express, TypeScript, and SQLite.

[![Test Coverage: 52.38%](https://img.shields.io/badge/Coverage-52.38%25-yellow.svg)](coverage/lcov-report/index.html)

## Features

- **User Authentication**

  - Register
  - Login
  - Logout
  - Change Password
  - Reset Password (with token-based verification)

- **Book Management**
  - Create books manually
  - Create books from ISBN using Open Library API
  - Update book details
  - Delete books
  - List all books
  - Get book details

## Tech Stack

- Node.js
- Express.js
- TypeScript
- SQLite (Database)
- JWT (Authentication)
- bcryptjs (Password hashing)
- axios (HTTP client for external API calls)

## Test Coverage

Current test coverage (as of April 16, 2025):

- Statements: 52.38%
- Branches: 25.74%
- Functions: 52.98%
- Lines: 50.61%

The project has 183 passing tests with varying coverage levels across components.

### Coverage by Component

- Config: 100%
- Controllers:
  - authController: 85.44%
  - authorsController: 9.03%
  - booksController: 4.98%
  - reviewsController: 3.67%
  - admin/userController: 97%
- Database: 100%
- Middleware: 100%
- Models: 100%
- Routes: 100%
- Utils: 100%

### Areas for Improvement

The main areas needing increased test coverage are:

- authorsController.ts
- booksController.ts
- reviewsController.ts

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository

```
git clone <repository-url>
cd library-api
```

2. Install dependencies

```
npm install
```

3. Create a `.env` file in the root directory with the following content:

```
PORT=3000
JWT_SECRET=your_jwt_secret_key_here
RESET_PASSWORD_EXPIRY=3600000
```

4. Build the project

```
npm run build
```

5. Start the server

```
npm start
```

For development:

```
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user

  - Body: `{ "name": "User Name", "email": "user@example.com", "password": "password123" }`

- `POST /api/auth/login` - Login user

  - Body: `{ "email": "user@example.com", "password": "password123" }`

- `POST /api/auth/logout` - Logout user (client-side token removal)

- `POST /api/auth/change-password` - Change user password (requires authentication)

  - Body: `{ "currentPassword": "password123", "newPassword": "newpassword123" }`

- `POST /api/auth/request-password-reset` - Request password reset

  - Body: `{ "email": "user@example.com" }`

- `POST /api/auth/reset-password` - Reset password with token
  - Body: `{ "token": "reset_token", "newPassword": "newpassword123" }`

### Books

- `GET /api/books` - Get all books

- `GET /api/books/:id` - Get book by ID

- `POST /api/books` - Create a book manually (requires authentication)

  - Body: `{ "title": "Book Title", "isbn": "1234567890", "publishYear": 2023, "author": "Author Name", "cover": "cover_url", "description": "Book description" }`

- `POST /api/books/isbn` - Create a book from ISBN (requires authentication)

  - Body: `{ "isbn": "1234567890" }`

- `PUT /api/books/:id` - Update a book (requires authentication)

  - Body: `{ "title": "Updated Title", ... }`

- `DELETE /api/books/:id` - Delete a book (requires authentication)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Protected routes require an `Authorization` header with a Bearer token:

```
Authorization: Bearer <your_token>
```

## License

This project is licensed under the MIT License.
