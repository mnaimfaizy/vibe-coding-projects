import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
  // Server configuration
  port: process.env.PORT || 3000,
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret',
    expiresIn: '24h' // Token expiry time
  },
  
  // Password reset configuration
  resetPassword: {
    expiryTime: parseInt(process.env.RESET_PASSWORD_EXPIRY || '3600000') // Default: 1 hour
  },
  
  // Open Library API (for fetching book details by ISBN)
  openLibrary: {
    baseUrl: 'https://openlibrary.org/api'
  }
};

export default config;