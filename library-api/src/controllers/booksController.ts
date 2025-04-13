import { Request, Response } from "express";
import { connectDatabase } from "../db/database";
import axios from "axios";
import { Book } from "../models/Book";
import { Author } from "../models/Author";
import config from "../config/config";

// Rate limiting implementation
const rateLimitWindow = 60 * 1000; // 1 minute window
const maxRequests = 5; // Max 5 requests per minute to be respectful
let requestTimestamps: number[] = [];

/**
 * Simple rate limiter function
 * @returns Whether the request is allowed or not
 */
function isRateLimited(): boolean {
  const now = Date.now();
  // Clean up old timestamps
  requestTimestamps = requestTimestamps.filter(
    (timestamp) => now - timestamp < rateLimitWindow
  );

  // Check if we've reached the rate limit
  if (requestTimestamps.length >= maxRequests) {
    return true;
  }

  // Log this request
  requestTimestamps.push(now);
  return false;
}

// User agent for OpenLibrary API requests
const USER_AGENT =
  "LibraryManagementSystem/1.0 (https://example.com; library@example.com)";

// Common headers for all OpenLibrary API requests
const commonHeaders = {
  "User-Agent": USER_AGENT,
  Accept: "application/json",
};

/**
 * Get all books with their authors
 */
export const getAllBooks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const db = await connectDatabase();

    // Get all books
    const books = await db.all("SELECT * FROM books ORDER BY title");

    // For each book, get its authors
    for (const book of books) {
      const authors = await db.all(
        `
        SELECT a.* 
        FROM authors a
        JOIN author_books ab ON a.id = ab.author_id
        WHERE ab.book_id = ?
        ORDER BY ab.is_primary DESC, a.name
      `,
        [book.id]
      );

      book.authors = authors;
    }

    res.status(200).json({ books });
  } catch (error: any) {
    console.error("Error fetching books:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get a single book by ID with its authors
 */
export const getBookById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const db = await connectDatabase();
    const book = await db.get("SELECT * FROM books WHERE id = ?", [id]);

    if (!book) {
      res.status(404).json({ message: "Book not found" });
      return;
    }

    // Get the book's authors
    const authors = await db.all(
      `
      SELECT a.*, ab.is_primary 
      FROM authors a
      JOIN author_books ab ON a.id = ab.author_id
      WHERE ab.book_id = ?
      ORDER BY ab.is_primary DESC, a.name
    `,
      [id]
    );

    book.authors = authors;

    res.status(200).json({ book });
  } catch (error: any) {
    console.error("Error fetching book:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Create a book manually with provided details and optionally add to user collection
 */
export const createBookManually = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      isbn,
      publishYear,
      author, // For backward compatibility
      cover,
      description,
      authors, // New field for multiple authors
      addToCollection,
    } = req.body;
    const userId = (req as any).user?.id;

    // Validate input
    if (!title) {
      res.status(400).json({ message: "Title is required" });
      return;
    }

    const db = await connectDatabase();

    // Check if book already exists by ISBN
    let existingBook = null;
    if (isbn) {
      existingBook = await db.get("SELECT * FROM books WHERE isbn = ?", [isbn]);
      if (existingBook) {
        // If book exists and user wants to add to collection, add it directly
        if (addToCollection && userId) {
          await addBookToUserCollection(db, userId, existingBook.id);

          // Get the book's authors
          const bookAuthors = await db.all(
            `
            SELECT a.* 
            FROM authors a
            JOIN author_books ab ON a.id = ab.author_id
            WHERE ab.book_id = ?
          `,
            [existingBook.id]
          );

          existingBook.authors = bookAuthors;

          res.status(200).json({
            message: "Book already exists and was added to your collection",
            book: existingBook,
          });
        } else {
          res.status(400).json({
            message: "Book with this ISBN already exists in the catalog",
          });
        }
        return;
      }
    }

    // Start a transaction
    await db.run("BEGIN TRANSACTION");

    try {
      // Create new book
      const result = await db.run(
        `INSERT INTO books (title, isbn, publishYear, author, cover, description) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          title,
          isbn || null,
          publishYear || null,
          author || null, // Keep author field for backward compatibility
          cover || null,
          description || null,
        ]
      );

      const bookId = result.lastID;

      // Process authors
      if (authors && Array.isArray(authors) && authors.length > 0) {
        for (let i = 0; i < authors.length; i++) {
          const authorName = authors[i].name;

          if (!authorName) continue;

          // Check if author already exists
          let authorId;
          const existingAuthor = await db.get(
            "SELECT id FROM authors WHERE LOWER(name) = LOWER(?)",
            [authorName]
          );

          if (existingAuthor) {
            authorId = existingAuthor.id;
          } else {
            // Create new author
            const authorResult = await db.run(
              "INSERT INTO authors (name) VALUES (?)",
              [authorName]
            );
            authorId = authorResult.lastID;
          }

          // Create author-book relationship
          await db.run(
            "INSERT INTO author_books (author_id, book_id, is_primary) VALUES (?, ?, ?)",
            [authorId, bookId, i === 0 ? 1 : 0] // First author is primary
          );
        }
      }
      // If no authors array but author string is provided (backward compatibility)
      else if (author) {
        // Split author string in case it contains multiple names
        const authorNames = author
          .split(/,\s*/)
          .filter((name: string) => name.trim() !== "");

        for (let i = 0; i < authorNames.length; i++) {
          const authorName = authorNames[i].trim();

          // Check if author already exists
          let authorId;
          const existingAuthor = await db.get(
            "SELECT id FROM authors WHERE LOWER(name) = LOWER(?)",
            [authorName]
          );

          if (existingAuthor) {
            authorId = existingAuthor.id;
          } else {
            // Create new author
            const authorResult = await db.run(
              "INSERT INTO authors (name) VALUES (?)",
              [authorName]
            );
            authorId = authorResult.lastID;
          }

          // Create author-book relationship
          await db.run(
            "INSERT INTO author_books (author_id, book_id, is_primary) VALUES (?, ?, ?)",
            [authorId, bookId, i === 0 ? 1 : 0] // First author is primary
          );
        }
      }

      // Commit transaction
      await db.run("COMMIT");

      // Get the complete book with authors
      const newBook = await db.get("SELECT * FROM books WHERE id = ?", [
        bookId,
      ]);
      const bookAuthors = await db.all(
        `
        SELECT a.*, ab.is_primary 
        FROM authors a
        JOIN author_books ab ON a.id = ab.author_id
        WHERE ab.book_id = ?
        ORDER BY ab.is_primary DESC, a.name
      `,
        [bookId]
      );

      newBook.authors = bookAuthors;

      // Add to user collection if requested
      if (addToCollection && userId && bookId) {
        await addBookToUserCollection(db, userId, bookId);
        res.status(201).json({
          message: "Book created successfully and added to your collection",
          book: newBook,
        });
      } else {
        res.status(201).json({
          message: "Book created successfully",
          book: newBook,
        });
      }
    } catch (error) {
      // Rollback transaction on error
      await db.run("ROLLBACK");
      throw error;
    }
  } catch (error: any) {
    console.error("Error creating book:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Create a book using ISBN and Open Library API and optionally add to user collection
 */
export const createBookByIsbn = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { isbn, addToCollection } = req.body;
    const userId = (req as any).user?.id;

    if (!isbn) {
      res.status(400).json({ message: "ISBN is required" });
      return;
    }

    // Apply rate limiting
    if (isRateLimited()) {
      res.status(429).json({
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil(rateLimitWindow / 1000),
      });
      return;
    }

    const db = await connectDatabase();

    // Check if book with ISBN already exists
    const existingBook = await db.get("SELECT * FROM books WHERE isbn = ?", [
      isbn,
    ]);

    if (existingBook) {
      // If book exists and user wants to add to collection, add it directly
      if (addToCollection && userId) {
        await addBookToUserCollection(db, userId, existingBook.id);

        // Get the book's authors
        const bookAuthors = await db.all(
          `
          SELECT a.* 
          FROM authors a
          JOIN author_books ab ON a.id = ab.author_id
          WHERE ab.book_id = ?
        `,
          [existingBook.id]
        );

        existingBook.authors = bookAuthors;

        res.status(200).json({
          message: "Book already exists and was added to your collection",
          book: existingBook,
        });
      } else {
        res.status(400).json({
          message: "Book with this ISBN already exists in the catalog",
        });
      }
      return;
    }

    // Fetch book details from Open Library API
    const response = await axios.get(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
      {
        headers: commonHeaders,
      }
    );

    const bookKey = `ISBN:${isbn}`;
    if (!response.data[bookKey]) {
      res.status(404).json({ message: "Book not found with this ISBN" });
      return;
    }

    const bookData = response.data[bookKey];

    // Extract relevant data
    const title = bookData.title || "Unknown Title";
    const publishYear = bookData.publish_date
      ? parseInt(bookData.publish_date.slice(-4))
      : null;
    const cover = bookData.cover?.medium || null;
    const description =
      bookData.description?.value || bookData.description || null;

    // Extract authors data
    const authors = bookData.authors
      ? bookData.authors.map((author: any) => ({
          name: author.name,
          url: author.url,
        }))
      : [{ name: "Unknown Author" }];

    // Convert authors to string for backward compatibility
    const authorString = authors
      .map((a: { name: string }) => a.name)
      .join(", ");

    // Start a transaction
    await db.run("BEGIN TRANSACTION");

    try {
      // Create book in database
      const result = await db.run(
        `INSERT INTO books (title, isbn, publishYear, author, cover, description) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [title, isbn, publishYear, authorString, cover, description]
      );

      const bookId = result.lastID;

      // Process authors
      if (authors && authors.length > 0) {
        for (let i = 0; i < authors.length; i++) {
          const authorName = authors[i].name;

          // Check if author already exists
          let authorId;
          const existingAuthor = await db.get(
            "SELECT id FROM authors WHERE LOWER(name) = LOWER(?)",
            [authorName]
          );

          if (existingAuthor) {
            authorId = existingAuthor.id;
          } else {
            // Create new author
            const authorResult = await db.run(
              "INSERT INTO authors (name) VALUES (?)",
              [authorName]
            );
            authorId = authorResult.lastID;
          }

          // Create author-book relationship
          await db.run(
            "INSERT INTO author_books (author_id, book_id, is_primary) VALUES (?, ?, ?)",
            [authorId, bookId, i === 0 ? 1 : 0] // First author is primary
          );
        }
      }

      // Commit transaction
      await db.run("COMMIT");

      // Get the complete book with authors
      const newBook = await db.get("SELECT * FROM books WHERE id = ?", [
        bookId,
      ]);
      const bookAuthors = await db.all(
        `
        SELECT a.*, ab.is_primary 
        FROM authors a
        JOIN author_books ab ON a.id = ab.author_id
        WHERE ab.book_id = ?
        ORDER BY ab.is_primary DESC, a.name
      `,
        [bookId]
      );

      newBook.authors = bookAuthors;

      // Add to user collection if requested
      if (addToCollection && userId && bookId) {
        await addBookToUserCollection(db, userId, bookId);
        res.status(201).json({
          message:
            "Book created successfully from ISBN and added to your collection",
          book: newBook,
        });
      } else {
        res.status(201).json({
          message: "Book created successfully from ISBN",
          book: newBook,
        });
      }
    } catch (error) {
      // Rollback transaction on error
      await db.run("ROLLBACK");
      throw error;
    }
  } catch (error: any) {
    console.error("Error creating book by ISBN:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update a book, including its author relationships
 */
export const updateBook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      isbn,
      publishYear,
      author, // For backward compatibility
      cover,
      description,
      authors, // New field for multiple authors
    } = req.body;

    // Validate input
    if (!title) {
      res.status(400).json({ message: "Title is required" });
      return;
    }

    const db = await connectDatabase();

    // Check if book exists
    const book = await db.get("SELECT * FROM books WHERE id = ?", [id]);
    if (!book) {
      res.status(404).json({ message: "Book not found" });
      return;
    }

    // Check if ISBN is unique (if provided)
    if (isbn && isbn !== book.isbn) {
      const existingBook = await db.get(
        "SELECT * FROM books WHERE isbn = ? AND id != ?",
        [isbn, id]
      );
      if (existingBook) {
        res.status(400).json({ message: "Book with this ISBN already exists" });
        return;
      }
    }

    // Start a transaction
    await db.run("BEGIN TRANSACTION");

    try {
      // Update book
      await db.run(
        `UPDATE books 
         SET title = ?, isbn = ?, publishYear = ?, author = ?, cover = ?, description = ?, updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          title,
          isbn || null,
          publishYear || null,
          author || null, // Keep author field for backward compatibility
          cover || null,
          description || null,
          id,
        ]
      );

      // Handle author relationships
      if (authors && Array.isArray(authors)) {
        // Remove existing author-book relationships
        await db.run("DELETE FROM author_books WHERE book_id = ?", [id]);

        // Create new author-book relationships
        for (let i = 0; i < authors.length; i++) {
          const authorName = authors[i].name;
          const authorId = authors[i].id;

          if (!authorName) continue;

          let dbAuthorId = authorId;

          // If no ID provided, check if author already exists by name
          if (!dbAuthorId) {
            const existingAuthor = await db.get(
              "SELECT id FROM authors WHERE LOWER(name) = LOWER(?)",
              [authorName]
            );

            if (existingAuthor) {
              dbAuthorId = existingAuthor.id;
            } else {
              // Create new author
              const authorResult = await db.run(
                "INSERT INTO authors (name) VALUES (?)",
                [authorName]
              );
              dbAuthorId = authorResult.lastID;
            }
          }

          // Create author-book relationship
          await db.run(
            "INSERT INTO author_books (author_id, book_id, is_primary) VALUES (?, ?, ?)",
            [dbAuthorId, id, i === 0 ? 1 : 0] // First author is primary
          );
        }
      }
      // If no authors array but author string is provided (backward compatibility)
      else if (author) {
        // Remove existing author-book relationships
        await db.run("DELETE FROM author_books WHERE book_id = ?", [id]);

        // Split author string in case it contains multiple names
        const authorNames = author
          .split(/,\s*/)
          .filter((name: string) => name.trim() !== "");

        for (let i = 0; i < authorNames.length; i++) {
          const authorName = authorNames[i].trim();

          // Check if author already exists
          let authorId;
          const existingAuthor = await db.get(
            "SELECT id FROM authors WHERE LOWER(name) = LOWER(?)",
            [authorName]
          );

          if (existingAuthor) {
            authorId = existingAuthor.id;
          } else {
            // Create new author
            const authorResult = await db.run(
              "INSERT INTO authors (name) VALUES (?)",
              [authorName]
            );
            authorId = authorResult.lastID;
          }

          // Create author-book relationship
          await db.run(
            "INSERT INTO author_books (author_id, book_id, is_primary) VALUES (?, ?, ?)",
            [authorId, id, i === 0 ? 1 : 0] // First author is primary
          );
        }
      }

      // Commit transaction
      await db.run("COMMIT");

      // Get the updated book with authors
      const updatedBook = await db.get("SELECT * FROM books WHERE id = ?", [
        id,
      ]);
      const bookAuthors = await db.all(
        `
        SELECT a.*, ab.is_primary 
        FROM authors a
        JOIN author_books ab ON a.id = ab.author_id
        WHERE ab.book_id = ?
        ORDER BY ab.is_primary DESC, a.name
      `,
        [id]
      );

      updatedBook.authors = bookAuthors;

      res.status(200).json({
        message: "Book updated successfully",
        book: updatedBook,
      });
    } catch (error) {
      // Rollback transaction on error
      await db.run("ROLLBACK");
      throw error;
    }
  } catch (error: any) {
    console.error("Error updating book:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Delete a book
 */
export const deleteBook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const db = await connectDatabase();

    // Check if book exists
    const book = await db.get("SELECT * FROM books WHERE id = ?", [id]);
    if (!book) {
      res.status(404).json({ message: "Book not found" });
      return;
    }

    // Delete book - this will also cascade delete entries in author_books and user_collections
    await db.run("DELETE FROM books WHERE id = ?", [id]);

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting book:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Search books in our database
 */
export const searchBooks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q) {
      res.status(400).json({ message: "Search query is required" });
      return;
    }

    const searchQuery = `%${q}%`;

    const db = await connectDatabase();

    // Search books by title, description, or via authors
    const books = await db.all(
      `
      SELECT DISTINCT b.* 
      FROM books b
      LEFT JOIN author_books ab ON b.id = ab.book_id
      LEFT JOIN authors a ON ab.author_id = a.id
      WHERE 
        b.title LIKE ? OR 
        b.description LIKE ? OR
        b.author LIKE ? OR
        a.name LIKE ?
      ORDER BY b.title
    `,
      [searchQuery, searchQuery, searchQuery, searchQuery]
    );

    // Get authors for each book
    for (const book of books) {
      const authors = await db.all(
        `
        SELECT a.*, ab.is_primary 
        FROM authors a
        JOIN author_books ab ON a.id = ab.author_id
        WHERE ab.book_id = ?
        ORDER BY ab.is_primary DESC, a.name
      `,
        [book.id]
      );

      book.authors = authors;
    }

    res.status(200).json({ books });
  } catch (error: any) {
    console.error("Error searching books:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ... the rest of the file remains mostly the same

/**
 * Search Open Library for books by ISBN, title, or author
 */
export const searchOpenLibrary = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { query, type } = req.query;

    if (!query) {
      res.status(400).json({ message: "Search query is required" });
      return;
    }

    // Apply rate limiting
    if (isRateLimited()) {
      res.status(429).json({
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil(rateLimitWindow / 1000),
      });
      return;
    }

    let searchUrl: string;
    let searchType = type?.toString().toLowerCase() || "";
    const searchQuery = encodeURIComponent(query.toString());

    // Determine which endpoint to use based on search type
    if (searchType === "isbn") {
      // ISBN search - should return a single book with exact match
      searchUrl = `https://openlibrary.org/api/books?bibkeys=ISBN:${searchQuery}&format=json&jscmd=data`;

      const response = await axios.get(searchUrl, { headers: commonHeaders });

      const bookKey = `ISBN:${searchQuery}`;
      if (!response.data[bookKey]) {
        res.status(404).json({ message: "Book not found with this ISBN" });
        return;
      }

      // Format the book data for our API
      const bookData = response.data[bookKey];
      const book = {
        title: bookData.title || "Unknown Title",
        author: bookData.authors
          ? bookData.authors.map((a: any) => a.name).join(", ")
          : "Unknown Author",
        publishYear: bookData.publish_date
          ? parseInt(bookData.publish_date.slice(-4))
          : null,
        isbn: searchQuery,
        cover: bookData.cover?.medium || null,
        description:
          bookData.description?.value || bookData.description || null,
        publisher: bookData.publishers?.[0] || null,
        subjects: bookData.subjects?.map((s: any) => s.name || s) || [],
        url: bookData.url || `https://openlibrary.org/isbn/${searchQuery}`,
      };

      res.status(200).json({ book });
    } else if (searchType === "author") {
      // Author search - returns multiple books by the author
      searchUrl = `https://openlibrary.org/search/authors.json?q=${searchQuery}`;

      const authorsResponse = await axios.get(searchUrl, {
        headers: commonHeaders,
      });

      if (
        !authorsResponse.data.docs ||
        authorsResponse.data.docs.length === 0
      ) {
        res
          .status(404)
          .json({ message: "No authors found matching the query" });
        return;
      }

      // Get the first matching author's key
      const authorKey = authorsResponse.data.docs[0].key;

      // Get works by this author
      const worksUrl = `https://openlibrary.org/authors/${authorKey}/works.json?limit=20`;
      const worksResponse = await axios.get(worksUrl, {
        headers: commonHeaders,
      });

      if (
        !worksResponse.data.entries ||
        worksResponse.data.entries.length === 0
      ) {
        res.status(404).json({ message: "No books found for this author" });
        return;
      }

      // Format the books data
      const books = worksResponse.data.entries.map((work: any) => ({
        title: work.title || "Unknown Title",
        author: authorsResponse.data.docs[0].name || "Unknown Author",
        workKey: work.key,
        coverId: work.covers?.[0] || null,
        cover: work.covers?.[0]
          ? `https://covers.openlibrary.org/b/id/${work.covers[0]}-M.jpg`
          : null,
        firstPublishYear: work.first_publish_year || null,
        url: `https://openlibrary.org${work.key}`,
        description: work.description?.value || work.description || null,
      }));

      res.status(200).json({
        author: authorsResponse.data.docs[0].name,
        books,
        total: worksResponse.data.size || books.length,
      });
    } else {
      // Default to title search - returns multiple books matching the title
      searchUrl = `https://openlibrary.org/search.json?title=${searchQuery}&limit=20`;

      const response = await axios.get(searchUrl, { headers: commonHeaders });

      if (!response.data.docs || response.data.docs.length === 0) {
        res.status(404).json({ message: "No books found matching the query" });
        return;
      }

      // Format the books data
      const books = response.data.docs.map((book: any) => ({
        title: book.title || "Unknown Title",
        author: book.author_name
          ? book.author_name.join(", ")
          : "Unknown Author",
        firstPublishYear: book.first_publish_year || null,
        isbn: book.isbn?.[0] || null,
        coverId: book.cover_i || null,
        cover: book.cover_i
          ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
          : null,
        key: book.key,
        url: `https://openlibrary.org${book.key}`,
        languages: book.language || [],
        publishers: book.publisher || [],
      }));

      res.status(200).json({
        books,
        total: response.data.numFound,
        offset: response.data.start,
        limit: books.length,
      });
    }
  } catch (error: any) {
    console.error("Error searching Open Library:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Add a book to a user's collection
 */
export const addToUserCollection = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { bookId } = req.body;
    const userId = (req as any).user?.id;

    if (!bookId) {
      res.status(400).json({ message: "Book ID is required" });
      return;
    }

    const db = await connectDatabase();

    // Check if book exists
    const book = await db.get("SELECT * FROM books WHERE id = ?", [bookId]);
    if (!book) {
      res.status(404).json({ message: "Book not found" });
      return;
    }

    // Add to user collection
    await addBookToUserCollection(db, userId, bookId);

    res.status(201).json({
      message: "Book added to your collection successfully",
    });
  } catch (error: any) {
    console.error("Error adding book to collection:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Remove a book from a user's collection
 */
export const removeFromUserCollection = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { bookId } = req.params;
    const userId = (req as any).user?.id;

    const db = await connectDatabase();

    // Check if the book is in the user's collection
    const userBook = await db.get(
      "SELECT * FROM user_collections WHERE userId = ? AND bookId = ?",
      [userId, bookId]
    );

    if (!userBook) {
      res.status(404).json({ message: "Book not found in your collection" });
      return;
    }

    // Remove from user collection
    await db.run(
      "DELETE FROM user_collections WHERE userId = ? AND bookId = ?",
      [userId, bookId]
    );

    res.status(200).json({
      message: "Book removed from your collection successfully",
    });
  } catch (error: any) {
    console.error("Error removing book from collection:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get a user's book collection
 */
export const getUserCollection = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    const db = await connectDatabase();

    // Get all books in the user's collection
    const books = await db.all(
      `
      SELECT b.* 
      FROM books b
      JOIN user_collections uc ON b.id = uc.bookId
      WHERE uc.userId = ?
      ORDER BY b.title
    `,
      [userId]
    );

    // Get authors for each book
    for (const book of books) {
      const authors = await db.all(
        `
        SELECT a.*, ab.is_primary 
        FROM authors a
        JOIN author_books ab ON a.id = ab.author_id
        WHERE ab.book_id = ?
        ORDER BY ab.is_primary DESC, a.name
      `,
        [book.id]
      );

      book.authors = authors;
    }

    res.status(200).json({ books });
  } catch (error: any) {
    console.error("Error fetching user collection:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Helper function to add a book to a user's collection
 */
async function addBookToUserCollection(
  db: any,
  userId: number,
  bookId: number
): Promise<void> {
  try {
    // Check if the book is already in the user's collection
    const existingEntry = await db.get(
      "SELECT * FROM user_collections WHERE userId = ? AND bookId = ?",
      [userId, bookId]
    );

    if (existingEntry) {
      return; // Book is already in the collection, no need to add again
    }

    // Add to user collection
    await db.run(
      `INSERT INTO user_collections (userId, bookId) VALUES (?, ?)`,
      [userId, bookId]
    );
  } catch (error) {
    console.error("Error in addBookToUserCollection:", error);
    throw error;
  }
}
