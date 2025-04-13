import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

// Connect to SQLite database
export const connectDatabase = async () => {
  try {
    // Create database connection
    const db = await open({
      filename: path.join(__dirname, "../../db/library.db"),
      driver: sqlite3.Database,
    });

    console.log("Connected to SQLite database");

    // Initialize database tables
    await initializeTables(db);

    return db;
  } catch (error) {
    console.error("Database connection error:", error);
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
      email_verified BOOLEAN DEFAULT 0,
      verification_token TEXT,
      verification_token_expires DATETIME,
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
    
    CREATE TABLE IF NOT EXISTS user_collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      bookId INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE,
      UNIQUE(userId, bookId)
    );
    
    CREATE TABLE IF NOT EXISTS reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      token TEXT NOT NULL,
      expiresAt DATETIME NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS authors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      biography TEXT,
      birth_date TEXT,
      photo_url TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS author_books (
      author_id INTEGER,
      book_id INTEGER,
      is_primary BOOLEAN DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (author_id, book_id),
      FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_author_books_author ON author_books(author_id);
    CREATE INDEX IF NOT EXISTS idx_author_books_book ON author_books(book_id);
  `);

  // Check if there are any authors to migrate from books table
  const existingBooks = await db.all(
    "SELECT id, author FROM books WHERE author IS NOT NULL AND author != ''"
  );

  for (const book of existingBooks) {
    // Split authors by comma (assuming they might be in format "Author 1, Author 2")
    const authorNames = book.author
      .split(",")
      .map((name: string) => name.trim())
      .filter((name: string) => name);

    if (authorNames.length > 0) {
      for (let i = 0; i < authorNames.length; i++) {
        const authorName = authorNames[i];

        // Check if author already exists
        let author = await db.get("SELECT id FROM authors WHERE name = ?", [
          authorName,
        ]);
        let authorId: number;

        if (!author) {
          // Create new author
          const result = await db.run("INSERT INTO authors (name) VALUES (?)", [
            authorName,
          ]);
          authorId = result.lastID;
        } else {
          authorId = author.id;
        }

        // Create relationship in junction table
        // First author is marked as primary
        await db.run(
          "INSERT OR IGNORE INTO author_books (author_id, book_id, is_primary) VALUES (?, ?, ?)",
          [authorId, book.id, i === 0 ? 1 : 0]
        );
      }
    }
  }

  console.log("Database tables initialized");
}
