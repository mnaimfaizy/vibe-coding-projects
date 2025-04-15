// filepath: c:\Users\mnaim\Downloads\Projects\vibe-coding-projects\library-api\src\__tests__\controllers\authorsController.test.ts
import { Request, Response } from "express";
import { Database } from "sqlite";
import {
  addBookToAuthor,
  createAuthor,
  deleteAuthor,
  getAllAuthors,
  getAuthorById,
  getAuthorByName,
  getAuthorInfo,
  removeBookFromAuthor,
  updateAuthor,
} from "../../controllers/authorsController";
import { connectDatabase } from "../../db/database";

// Mock dependencies
jest.mock("../../db/database");
jest.mock("axios");

// Import axios for mocking
import axios from "axios";

describe("Authors Controller", () => {
  let req: Partial<Request>;
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllAuthors", () => {
    it("should get all authors with their book count", async () => {
      const mockAuthors = [
        {
          id: 1,
          name: "Author One",
          biography: "Bio 1",
          birth_date: "1980-01-01",
          photo_url: "http://example.com/1.jpg",
          book_count: 3,
        },
        {
          id: 2,
          name: "Author Two",
          biography: "Bio 2",
          birth_date: "1990-01-01",
          photo_url: "http://example.com/2.jpg",
          book_count: 5,
        },
      ];

      mockDb.all = jest.fn().mockResolvedValue(mockAuthors);

      await getAllAuthors(req as Request, res as Response);

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining("COUNT(ab.book_id) as book_count")
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ authors: mockAuthors });
    });

    it("should handle database errors", async () => {
      const mockError = new Error("Database error");
      mockDb.all = jest.fn().mockRejectedValue(mockError);

      await getAllAuthors(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });
  });

  describe("getAuthorById", () => {
    it("should get an author by ID with their books", async () => {
      const authorId = "1";
      req.params = { id: authorId };

      const mockAuthor = {
        id: 1,
        name: "Test Author",
        biography: "Author biography",
        birth_date: "1980-01-01",
        photo_url: "http://example.com/photo.jpg",
        createdAt: "2023-01-01T12:00:00Z",
        updatedAt: "2023-01-02T12:00:00Z",
      };

      const mockBooks = [
        { id: 1, title: "Book 1", isbn: "1234567890" },
        { id: 2, title: "Book 2", isbn: "0987654321" },
      ];

      mockDb.get = jest.fn().mockResolvedValue(mockAuthor);
      mockDb.all = jest.fn().mockResolvedValue(mockBooks);

      await getAuthorById(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        expect.stringContaining(
          "SELECT id, name, biography, birth_date, photo_url"
        ),
        [authorId]
      );

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining("JOIN author_books"),
        [authorId]
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        author: mockAuthor,
        books: mockBooks,
      });
    });

    it("should return 404 if author not found", async () => {
      req.params = { id: "999" };
      mockDb.get = jest.fn().mockResolvedValue(null);

      await getAuthorById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Author not found" });
    });

    it("should handle database errors", async () => {
      req.params = { id: "1" };
      const mockError = new Error("Database error");
      mockDb.get = jest.fn().mockRejectedValue(mockError);

      await getAuthorById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });
  });

  describe("getAuthorByName", () => {
    it("should get an author by name with their books", async () => {
      const authorName = "Test Author";
      req.params = { name: authorName };

      const mockAuthor = {
        id: 1,
        name: "Test Author",
        biography: "Author biography",
        birth_date: "1980-01-01",
        photo_url: "http://example.com/photo.jpg",
        createdAt: "2023-01-01T12:00:00Z",
        updatedAt: "2023-01-02T12:00:00Z",
      };

      const mockBooks = [
        { id: 1, title: "Book 1", isbn: "1234567890" },
        { id: 2, title: "Book 2", isbn: "0987654321" },
      ];

      mockDb.get = jest.fn().mockResolvedValue(mockAuthor);
      mockDb.all = jest.fn().mockResolvedValue(mockBooks);

      await getAuthorByName(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        expect.stringContaining("LOWER(name) = LOWER(?)"),
        [authorName]
      );

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining("JOIN author_books"),
        [1] // The author ID
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        author: mockAuthor,
        books: mockBooks,
      });
    });

    it("should return 400 if author name is not provided", async () => {
      req.params = { name: "" };

      await getAuthorByName(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author name is required",
      });
    });

    it("should return 404 if author not found", async () => {
      req.params = { name: "Nonexistent Author" };
      mockDb.get = jest.fn().mockResolvedValue(null);

      await getAuthorByName(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Author not found" });
    });
  });

  describe("createAuthor", () => {
    it("should create a new author successfully", async () => {
      req.body = {
        name: "New Author",
        biography: "New biography",
        birth_date: "1985-05-05",
        photo_url: "http://example.com/new.jpg",
      };

      const mockNewAuthor = {
        id: 5,
        name: "New Author",
        biography: "New biography",
        birth_date: "1985-05-05",
        photo_url: "http://example.com/new.jpg",
        createdAt: "2023-01-01T12:00:00Z",
        updatedAt: null,
      };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(null) // No existing author
        .mockResolvedValueOnce(mockNewAuthor); // The newly created author

      mockDb.run = jest.fn().mockResolvedValue({ lastID: 5 });

      await createAuthor(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM authors WHERE LOWER(name) = LOWER(?)",
        ["New Author"]
      );

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO authors"),
        [
          "New Author",
          "New biography",
          "1985-05-05",
          "http://example.com/new.jpg",
        ]
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author created successfully",
        author: mockNewAuthor,
      });
    });

    it("should return 400 if name is not provided", async () => {
      req.body = {
        biography: "New biography",
        birth_date: "1985-05-05",
      };

      await createAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author name is required",
      });
    });

    it("should return 409 if author already exists", async () => {
      req.body = {
        name: "Existing Author",
        biography: "Bio",
      };

      const existingAuthor = {
        id: 1,
        name: "Existing Author",
        biography: "Existing bio",
      };

      mockDb.get = jest.fn().mockResolvedValue(existingAuthor);

      await createAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author already exists",
        author: existingAuthor,
      });
    });

    it("should handle database errors", async () => {
      req.body = { name: "New Author" };

      const mockError = new Error("Database error");
      mockDb.get = jest.fn().mockRejectedValue(mockError);

      await createAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });
  });

  describe("updateAuthor", () => {
    it("should update an author successfully", async () => {
      req.params = { id: "1" };
      req.body = {
        name: "Updated Author",
        biography: "Updated bio",
        birth_date: "1990-10-10",
        photo_url: "http://example.com/updated.jpg",
      };

      const existingAuthor = {
        id: 1,
        name: "Original Author",
        biography: "Original bio",
      };

      const updatedAuthor = {
        id: 1,
        name: "Updated Author",
        biography: "Updated bio",
        birth_date: "1990-10-10",
        photo_url: "http://example.com/updated.jpg",
      };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(existingAuthor) // Author exists
        .mockResolvedValueOnce(null) // No other author with the same name
        .mockResolvedValueOnce(updatedAuthor); // The updated author

      await updateAuthor(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM authors WHERE id = ?",
        ["1"]
      );

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE authors"),
        [
          "Updated Author",
          "Updated bio",
          "1990-10-10",
          "http://example.com/updated.jpg",
          "1",
        ]
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author updated successfully",
        author: updatedAuthor,
      });
    });

    it("should return 404 if author not found", async () => {
      req.params = { id: "999" };
      req.body = { name: "Updated Author" };

      mockDb.get = jest.fn().mockResolvedValue(null);

      await updateAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Author not found" });
    });

    it("should return 400 if name is not provided", async () => {
      req.params = { id: "1" };
      req.body = {
        biography: "Updated bio",
      };

      await updateAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author name is required",
      });
    });

    it("should return 409 if another author with the same name exists", async () => {
      req.params = { id: "1" };
      req.body = {
        name: "Duplicate Name",
        biography: "Updated bio",
      };

      const existingAuthor = {
        id: 1,
        name: "Original Author",
        biography: "Original bio",
      };

      const duplicateAuthor = {
        id: 2,
        name: "Duplicate Name",
        biography: "Another author's bio",
      };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(existingAuthor) // Current author
        .mockResolvedValueOnce(duplicateAuthor); // Another author with the same name

      await updateAuthor(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenNthCalledWith(
        2,
        "SELECT * FROM authors WHERE LOWER(name) = LOWER(?) AND id != ?",
        ["Duplicate Name", "1"]
      );

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author with this name already exists",
      });
    });
  });

  describe("deleteAuthor", () => {
    it("should delete an author successfully", async () => {
      req.params = { id: "1" };

      const existingAuthor = {
        id: 1,
        name: "Author to Delete",
      };

      mockDb.get = jest.fn().mockResolvedValue(existingAuthor);
      mockDb.run = jest.fn().mockResolvedValue({});

      await deleteAuthor(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM authors WHERE id = ?",
        ["1"]
      );

      expect(mockDb.run).toHaveBeenCalledWith(
        "DELETE FROM authors WHERE id = ?",
        ["1"]
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author deleted successfully",
      });
    });

    it("should return 404 if author not found", async () => {
      req.params = { id: "999" };
      mockDb.get = jest.fn().mockResolvedValue(null);

      await deleteAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Author not found" });
    });
  });

  describe("addBookToAuthor", () => {
    it("should associate a book with an author successfully", async () => {
      req.body = {
        authorId: 1,
        bookId: 2,
        isPrimary: true,
      };

      const author = { id: 1, name: "Test Author" };
      const book = { id: 2, title: "Test Book" };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(author) // Author exists
        .mockResolvedValueOnce(book) // Book exists
        .mockResolvedValueOnce(null); // Association doesn't exist yet

      await addBookToAuthor(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenNthCalledWith(
        1,
        "SELECT * FROM authors WHERE id = ?",
        [1]
      );

      expect(mockDb.get).toHaveBeenNthCalledWith(
        2,
        "SELECT * FROM books WHERE id = ?",
        [2]
      );

      expect(mockDb.get).toHaveBeenNthCalledWith(
        3,
        "SELECT * FROM author_books WHERE author_id = ? AND book_id = ?",
        [1, 2]
      );

      expect(mockDb.run).toHaveBeenCalledWith(
        "INSERT INTO author_books (author_id, book_id, is_primary) VALUES (?, ?, ?)",
        [1, 2, 1]
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author associated with book successfully",
      });
    });

    it("should update existing association if it already exists", async () => {
      req.body = {
        authorId: 1,
        bookId: 2,
        isPrimary: false,
      };

      const author = { id: 1, name: "Test Author" };
      const book = { id: 2, title: "Test Book" };
      const existingAssociation = {
        author_id: 1,
        book_id: 2,
        is_primary: true,
      };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(author) // Author exists
        .mockResolvedValueOnce(book) // Book exists
        .mockResolvedValueOnce(existingAssociation); // Association already exists

      await addBookToAuthor(req as Request, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith(
        "UPDATE author_books SET is_primary = ? WHERE author_id = ? AND book_id = ?",
        [0, 1, 2]
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author-book association updated",
      });
    });

    it("should return 400 if authorId or bookId is missing", async () => {
      req.body = {
        // Missing authorId
        bookId: 2,
      };

      await addBookToAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author ID and Book ID are required",
      });
    });

    it("should return 404 if author not found", async () => {
      req.body = {
        authorId: 999,
        bookId: 2,
      };

      mockDb.get = jest.fn().mockResolvedValue(null); // Author not found

      await addBookToAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Author not found" });
    });

    it("should return 404 if book not found", async () => {
      req.body = {
        authorId: 1,
        bookId: 999,
      };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce({ id: 1 }) // Author exists
        .mockResolvedValueOnce(null); // Book not found

      await addBookToAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
    });
  });

  describe("removeBookFromAuthor", () => {
    it("should remove a book from an author successfully", async () => {
      req.params = {
        authorId: "1",
        bookId: "2",
      };

      mockDb.run = jest.fn().mockResolvedValue({ changes: 1 });

      await removeBookFromAuthor(req as Request, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith(
        "DELETE FROM author_books WHERE author_id = ? AND book_id = ?",
        ["1", "2"]
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Association removed successfully",
      });
    });

    it("should return 404 if association not found", async () => {
      req.params = {
        authorId: "1",
        bookId: "999",
      };

      mockDb.run = jest.fn().mockResolvedValue({ changes: 0 });

      await removeBookFromAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Association not found",
      });
    });
  });

  describe("getAuthorInfo", () => {
    it("should get author info from Open Library API", async () => {
      req.query = { authorName: "J.K. Rowling" };

      const mockAuthorResponse = {
        data: {
          docs: [
            {
              name: "J.K. Rowling",
              key: "/authors/OL23919A",
              birth_date: "1965-07-31",
              top_work: "Harry Potter and the Philosopher's Stone",
              work_count: 100,
              photos: [12345],
            },
          ],
        },
      };

      const mockWorksResponse = {
        data: {
          entries: [
            {
              title: "Harry Potter and the Philosopher's Stone",
              key: "/works/OL82563W",
              first_publish_year: 1997,
              covers: [9876],
            },
            {
              title: "Harry Potter and the Chamber of Secrets",
              key: "/works/OL82564W",
              first_publish_year: 1998,
              covers: [9877],
            },
          ],
        },
      };

      (axios.get as jest.Mock)
        .mockResolvedValueOnce(mockAuthorResponse) // Author search response
        .mockResolvedValueOnce(mockWorksResponse); // Works response

      await getAuthorInfo(req as Request, res as Response);

      expect(axios.get).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("openlibrary.org/search/authors.json"),
        expect.any(Object)
      );

      expect(axios.get).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("openlibrary.org/authors/OL23919A/works.json"),
        expect.any(Object)
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        author: expect.objectContaining({
          name: "J.K. Rowling",
          birthDate: "1965-07-31",
          photoUrl: expect.stringContaining("12345"),
        }),
        works: expect.arrayContaining([
          expect.objectContaining({
            title: "Harry Potter and the Philosopher's Stone",
            firstPublishYear: 1997,
          }),
        ]),
      });
    });

    it("should return 400 if author name is not provided", async () => {
      req.query = {}; // No author name

      await getAuthorInfo(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author name is required",
      });
    });

    it("should return 404 if author not found in Open Library", async () => {
      req.query = { authorName: "Nonexistent Author" };

      const mockEmptyResponse = {
        data: {
          docs: [], // No authors found
        },
      };

      (axios.get as jest.Mock).mockResolvedValue(mockEmptyResponse);

      await getAuthorInfo(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Author not found" });
    });

    it("should handle rate limiting", async () => {
      // Set up multiple requests to trigger rate limiting
      // This test assumes the rate limit is configured to 5 requests per minute
      for (let i = 0; i < 5; i++) {
        req.query = { authorName: `Test Author ${i}` };

        const mockResponse = {
          data: {
            docs: [{ name: `Test Author ${i}`, key: `/authors/OL${i}` }],
          },
        };

        (axios.get as jest.Mock).mockResolvedValue(mockResponse);

        await getAuthorInfo(req as Request, res as Response);

        // Reset the mock responses
        jest.clearAllMocks();
      }

      // This should now be rate limited
      req.query = { authorName: "One More Author" };
      await getAuthorInfo(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Rate limit exceeded. Please try again later.",
        })
      );
    });

    it("should handle API errors", async () => {
      req.query = { authorName: "Error Author" };

      const mockError = new Error("API error");
      (axios.get as jest.Mock).mockRejectedValue(mockError);

      await getAuthorInfo(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: 60,
      });
    });
  });
});
