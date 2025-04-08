# Library UI

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
