import { Request, Response } from "express";
import { connectDatabase } from "../db/database";
import axios from "axios";
import { Book } from "../models/Book";
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
 * Get all books
 */
export const getAllBooks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const db = await connectDatabase();
    const books = await db.all("SELECT * FROM books ORDER BY title");

    res.status(200).json({ books });
  } catch (error: any) {
    console.error("Error fetching books:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get a single book by ID
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

    res.status(200).json({ book });
  } catch (error: any) {
    console.error("Error fetching book:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Create a book manually with provided details
 */
export const createBookManually = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, isbn, publishYear, author, cover, description } = req.body;

    // Validate input
    if (!title) {
      res.status(400).json({ message: "Title is required" });
      return;
    }

    const db = await connectDatabase();

    // Check if book already exists by ISBN or title+author
    let existingBook = null;

    // Check by ISBN first if available
    if (isbn) {
      existingBook = await db.get("SELECT * FROM books WHERE isbn = ?", [isbn]);
      if (existingBook) {
        res
          .status(400)
          .json({
            message: "Book with this ISBN already exists in your collection",
          });
        return;
      }
    }

    // If no ISBN or no existing book found by ISBN, check by title+author
    if (!existingBook && title && author) {
      existingBook = await db.get(
        "SELECT * FROM books WHERE LOWER(title) = LOWER(?) AND LOWER(author) = LOWER(?)",
        [title, author]
      );
      if (existingBook) {
        res
          .status(400)
          .json({
            message:
              "Book with this title and author already exists in your collection",
          });
        return;
      }
    }

    // Create new book
    const result = await db.run(
      `INSERT INTO books (title, isbn, publishYear, author, cover, description) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        title,
        isbn || null,
        publishYear || null,
        author || null,
        cover || null,
        description || null,
      ]
    );

    if (result.lastID) {
      const newBook = (await db.get("SELECT * FROM books WHERE id = ?", [
        result.lastID,
      ])) as Book;
      res.status(201).json({
        message: "Book created successfully",
        book: newBook,
      });
    } else {
      res.status(500).json({ message: "Failed to create book" });
    }
  } catch (error: any) {
    console.error("Error creating book:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Create a book using ISBN and Open Library API
 */
export const createBookByIsbn = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { isbn } = req.body;

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
      res.status(400).json({ message: "Book with this ISBN already exists" });
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
    const author = bookData.authors
      ? bookData.authors[0]?.name
      : "Unknown Author";
    const publishYear = bookData.publish_date
      ? parseInt(bookData.publish_date.slice(-4))
      : null;
    const cover = bookData.cover?.medium || null;
    const description =
      bookData.description?.value || bookData.description || null;

    // Create book in database
    const result = await db.run(
      `INSERT INTO books (title, isbn, publishYear, author, cover, description) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, isbn, publishYear, author, cover, description]
    );

    if (result.lastID) {
      const newBook = (await db.get("SELECT * FROM books WHERE id = ?", [
        result.lastID,
      ])) as Book;
      res.status(201).json({
        message: "Book created successfully from ISBN",
        book: newBook,
      });
    } else {
      res.status(500).json({ message: "Failed to create book" });
    }
  } catch (error: any) {
    console.error("Error creating book by ISBN:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update a book
 */
export const updateBook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, isbn, publishYear, author, cover, description } = req.body;

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

    // Update book
    await db.run(
      `UPDATE books 
       SET title = ?, isbn = ?, publishYear = ?, author = ?, cover = ?, description = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title,
        isbn || null,
        publishYear || null,
        author || null,
        cover || null,
        description || null,
        id,
      ]
    );

    const updatedBook = (await db.get("SELECT * FROM books WHERE id = ?", [
      id,
    ])) as Book;

    res.status(200).json({
      message: "Book updated successfully",
      book: updatedBook,
    });
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

    // Delete book
    await db.run("DELETE FROM books WHERE id = ?", [id]);

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting book:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

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
