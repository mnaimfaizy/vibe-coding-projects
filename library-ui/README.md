# Library UI

![Coverage](https://img.shields.io/badge/coverage-6.97%25-red)

A modern, responsive user interface for a library management system built with React, TypeScript, and Vite.

## 📚 Project Overview

Library UI provides a comprehensive interface for managing a library's digital presence. It supports user authentication, book browsing, and book management functionalities.

## ✨ Features

- **User Authentication**

  - Login & Signup
  - Password Management (Reset, Change)
  - Email Verification

- **Book Management**

  - Browse books in catalog or list view
  - Add new books
  - Edit existing books
  - Book details view

- **Modern UI Components**
  - Responsive design with Tailwind CSS
  - Accessible components using Radix UI primitives
  - Custom UI component library

## 🛠️ Tech Stack

- **React 19** - Frontend library
- **TypeScript** - Static type checking
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible UI components
- **Lucide React** - Icon library
- **Shadcn UI** - Component collection based on Radix UI

## 🚀 Getting Started

### Prerequisites

- Node.js (recommended: latest LTS version)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the library-ui directory:
   ```
   cd library-ui
   ```
3. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn
   ```

### Development

Start the development server:

```
npm run dev
```

or

```
yarn dev
```

Open your browser and visit `http://localhost:5173`

### Building for Production

Build the project:

```
npm run build
```

or

```
yarn build
```

Preview the production build:

```
npm run preview
```

or

```
yarn preview
```

## 📊 Test Coverage

Current test coverage metrics:

- **6.97%** statement coverage
- **68.5%** branch coverage
- **55.17%** function coverage
- **6.97%** line coverage

Test coverage is measured using [Vitest](https://vitest.dev/) with the v8 coverage provider. To run the coverage report locally:

```
npm run test:coverage
```

### Coverage Report Visualization

The coverage report will be generated in the `coverage` directory, providing detailed information about which parts of the codebase are covered by tests.

Areas that currently need improved test coverage:

- Most UI components (0% coverage)
- App entry points (App.tsx, main.tsx)
- Components in directories like `/components/about`, `/components/admin`, `/components/auth`, `/components/books`, etc.
- Store and state management code

The `services` directory has good coverage at 96.58%, but we need to improve coverage across the rest of the application to reach our goal of 100% test coverage.

## 🔗 Related Projects

This UI interfaces with the library-api backend service located in the parent directory.

## 📊 Project Structure

```
library-ui/
├── public/            # Static assets
├── src/
│   ├── assets/        # Project assets (images, etc.)
│   ├── components/    # UI components
│   │   ├── auth/      # Authentication components
│   │   ├── books/     # Book management components
│   │   ├── landing/   # Landing page components
│   │   ├── shared/    # Shared components (Header, Footer, etc.)
│   │   └── ui/        # Base UI components
│   ├── lib/           # Library code and utilities
│   ├── App.tsx        # Main application component
│   └── main.tsx       # Application entry point
└── [config files]     # Various configuration files
```

## 📝 License

This project is licensed under the MIT License.
