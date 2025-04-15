import { Request, Response } from "express";
import { Database } from "sqlite";
import {
  createReview,
  deleteReview,
  getBookReviews,
  updateReview,
} from "../../controllers/reviewsController";
import { connectDatabase } from "../../db/database";

// Mock dependencies
jest.mock("../../db/database");

// Interface for request with user property
interface UserRequest extends Request {
  user?: {
    id: number;
    isAdmin?: boolean;
  };
}

describe("Reviews Controller", () => {
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
      send: jest.fn(),
    };

    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getBookReviews", () => {
    it("should get all reviews for a book", async () => {
      const bookId = "1";
      req.params = { bookId };

      const mockReviews = [
        {
          id: 1,
          bookId: 1,
          userId: 10,
          user_username: "user1",
          rating: 4,
          comment: "Great book",
          createdAt: "2023-01-01T12:00:00Z",
          updatedAt: "2023-01-01T12:00:00Z",
        },
        {
          id: 2,
          bookId: 1,
          userId: 11,
          user_username: "user2",
          rating: 5,
          comment: "Excellent read",
          createdAt: "2023-01-02T12:00:00Z",
          updatedAt: "2023-01-02T12:00:00Z",
        },
      ];

      mockDb.all = jest.fn().mockResolvedValue(mockReviews);

      await getBookReviews(req as Request, res as Response);

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining("FROM reviews"),
        [1]
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            bookId: 1,
            username: "user1",
            rating: 4,
            comment: "Great book",
          }),
          expect.objectContaining({
            id: 2,
            bookId: 1,
            username: "user2",
            rating: 5,
            comment: "Excellent read",
          }),
        ])
      );
    });

    it("should return 400 if book ID is invalid", async () => {
      req.params = { bookId: "invalid" };

      await getBookReviews(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid book ID" });
    });

    it("should handle database errors", async () => {
      req.params = { bookId: "1" };
      const mockError = new Error("Database error");
      mockDb.all = jest.fn().mockRejectedValue(mockError);

      await getBookReviews(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });
  });

  describe("createReview", () => {
    it("should create a review successfully", async () => {
      req.params = { bookId: "1" };
      req.body = {
        rating: 4,
        comment: "Great book",
        username: "testUser",
      };
      req.user = { id: 5 };

      mockDb.get = jest.fn().mockResolvedValue({ id: 1 }); // Book exists
      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({}) // BEGIN TRANSACTION
        .mockResolvedValueOnce({ lastID: 3 }) // INSERT INTO reviews
        .mockResolvedValueOnce({}); // COMMIT

      await createReview(req as UserRequest, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT id FROM books WHERE id = ?",
        [1]
      );

      expect(mockDb.run).toHaveBeenNthCalledWith(1, "BEGIN TRANSACTION");
      expect(mockDb.run).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("INSERT INTO reviews"),
        expect.arrayContaining([1, 5, "testUser", 4, "Great book"])
      );
      expect(mockDb.run).toHaveBeenNthCalledWith(3, "COMMIT");

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 3,
          bookId: 1,
          userId: 5,
          username: "testUser",
          rating: 4,
          comment: "Great book",
        })
      );
    });

    it("should create a review without user ID if not authenticated", async () => {
      req.params = { bookId: "1" };
      req.body = {
        rating: 4,
        comment: "Great book",
        username: "testUser",
      };
      // No user (not authenticated)

      mockDb.get = jest.fn().mockResolvedValue({ id: 1 }); // Book exists
      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({}) // BEGIN TRANSACTION
        .mockResolvedValueOnce({ lastID: 3 }) // INSERT INTO reviews
        .mockResolvedValueOnce({}); // COMMIT

      await createReview(req as UserRequest, res as Response);

      expect(mockDb.run).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("INSERT INTO reviews"),
        expect.arrayContaining([1, null, "testUser", 4, "Great book"])
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 3,
          bookId: 1,
          userId: undefined,
          username: "testUser",
        })
      );
    });

    it("should return 400 if book ID is invalid", async () => {
      req.params = { bookId: "invalid" };

      await createReview(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid book ID" });
    });

    it("should return 404 if book is not found", async () => {
      req.params = { bookId: "999" };
      req.body = {
        rating: 4,
        comment: "Great book",
        username: "testUser",
      };

      mockDb.get = jest.fn().mockResolvedValue(null); // Book not found
      mockDb.run = jest.fn().mockResolvedValue({});

      await createReview(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
    });

    it("should return 400 if rating is invalid", async () => {
      req.params = { bookId: "1" };
      req.body = {
        rating: 6, // Invalid rating (> 5)
        comment: "Great book",
        username: "testUser",
      };

      mockDb.get = jest.fn().mockResolvedValue({ id: 1 }); // Book exists
      mockDb.run = jest.fn().mockResolvedValue({});

      await createReview(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Rating must be between 1 and 5",
      });
      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
    });

    it("should return 400 if comment is empty", async () => {
      req.params = { bookId: "1" };
      req.body = {
        rating: 4,
        comment: "", // Empty comment
        username: "testUser",
      };

      mockDb.get = jest.fn().mockResolvedValue({ id: 1 }); // Book exists
      mockDb.run = jest.fn().mockResolvedValue({});

      await createReview(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Review comment is required",
      });
      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
    });

    it("should return 400 if username is empty", async () => {
      req.params = { bookId: "1" };
      req.body = {
        rating: 4,
        comment: "Great book",
        username: "", // Empty username
      };

      mockDb.get = jest.fn().mockResolvedValue({ id: 1 }); // Book exists
      mockDb.run = jest.fn().mockResolvedValue({});

      await createReview(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Username is required",
      });
      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
    });

    it("should handle database errors", async () => {
      req.params = { bookId: "1" };
      req.body = {
        rating: 4,
        comment: "Great book",
        username: "testUser",
      };

      const mockError = new Error("Database error");
      mockDb.get = jest.fn().mockResolvedValue({ id: 1 }); // Book exists
      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({}) // BEGIN TRANSACTION
        .mockRejectedValueOnce(mockError); // Error during INSERT

      await createReview(req as UserRequest, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });
  });

  describe("updateReview", () => {
    it("should update a review successfully", async () => {
      req.params = { reviewId: "1" };
      req.body = {
        rating: 5,
        comment: "Updated comment",
      };
      req.user = { id: 10 }; // The user who created the review

      const existingReview = {
        id: 1,
        bookId: 1,
        userId: 10, // Same as the requesting user
        username: "testUser",
        rating: 4,
        comment: "Original comment",
      };

      const updatedReview = {
        ...existingReview,
        rating: 5,
        comment: "Updated comment",
      };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(existingReview) // Review exists
        .mockResolvedValueOnce(updatedReview); // Return updated review

      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({}) // BEGIN TRANSACTION
        .mockResolvedValueOnce({}) // UPDATE reviews
        .mockResolvedValueOnce({}); // COMMIT

      await updateReview(req as UserRequest, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM reviews WHERE id = ?",
        [1]
      );

      expect(mockDb.run).toHaveBeenNthCalledWith(1, "BEGIN TRANSACTION");
      expect(mockDb.run).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("UPDATE reviews SET"),
        expect.arrayContaining([5, "Updated comment"])
      );
      expect(mockDb.run).toHaveBeenNthCalledWith(3, "COMMIT");

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedReview);
    });

    it("should allow admin to update any review", async () => {
      req.params = { reviewId: "1" };
      req.body = {
        rating: 3,
        comment: "Admin edited",
      };
      req.user = { id: 99, isAdmin: true }; // Admin user

      const existingReview = {
        id: 1,
        bookId: 1,
        userId: 10, // Different from the requesting user
        username: "testUser",
        rating: 4,
        comment: "Original comment",
      };

      const updatedReview = {
        ...existingReview,
        rating: 3,
        comment: "Admin edited",
      };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(existingReview) // Review exists
        .mockResolvedValueOnce(updatedReview); // Return updated review

      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({}) // BEGIN TRANSACTION
        .mockResolvedValueOnce({}) // UPDATE reviews
        .mockResolvedValueOnce({}); // COMMIT

      await updateReview(req as UserRequest, res as Response);

      expect(mockDb.run).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("UPDATE reviews SET"),
        expect.arrayContaining([3, "Admin edited"])
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedReview);
    });

    it("should return 400 if review ID is invalid", async () => {
      req.params = { reviewId: "invalid" };

      await updateReview(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid review ID" });
    });

    it("should return 404 if review is not found", async () => {
      req.params = { reviewId: "999" };
      req.body = {
        rating: 5,
        comment: "Updated comment",
      };

      mockDb.get = jest.fn().mockResolvedValue(null); // Review not found
      mockDb.run = jest.fn().mockResolvedValue({});

      await updateReview(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Review not found" });
      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
    });

    it("should return 403 if user is not authorized", async () => {
      req.params = { reviewId: "1" };
      req.body = {
        rating: 5,
        comment: "Updated comment",
      };
      req.user = { id: 20 }; // Different user than the review creator

      const existingReview = {
        id: 1,
        bookId: 1,
        userId: 10, // Different from the requesting user
        username: "testUser",
        rating: 4,
        comment: "Original comment",
      };

      mockDb.get = jest.fn().mockResolvedValue(existingReview);
      mockDb.run = jest.fn().mockResolvedValue({});

      await updateReview(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "You don't have permission to update this review",
      });
      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
    });

    it("should return 400 if rating is invalid", async () => {
      req.params = { reviewId: "1" };
      req.body = {
        rating: 0, // Invalid rating (< 1)
        comment: "Updated comment",
      };
      req.user = { id: 10 }; // Same as the review creator

      const existingReview = {
        id: 1,
        bookId: 1,
        userId: 10,
        username: "testUser",
        rating: 4,
        comment: "Original comment",
      };

      mockDb.get = jest.fn().mockResolvedValue(existingReview);
      mockDb.run = jest.fn().mockResolvedValue({});

      await updateReview(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Rating must be between 1 and 5",
      });
      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
    });

    it("should return 400 if comment is empty", async () => {
      req.params = { reviewId: "1" };
      req.body = {
        comment: "", // Empty comment
      };
      req.user = { id: 10 }; // Same as the review creator

      const existingReview = {
        id: 1,
        bookId: 1,
        userId: 10,
        username: "testUser",
        rating: 4,
        comment: "Original comment",
      };

      mockDb.get = jest.fn().mockResolvedValue(existingReview);
      mockDb.run = jest.fn().mockResolvedValue({});

      await updateReview(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Review comment cannot be empty",
      });
      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
    });

    it("should return 400 if no fields to update", async () => {
      req.params = { reviewId: "1" };
      req.body = {}; // No fields to update
      req.user = { id: 10 };

      const existingReview = {
        id: 1,
        bookId: 1,
        userId: 10,
        username: "testUser",
        rating: 4,
        comment: "Original comment",
      };

      mockDb.get = jest.fn().mockResolvedValue(existingReview);
      mockDb.run = jest.fn().mockResolvedValue({});

      await updateReview(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "No valid fields to update",
      });
      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
    });

    it("should handle database errors", async () => {
      req.params = { reviewId: "1" };
      req.body = {
        rating: 5,
        comment: "Updated comment",
      };
      req.user = { id: 10 };

      const existingReview = {
        id: 1,
        bookId: 1,
        userId: 10,
        username: "testUser",
        rating: 4,
        comment: "Original comment",
      };

      const mockError = new Error("Database error");

      mockDb.get = jest.fn().mockResolvedValue(existingReview);
      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({}) // BEGIN TRANSACTION
        .mockRejectedValueOnce(mockError); // Error during UPDATE

      await updateReview(req as UserRequest, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });
  });

  describe("deleteReview", () => {
    it("should delete a review successfully", async () => {
      req.params = { reviewId: "1" };
      req.user = { id: 10 }; // The user who created the review

      const existingReview = {
        id: 1,
        bookId: 1,
        userId: 10, // Same as the requesting user
        username: "testUser",
        rating: 4,
        comment: "Comment to delete",
      };

      mockDb.get = jest.fn().mockResolvedValue(existingReview);
      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({}) // BEGIN TRANSACTION
        .mockResolvedValueOnce({}) // DELETE FROM reviews
        .mockResolvedValueOnce({}); // COMMIT

      await deleteReview(req as UserRequest, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM reviews WHERE id = ?",
        [1]
      );

      expect(mockDb.run).toHaveBeenNthCalledWith(1, "BEGIN TRANSACTION");
      expect(mockDb.run).toHaveBeenNthCalledWith(
        2,
        "DELETE FROM reviews WHERE id = ?",
        [1]
      );
      expect(mockDb.run).toHaveBeenNthCalledWith(3, "COMMIT");

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("should allow admin to delete any review", async () => {
      req.params = { reviewId: "1" };
      req.user = { id: 99, isAdmin: true }; // Admin user

      const existingReview = {
        id: 1,
        bookId: 1,
        userId: 10, // Different from the requesting user
        username: "testUser",
        rating: 4,
        comment: "Comment to delete",
      };

      mockDb.get = jest.fn().mockResolvedValue(existingReview);
      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({}) // BEGIN TRANSACTION
        .mockResolvedValueOnce({}) // DELETE FROM reviews
        .mockResolvedValueOnce({}); // COMMIT

      await deleteReview(req as UserRequest, res as Response);

      expect(mockDb.run).toHaveBeenNthCalledWith(
        2,
        "DELETE FROM reviews WHERE id = ?",
        [1]
      );

      expect(res.status).toHaveBeenCalledWith(204);
    });

    it("should return 400 if review ID is invalid", async () => {
      req.params = { reviewId: "invalid" };

      await deleteReview(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid review ID" });
    });

    it("should return 404 if review is not found", async () => {
      req.params = { reviewId: "999" };
      req.user = { id: 10 };

      mockDb.get = jest.fn().mockResolvedValue(null); // Review not found
      mockDb.run = jest.fn().mockResolvedValue({});

      await deleteReview(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Review not found" });
      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
    });

    it("should return 403 if user is not authorized", async () => {
      req.params = { reviewId: "1" };
      req.user = { id: 20 }; // Different user than the review creator

      const existingReview = {
        id: 1,
        bookId: 1,
        userId: 10, // Different from the requesting user
        username: "testUser",
        rating: 4,
        comment: "Comment to delete",
      };

      mockDb.get = jest.fn().mockResolvedValue(existingReview);
      mockDb.run = jest.fn().mockResolvedValue({});

      await deleteReview(req as UserRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "You don't have permission to delete this review",
      });
      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
    });

    it("should handle database errors", async () => {
      req.params = { reviewId: "1" };
      req.user = { id: 10 };

      const existingReview = {
        id: 1,
        bookId: 1,
        userId: 10,
        username: "testUser",
        rating: 4,
        comment: "Comment to delete",
      };

      const mockError = new Error("Database error");

      mockDb.get = jest.fn().mockResolvedValue(existingReview);
      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({}) // BEGIN TRANSACTION
        .mockRejectedValueOnce(mockError); // Error during DELETE

      await deleteReview(req as UserRequest, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });
  });
});
