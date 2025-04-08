import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Connect to SQLite database
export const connectDatabase = async () => {
  try {
    // Create database connection
    const db = await open({
      filename: path.join(__dirname, '../../library.db'),
      driver: sqlite3.Database
    });
    
    console.log('Connected to SQLite database');
    
    // Initialize database tables
    await initializeTables(db);
    
    return db;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

// Initialize necessary tables if they don't exist
async function initializeTables(db: any): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      isbn TEXT UNIQUE,
      publishYear INTEGER,
      author TEXT,
      cover TEXT,
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      token TEXT NOT NULL,
      expiresAt DATETIME NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  
  console.log('Database tables initialized');
}