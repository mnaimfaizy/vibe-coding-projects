import axios from "axios";
import { Request, Response } from "express";
import { Database } from "sqlite";
import {
  addToUserCollection,
  createBookByIsbn,
  createBookManually,
  deleteBook,
  getAllBooks,
  getBookById,
  getUserCollection,
  rateLimiter,
  removeFromUserCollection,
  searchBooks,
  searchOpenLibrary,
  updateBook,
} from "../../controllers/booksController";
import { connectDatabase } from "../../db/database";

// Mock dependencies
jest.mock("../../db/database");
jest.mock("axios");

// Interface for request with user property
interface UserRequest extends Request {
  user?: {
    id: number;
    isAdmin?: boolean;
  };
}

// Setup for rate limiting test
declare global {
  var requestTimestamps: number[];
}

// Initialize global variable if needed
global.requestTimestamps = [];

describe("Books Controller", () => {
  let req: Partial<UserRequest>;
  let res: Partial<Response>;
  let mockDb: Partial<Database>;

  beforeEach(() => {
    mockDb = {
      run: jest.fn().mockResolvedValue({}),
      get: jest.fn(),
      all: jest.fn(),
      close: jest.fn(),
      exec: jest.fn(),
    };

    (connectDatabase as jest.Mock).mockResolvedValue(mockDb);

    req = {
      body: {},
      params: {},
      query: {},
      user: undefined,
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});

    // Reset rate limiting for each test
    global.requestTimestamps = [];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllBooks", () => {
    it("should get all books with their authors", async () => {
      const mockBooks = [
        { id: 1, title: "Book 1", isbn: "1234567890" },
        { id: 2, title: "Book 2", isbn: "0987654321" },
      ];

      const mockAuthors = [
        { id: 1, name: "Author 1" },
        { id: 2, name: "Author 2" },
      ];

      mockDb.all = jest
        .fn()
        .mockResolvedValueOnce(mockBooks) // First call returns books
        .mockResolvedValueOnce(mockAuthors) // Second call returns authors for book 1
        .mockResolvedValueOnce([]); // Third call returns authors for book 2

      await getAllBooks(req as UserRequest, res as Response);

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM books")
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        books: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            title: "Book 1",
            authors: mockAuthors,
          }),
        ]),
      });
    });

    it("should handle database errors", async () => {
      const mockError = new Error("Database error");
      mockDb.all = jest.fn().mockRejectedValue(mockError);

      await getAllBooks(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });
  });

  describe("getBookById", () => {
    it("should get a book by ID with its authors", async () => {
      const bookId = "1";
      req.params = { id: bookId };

      const mockBook = {
        id: 1,
        title: "Test Book",
        isbn: "1234567890",
        publishYear: 2023,
        author: "Test Author",
        cover: "http://example.com/cover.jpg",
        description: "A test book description",
      };

      const mockAuthors = [{ id: 1, name: "Test Author", is_primary: 1 }];

      mockDb.get = jest.fn().mockResolvedValue(mockBook);
      mockDb.all = jest.fn().mockResolvedValue(mockAuthors);

      await getBookById(req as UserRequest, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM books WHERE id = ?",
        [bookId]
      );

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining("JOIN author_books"),
        [bookId]
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        book: {
          ...mockBook,
          authors: mockAuthors,
        },
      });
    });

    it("should return 404 if book not found", async () => {
      req.params = { id: "999" };
      mockDb.get = jest.fn().mockResolvedValue(null);

      await getBookById(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
    });

    it("should handle database errors", async () => {
      req.params = { id: "1" };
      const mockError = new Error("Database error");
      mockDb.get = jest.fn().mockRejectedValue(mockError);

      await getBookById(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });
  });

  describe("createBookManually", () => {
    it("should create a book successfully with authors array", async () => {
      req.body = {
        title: "New Book",
        isbn: "1234567890",
        publishYear: 2023,
        cover: "http://example.com/cover.jpg",
        description: "A new book description",
        authors: [{ name: "Author 1" }, { name: "Author 2" }],
      };

      const mockBookId = 5;
      const mockNewBook = {
        id: mockBookId,
        title: "New Book",
        isbn: "1234567890",
        publishYear: 2023,
        cover: "http://example.com/cover.jpg",
        description: "A new book description",
      };

      const mockAuthors = [
        { id: 1, name: "Author 1", is_primary: 1 },
        { id: 2, name: "Author 2", is_primary: 0 },
      ];

      // Mock database responses
      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(null) // No existing book with ISBN
        .mockResolvedValueOnce(null) // Author 1 doesn't exist
        .mockResolvedValueOnce(null) // Author 2 doesn't exist
        .mockResolvedValueOnce(mockNewBook); // Get new book

      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({}) // Begin transaction
        .mockResolvedValueOnce({ lastID: mockBookId }) // Insert book
        .mockResolvedValueOnce({ lastID: 1 }) // Insert author 1
        .mockResolvedValueOnce({}) // Insert author-book relation 1
        .mockResolvedValueOnce({ lastID: 2 }) // Insert author 2
        .mockResolvedValueOnce({}) // Insert author-book relation 2
        .mockResolvedValueOnce({}); // Commit transaction

      mockDb.all = jest.fn().mockResolvedValue(mockAuthors);

      await createBookManually(req as UserRequest, res as Response);

      expect(mockDb.run).toHaveBeenNthCalledWith(1, "BEGIN TRANSACTION");
      expect(mockDb.run).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("INSERT INTO books"),
        expect.arrayContaining(["New Book", "1234567890"])
      );

      expect(mockDb.run).toHaveBeenCalledWith(
        "INSERT INTO author_books (author_id, book_id, is_primary) VALUES (?, ?, ?)",
        [1, mockBookId, 1]
      );

      expect(mockDb.run).toHaveBeenCalledWith(
        "INSERT INTO author_books (author_id, book_id, is_primary) VALUES (?, ?, ?)",
        [2, mockBookId, 0]
      );

      expect(mockDb.run).toHaveBeenCalledWith("COMMIT");

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Book created successfully",
        book: expect.objectContaining({
          id: mockBookId,
          title: "New Book",
          authors: mockAuthors,
        }),
      });
    });

    it("should return 400 if title is not provided", async () => {
      req.body = {
        isbn: "1234567890",
        publishYear: 2023,
      };

      await createBookManually(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Title is required" });
    });

    it("should handle existing book with ISBN and add to collection", async () => {
      // Setup request with book data and user
      req.body = {
        title: "Existing Book",
        isbn: "1234567890",
        author: "Existing Author",
      };
      req.user = { id: 1 };

      // Mock the database responses
      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce({ id: 3, title: "Existing Book" }); // Book exists

      mockDb.run = jest.fn().mockResolvedValue({}); // Mock the run function for adding to collection

      await createBookManually(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Book already exists"),
          book: expect.objectContaining({ id: 3 }),
        })
      );

      // Verify the correct SQL query was called
      expect(mockDb.run).toHaveBeenCalledWith(
        "INSERT INTO user_collections (userId, bookId) VALUES (?, ?)",
        [1, 3]
      );
    });

    it("should handle rollback on error", async () => {
      req.body = {
        title: "New Book",
        isbn: "1234567890",
        authors: [{ name: "Author 1" }],
      };

      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({}) // Begin transaction
        .mockResolvedValueOnce({ lastID: 5 }) // Insert book
        .mockRejectedValueOnce(new Error("Database error")); // Error inserting author

      await createBookManually(req as UserRequest, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // Fix the createBookByIsbn test
  describe("createBookByIsbn", () => {
    beforeEach(() => {
      // Clear mock calls and reset mock implementations
      jest.clearAllMocks();
      (axios.get as jest.Mock).mockReset();

      // Reset any rate limiting state
      if (typeof global.requestTimestamps !== "undefined") {
        global.requestTimestamps = [];
      }

      // Mock rate limiter for testing
      jest.spyOn(rateLimiter, "isLimited").mockReturnValue(false);
    });

    it("should create a book by ISBN", async () => {
      req.body = { isbn: "1234567890" };
      req.user = { id: 1 };

      const mockBookData = {
        data: {
          "ISBN:1234567890": {
            title: "Test Book",
            authors: [{ name: "Test Author" }],
            publish_date: "2020",
            cover: { medium: "https://covers.openlibrary.org/b/id/123-M.jpg" },
          },
        },
      };

      // Mock the axios call to return book data
      (axios.get as jest.Mock).mockResolvedValueOnce(mockBookData);

      // Mock the database query to indicate no existing book with this ISBN
      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(null) // No existing book with ISBN
        .mockResolvedValueOnce(null) // No existing author
        .mockResolvedValueOnce({
          id: 2,
          title: "Test Book",
          isbn: "1234567890",
          publishYear: 2020,
        }); // Get new book

      // Mock the database run to return a lastID for book and author insert
      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({}) // Begin transaction
        .mockResolvedValueOnce({ lastID: 2 }) // Insert book
        .mockResolvedValueOnce({ lastID: 3 }) // Insert author
        .mockResolvedValueOnce({}) // Insert author-book relation
        .mockResolvedValueOnce({}); // Commit transaction

      mockDb.all = jest
        .fn()
        .mockResolvedValue([{ id: 3, name: "Test Author", is_primary: 1 }]); // Authors for book

      await createBookByIsbn(req as UserRequest, res as Response);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("openlibrary.org"),
        expect.any(Object)
      );

      // Verify we mock the correct status
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
          book: expect.objectContaining({
            title: "Test Book",
          }),
        })
      );
    });

    it("should return 404 if book not found in Open Library", async () => {
      req.body = { isbn: "9999999999" };
      req.user = { id: 1 };

      // Mock the OpenLibrary API to return empty data (book not found)
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: {}, // Empty response indicating no book found
      });

      await createBookByIsbn(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Book not found with this ISBN",
      });
    });

    it("should return 400 if no ISBN is provided", async () => {
      req.body = {}; // Missing ISBN

      await createBookByIsbn(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "ISBN is required" });
    });

    it("should return 429 if rate limit is exceeded", async () => {
      req.body = { isbn: "1234567890" };

      // Mock the rate limiter to indicate limit exceeded
      jest.spyOn(rateLimiter, "isLimited").mockReturnValue(true);

      await createBookByIsbn(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: expect.any(Number),
      });
    });

    it("should return book from database if it already exists", async () => {
      req.body = { isbn: "1234567890", addToCollection: true };
      req.user = { id: 1 };

      const existingBook = {
        id: 1,
        title: "Existing Book",
        isbn: "1234567890",
      };

      mockDb.get = jest.fn().mockResolvedValue(existingBook);
      mockDb.all = jest.fn().mockResolvedValue([{ id: 1, name: "Author" }]);

      await createBookByIsbn(req as UserRequest, res as Response);

      expect(mockDb.run).not.toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO books")
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Book already exists",
          book: expect.objectContaining({
            id: 1,
            title: "Existing Book",
          }),
        })
      );
    });

    it("should handle API error when fetching book data", async () => {
      req.body = { isbn: "1234567890" };

      // Mock existing book check (no existing book)
      mockDb.get = jest.fn().mockResolvedValue(null);

      // Mock API error
      (axios.get as jest.Mock).mockRejectedValue(new Error("API error"));

      await createBookByIsbn(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.stringContaining("Error fetching book data"),
        error: expect.any(String),
      });
    });

    it("should handle database error when creating a book", async () => {
      req.body = { isbn: "1234567890" };

      // Mock existing book check (no existing book)
      mockDb.get = jest.fn().mockResolvedValue(null);

      // Mock successful API call
      const mockBookData = {
        data: {
          "ISBN:1234567890": {
            title: "Test Book",
            authors: [{ name: "Test Author" }],
            publish_date: "2020",
          },
        },
      };
      (axios.get as jest.Mock).mockResolvedValueOnce(mockBookData);

      // Mock database error during transaction
      mockDb.run = jest.fn().mockImplementation((query) => {
        if (query === "BEGIN TRANSACTION") {
          return Promise.resolve({});
        } else if (query.includes("INSERT INTO books")) {
          return Promise.reject(new Error("Database error"));
        }
        return Promise.resolve({});
      });

      await createBookByIsbn(req as UserRequest, res as Response);

      // Should rollback the transaction on error
      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("updateBook", () => {
    it("should update a book successfully", async () => {
      req.params = { id: "1" };
      req.body = {
        title: "Updated Book",
        isbn: "0987654321",
        publishYear: 2024,
        cover: "http://example.com/updated-cover.jpg",
        description: "Updated description",
        authors: [{ id: 1, name: "Existing Author" }, { name: "New Author" }],
      };

      const mockBook = {
        id: 1,
        title: "Original Book",
        isbn: "1234567890",
      };

      const updatedBook = {
        id: 1,
        title: "Updated Book",
        isbn: "0987654321",
        publishYear: 2024,
        cover: "http://example.com/updated-cover.jpg",
        description: "Updated description",
      };

      const mockAuthors = [
        { id: 1, name: "Existing Author", is_primary: 1 },
        { id: 2, name: "New Author", is_primary: 0 },
      ];

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(mockBook) // Book exists
        .mockResolvedValueOnce(null) // No other book with same ISBN
        .mockResolvedValueOnce(null) // New author doesn't exist
        .mockResolvedValueOnce(updatedBook); // Get updated book

      mockDb.all = jest.fn().mockResolvedValue(mockAuthors);

      await updateBook(req as UserRequest, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith("BEGIN TRANSACTION");
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE books"),
        expect.arrayContaining(["Updated Book", "0987654321", 2024])
      );

      expect(mockDb.run).toHaveBeenCalledWith(
        "DELETE FROM author_books WHERE book_id = ?",
        ["1"]
      );

      expect(mockDb.run).toHaveBeenCalledWith("COMMIT");

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Book updated successfully",
        book: expect.objectContaining({
          id: 1,
          title: "Updated Book",
          authors: mockAuthors,
        }),
      });
    });

    it("should return 400 if title is not provided", async () => {
      req.params = { id: "1" };
      req.body = {
        isbn: "1234567890",
      };

      await updateBook(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Title is required" });
    });

    it("should return 404 if book not found", async () => {
      req.params = { id: "999" };
      req.body = {
        title: "Updated Book",
      };

      mockDb.get = jest.fn().mockResolvedValue(null);

      await updateBook(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
    });

    it("should return 400 if ISBN is not unique", async () => {
      req.params = { id: "1" };
      req.body = {
        title: "Updated Book",
        isbn: "9876543210",
      };

      const existingBook = { id: 1 };
      const conflictingBook = { id: 2, isbn: "9876543210" };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(existingBook) // Book exists
        .mockResolvedValueOnce(conflictingBook); // Another book with same ISBN

      await updateBook(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Book with this ISBN already exists",
      });
    });

    it("should update a book successfully with author string", async () => {
      const bookId = "1";
      req.params = { id: bookId };
      req.body = {
        title: "Updated Book Title",
        isbn: "9876543210",
        publishYear: 2023,
        author: "Updated Author",
        cover: "http://example.com/updated-cover.jpg",
        description: "Updated description",
      };

      const existingBook = {
        id: 1,
        title: "Original Title",
        isbn: "1234567890",
        author: "Original Author",
      };

      const updatedBook = {
        id: 1,
        title: "Updated Book Title",
        isbn: "9876543210",
        publishYear: 2023,
        author: "Updated Author",
        cover: "http://example.com/updated-cover.jpg",
        description: "Updated description",
      };

      // Use a counter to track which call is being made
      let getCallCounter = 0;
      mockDb.get = jest.fn().mockImplementation((query, params) => {
        if (
          query.includes("SELECT * FROM books WHERE id = ?") &&
          params[0] === bookId
        ) {
          // For the first call, return existing book; for subsequent calls, return updated book
          getCallCounter++;
          return getCallCounter === 1
            ? Promise.resolve(existingBook)
            : Promise.resolve(updatedBook);
        } else if (query.includes("books WHERE isbn = ? AND id != ?")) {
          return Promise.resolve(null); // No conflict with ISBN
        } else if (
          query.includes("SELECT id FROM authors WHERE LOWER(name) = LOWER(?)")
        ) {
          return Promise.resolve(null); // Author doesn't exist yet
        }
        return Promise.resolve(null);
      });

      mockDb.all = jest
        .fn()
        .mockResolvedValueOnce([{ name: "Updated Author", is_primary: 1 }]);

      mockDb.run = jest.fn().mockImplementation((query) => {
        if (query.includes("INSERT INTO authors")) {
          return Promise.resolve({ lastID: 5 });
        }
        return Promise.resolve({});
      });

      await updateBook(req as UserRequest, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM books WHERE id = ?",
        [bookId]
      );

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE books"),
        expect.arrayContaining([
          "Updated Book Title",
          "9876543210",
          2023,
          "Updated Author",
          "http://example.com/updated-cover.jpg",
          "Updated description",
          bookId,
        ])
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Book updated successfully",
        book: expect.objectContaining({
          id: 1,
          title: "Updated Book Title",
          isbn: "9876543210",
        }),
      });
    });

    it("should update a book successfully with authors array", async () => {
      const bookId = "1";
      req.params = { id: bookId };
      req.body = {
        title: "Updated Book Title",
        isbn: "9876543210",
        publishYear: 2023,
        authors: [
          { name: "Main Author", is_primary: true },
          { name: "Co-Author", is_primary: false },
        ],
        cover: "http://example.com/updated-cover.jpg",
        description: "Updated description",
      };

      const existingBook = {
        id: 1,
        title: "Original Title",
        isbn: "1234567890",
        author: "Original Author",
      };

      const updatedBook = {
        id: 1,
        title: "Updated Book Title",
        isbn: "9876543210",
        publishYear: 2023,
        cover: "http://example.com/updated-cover.jpg",
        description: "Updated description",
      };

      const bookAuthors = [
        { id: 10, name: "Main Author", is_primary: 1 },
        { id: 11, name: "Co-Author", is_primary: 0 },
      ];

      // Use a counter to track which call is being made
      let getCallCounter = 0;
      mockDb.get = jest.fn().mockImplementation((query, params) => {
        if (
          query.includes("SELECT * FROM books WHERE id = ?") &&
          params[0] === bookId
        ) {
          // For the first call, return existing book; for subsequent calls, return updated book
          getCallCounter++;
          return getCallCounter === 1
            ? Promise.resolve(existingBook)
            : Promise.resolve(updatedBook);
        } else if (query.includes("books WHERE isbn = ? AND id != ?")) {
          return Promise.resolve(null); // No conflict with ISBN
        } else if (
          query.includes("SELECT id FROM authors WHERE LOWER(name) = LOWER(?)")
        ) {
          if (params[0].toLowerCase() === "main author") {
            return Promise.resolve({ id: 10 }); // Existing author
          } else {
            return Promise.resolve(null); // New author
          }
        }
        return Promise.resolve(null);
      });

      mockDb.all = jest.fn().mockResolvedValueOnce(bookAuthors);

      mockDb.run = jest.fn().mockImplementation((query) => {
        if (query.includes("INSERT INTO authors")) {
          return Promise.resolve({ lastID: 11 });
        }
        return Promise.resolve({});
      });

      await updateBook(req as UserRequest, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE books"),
        expect.arrayContaining([
          "Updated Book Title",
          "9876543210",
          2023,
          null, // author field is null when using authors array
          "http://example.com/updated-cover.jpg",
          "Updated description",
          bookId,
        ])
      );

      // Should delete existing author relationships first
      expect(mockDb.run).toHaveBeenCalledWith(
        "DELETE FROM author_books WHERE book_id = ?",
        ["1"]
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Book updated successfully",
        book: expect.objectContaining({
          id: 1,
          title: "Updated Book Title",
          authors: expect.arrayContaining([
            expect.objectContaining({ name: "Main Author", is_primary: 1 }),
            expect.objectContaining({ name: "Co-Author", is_primary: 0 }),
          ]),
        }),
      });
    });

    it("should return 404 if book not found", async () => {
      req.params = { id: "999" };
      req.body = { title: "Updated Title" };

      mockDb.get = jest.fn().mockResolvedValue(null); // Book not found
      mockDb.run = jest.fn().mockResolvedValue({});

      await updateBook(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
    });

    it("should return 400 if ISBN already exists for another book", async () => {
      const bookId = "1";
      req.params = { id: bookId };
      req.body = {
        title: "Updated Title",
        isbn: "9876543210", // Conflicting ISBN
      };

      const existingBook = {
        id: 1,
        title: "Original Title",
        isbn: "1234567890",
      };

      const conflictingBook = {
        id: 2,
        title: "Another Book",
        isbn: "9876543210", // Same as requested ISBN
      };

      mockDb.get = jest.fn().mockImplementation((query) => {
        if (query.includes("SELECT * FROM books WHERE id = ?")) {
          return Promise.resolve(existingBook);
        } else if (
          query.includes("SELECT * FROM books WHERE isbn = ? AND id != ?")
        ) {
          return Promise.resolve(conflictingBook); // ISBN conflict
        }
        return Promise.resolve(null);
      });

      await updateBook(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Book with this ISBN already exists",
      });
    });

    it("should handle database transaction errors", async () => {
      const bookId = "1";
      req.params = { id: bookId };
      req.body = { title: "Updated Title" };

      const existingBook = {
        id: 1,
        title: "Original Title",
        isbn: "1234567890",
      };

      mockDb.get = jest.fn().mockResolvedValue(existingBook);

      const mockError = new Error("Database error");
      mockDb.run = jest.fn().mockImplementation((query) => {
        if (query === "BEGIN TRANSACTION") {
          return Promise.resolve({});
        } else if (query.includes("UPDATE books")) {
          return Promise.reject(mockError);
        }
        return Promise.resolve({});
      });

      await updateBook(req as UserRequest, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });
  });

  describe("deleteBook", () => {
    it("should delete a book successfully", async () => {
      req.params = { id: "1" };

      const mockBook = {
        id: 1,
        title: "Book to Delete",
      };

      mockDb.get = jest.fn().mockResolvedValue(mockBook);
      mockDb.run = jest.fn().mockResolvedValue({});

      await deleteBook(req as UserRequest, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM books WHERE id = ?",
        ["1"]
      );

      expect(mockDb.run).toHaveBeenCalledWith(
        "DELETE FROM books WHERE id = ?",
        ["1"]
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Book deleted successfully",
      });
    });

    it("should return 404 if book not found", async () => {
      req.params = { id: "999" };
      mockDb.get = jest.fn().mockResolvedValue(null);

      await deleteBook(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
    });
  });

  describe("searchBooks", () => {
    it("should search books by query", async () => {
      req.query = { q: "test" };

      const mockBooks = [
        { id: 1, title: "Test Book 1" },
        { id: 2, title: "Test Book 2" },
      ];

      mockDb.all = jest
        .fn()
        .mockResolvedValueOnce(mockBooks) // Search results
        .mockResolvedValueOnce([{ id: 1, name: "Author 1" }]) // Authors for book 1
        .mockResolvedValueOnce([{ id: 2, name: "Author 2" }]); // Authors for book 2

      await searchBooks(req as UserRequest, res as Response);

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining("WHERE"),
        ["%test%", "%test%", "%test%", "%test%"]
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        books: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            title: "Test Book 1",
            authors: expect.any(Array),
          }),
        ]),
      });
    });

    it("should return 400 if query is not provided", async () => {
      req.query = {}; // No query

      await searchBooks(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Search query is required",
      });
    });
  });

  // Fix the searchOpenLibrary test for author search
  describe("searchOpenLibrary", () => {
    beforeEach(() => {
      // Reset mock calls and implementations
      jest.clearAllMocks();
      (axios.get as jest.Mock).mockReset();

      // Reset the rate limiting state between tests
      global.requestTimestamps = [];

      // Mock rate limiter for testing
      jest.spyOn(rateLimiter, "isLimited").mockReturnValue(false);
    });

    it("should search OpenLibrary by ISBN", async () => {
      req.query = {
        query: "1234567890",
        type: "isbn",
      };

      const mockResponse = {
        data: {
          "ISBN:1234567890": {
            title: "Test Book from API",
            authors: [{ name: "API Author" }],
            publish_date: "2020",
            cover: { medium: "http://example.com/api-cover.jpg" },
            description: "A book from the API",
          },
        },
      };

      // Mock the API response
      (axios.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      await searchOpenLibrary(req as UserRequest, res as Response);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("openlibrary.org/api/books"),
        expect.any(Object)
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          book: expect.objectContaining({
            title: "Test Book from API",
          }),
        })
      );
    });

    it("should search OpenLibrary by title (default)", async () => {
      req.query = {
        query: "Harry Potter",
      };

      const mockResponse = {
        data: {
          docs: [
            {
              title: "Harry Potter and the Philosopher's Stone",
              author_name: ["J.K. Rowling"],
              first_publish_year: 1997,
              isbn: ["9780747532743"],
              cover_i: 12345,
            },
          ],
        },
      };

      // Mock the API response
      (axios.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      await searchOpenLibrary(req as UserRequest, res as Response);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("openlibrary.org/search.json?title="),
        expect.any(Object)
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          books: expect.arrayContaining([
            expect.objectContaining({
              title: "Harry Potter and the Philosopher's Stone",
            }),
          ]),
        })
      );
    });

    it("should search OpenLibrary by author", async () => {
      req.query = {
        query: "Tolkien",
        type: "author",
      };

      const mockAuthorResponse = {
        data: {
          docs: [
            {
              key: "/authors/OL123456A",
              name: "J.R.R. Tolkien",
            },
          ],
          numFound: 1,
        },
      };

      const mockBooksResponse = {
        data: {
          entries: [
            {
              title: "The Hobbit",
              author_name: ["J.R.R. Tolkien"],
              first_publish_year: 1937,
              isbn: ["9780547928227"],
              cover_i: 54321,
            },
          ],
          size: 1,
        },
      };

      // Mock the API response for author search
      (axios.get as jest.Mock).mockResolvedValueOnce(mockAuthorResponse);
      // Mock the API response for books by author
      (axios.get as jest.Mock).mockResolvedValueOnce(mockBooksResponse);

      await searchOpenLibrary(req as UserRequest, res as Response);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("openlibrary.org/search/authors.json"),
        expect.any(Object)
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it("should handle empty results for title search", async () => {
      req.query = {
        query: "nonexistent book title",
        type: "title",
      };

      const mockResponse = {
        data: {
          docs: [],
          numFound: 0,
        },
      };

      // Mock the API response
      (axios.get as jest.Mock).mockResolvedValue(mockResponse);
      // Mock the rate limiter to allow the request
      jest.spyOn(rateLimiter, "isLimited").mockReturnValue(false);

      await searchOpenLibrary(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "No books found matching the query",
      });
    });

    it("should handle rate limiting for OpenLibrary searches", async () => {
      req.query = {
        query: "test",
        type: "title",
      };

      // Mock the rate limiter to indicate limit exceeded
      jest.spyOn(rateLimiter, "isLimited").mockReturnValue(true);

      await searchOpenLibrary(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: expect.any(Number),
      });
    });
  });

  describe("addToUserCollection", () => {
    it("should add a book to user collection", async () => {
      req.user = { id: 1 };
      req.body = { bookId: 2 };

      const mockBook = { id: 2, title: "Test Book" };
      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(mockBook) // Book exists
        .mockResolvedValueOnce(null); // Not already in collection

      await addToUserCollection(req as UserRequest, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM books WHERE id = ?",
        [2]
      );

      expect(mockDb.run).toHaveBeenCalledWith(
        "INSERT INTO user_collections (userId, bookId) VALUES (?, ?)",
        [1, 2]
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Book added to your collection successfully",
      });
    });

    it("should return 401 if user is not authenticated", async () => {
      req.user = undefined;
      req.body = { bookId: 2 };

      await addToUserCollection(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Authentication required",
      });
    });

    it("should return 400 if bookId is not provided", async () => {
      req.user = { id: 1 };
      req.body = {};

      await addToUserCollection(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Book ID is required" });
    });

    it("should return 404 if book not found", async () => {
      req.user = { id: 1 };
      req.body = { bookId: 999 };

      mockDb.get = jest.fn().mockResolvedValue(null);

      await addToUserCollection(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
    });

    it("should not add book if already in collection", async () => {
      req.user = { id: 1 };
      req.body = { bookId: 2 };

      const mockBook = { id: 2, title: "Test Book" };
      const existingEntry = { userId: 1, bookId: 2 };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(mockBook) // Book exists
        .mockResolvedValueOnce(existingEntry); // Already in collection

      await addToUserCollection(req as UserRequest, res as Response);

      // Shouldn't try to insert again
      expect(mockDb.run).not.toHaveBeenCalledWith(
        "INSERT INTO user_collections (userId, bookId) VALUES (?, ?)",
        [1, 2]
      );

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe("removeFromUserCollection", () => {
    it("should remove a book from user collection", async () => {
      req.user = { id: 1 };
      req.params = { bookId: "2" };

      const mockUserBook = { userId: 1, bookId: 2 };
      mockDb.get = jest.fn().mockResolvedValue(mockUserBook);

      await removeFromUserCollection(req as UserRequest, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM user_collections WHERE userId = ? AND bookId = ?",
        [1, "2"]
      );

      expect(mockDb.run).toHaveBeenCalledWith(
        "DELETE FROM user_collections WHERE userId = ? AND bookId = ?",
        [1, "2"]
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Book removed from your collection successfully",
      });
    });

    it("should return 401 if user is not authenticated", async () => {
      req.user = undefined;
      req.params = { bookId: "2" };

      await removeFromUserCollection(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Authentication required",
      });
    });

    it("should return 404 if book not in collection", async () => {
      req.user = { id: 1 };
      req.params = { bookId: "999" };

      mockDb.get = jest.fn().mockResolvedValue(null);

      await removeFromUserCollection(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Book not found in your collection",
      });
    });
  });

  // Fix the getUserCollection test
  describe("getUserCollection", () => {
    it("should get all books in user collection", async () => {
      req.user = { id: 1 };

      const mockBooks = [
        { id: 1, title: "Book 1" },
        { id: 2, title: "Book 2" },
      ];

      mockDb.all = jest
        .fn()
        .mockResolvedValueOnce(mockBooks) // Books in collection
        .mockResolvedValueOnce([{ id: 1, name: "Author 1" }]) // Authors for book 1
        .mockResolvedValueOnce([{ id: 2, name: "Author 2" }]); // Authors for book 2

      await getUserCollection(req as UserRequest, res as Response);

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining("JOIN user_collections"),
        [1]
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        books: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            title: "Book 1",
            authors: expect.any(Array),
          }),
        ]),
      });
    });

    it("should return 401 if user is not authenticated", async () => {
      req.user = undefined;

      await getUserCollection(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Authentication required",
      });
    });

    it("should return empty array if user has no books", async () => {
      req.user = { id: 1 };

      mockDb.all = jest.fn().mockResolvedValue([]);

      await getUserCollection(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ books: [] });
    });

    it("should handle database error when getting user collection", async () => {
      req.user = { id: 1 };

      mockDb.all = jest.fn().mockRejectedValue(new Error("Database error"));

      await getUserCollection(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: expect.stringContaining("Database error"),
      });
    });
  });
});
