# Vibe Coding Projects

This repository contains a collection of AI-assisted coding projects. Each project in this repository was developed with the help of AI tools to demonstrate modern development techniques and practices.

## Projects

### Library API

**Technology Stack:**

- Node.js
- Express
- TypeScript
- SQLite
- JWT Authentication
- OpenAPI/Swagger

**Test Coverage:** ![Test Coverage: 94%](https://img.shields.io/badge/coverage-94%25-brightgreen)

**Purpose:**
The Library API provides a comprehensive backend service for managing a digital library system. It offers a RESTful API for book management, user authentication, and collection handling. Key features include:

- User authentication with JWT
- Book management (CRUD operations)
- Author management
- User collections
- Reviews and ratings
- Admin dashboard functionality
- OpenAPI documentation with Swagger UI
- Rate limiting for external API requests

The API is fully tested with both unit and integration tests, achieving over 94% code coverage.

### Library UI

**Technology Stack:**

- React 18
- TypeScript 5.0
- Vite
- Tailwind CSS
- Shadcn/UI Component Library
- Vitest for testing

**Test Coverage:** ![Test Coverage: 46.64%](https://img.shields.io/badge/coverage-46.64%25-yellow)

**Purpose:**
The Library UI is a modern frontend application for managing a digital library system. It provides a comprehensive interface for browsing, searching, and managing books, authors, and user collections. Key features include:

- User authentication and role-based access control
- Book catalog browsing with advanced search capabilities
- Personal book collection management
- Author information and bibliography viewing
- Admin dashboard for managing books, authors, and users
- Responsive design that works on desktop and mobile devices

The application is built with modern React patterns including hooks, context API, and component composition to create a maintainable and extensible codebase. The test suite includes 222 passing tests covering unit tests, component tests, and integration tests for key user flows. Service files are particularly well covered (96-100%), while UI components have varying degrees of coverage. Core components like authentication, user collection management, and book details have excellent coverage.

### Library Mobile

**Technology Stack:**

- React Native 0.76.9
- Expo SDK 52
- TypeScript 5.3
- Expo Router 4.0
- React Native Paper
- Axios
- Expo SecureStore

**Purpose:**
The Library Mobile app provides the digital library management system experience on mobile devices, integrating with the same Library API backend. Key features include:

- User authentication with email verification and password reset
- Book browsing and detailed information viewing
- Personal collections management
- Review and rating capabilities
- User profile management
- Responsive native mobile experience with theme support
- Haptic feedback and smooth animations
- Offline data caching

The application is built with a modern React Native architecture using Expo's managed workflow, with well-organized component structure and comprehensive type safety through TypeScript.

### React Survey App

**Technology Stack:**

- React 19
- TypeScript 4.9
- React Testing Library
- CSS for styling

**Purpose:**
The React Survey App is an interactive survey application focused on collecting electronic product feedback. It provides a smooth, step-by-step survey experience with various question types including multiple-choice ratings and comment fields. The application features:

- Progressive survey interface with a progress bar
- Multiple-choice questions with standardized rating options
- Free-text comment capabilities
- Responsive design
- Thank you screen upon completion

**Features:**

- Clean component architecture with proper separation of concerns
- TypeScript for type safety and improved developer experience
- Customer satisfaction measurement for electronic products
- Follows accessibility standards
- Easy to extend with new question types or survey logic

## About This Repository

This repository serves as a showcase of projects developed with AI assistance. Each project follows modern best practices and design patterns while demonstrating practical implementations of common web application features.

The code is intended to be educational and can serve as a starting point for similar projects or as a reference for implementing specific features in your own applications.

## Getting Started

Each project has its own directory with specific setup instructions. Please navigate to the project of interest and follow the README instructions within that directory.

## Contributing

Feel free to explore the code, suggest improvements, or adapt it for your own projects. If you'd like to contribute to any of these projects, please submit a pull request with your proposed changes.

## License

All projects in this repository are open source and available for personal and commercial use.
