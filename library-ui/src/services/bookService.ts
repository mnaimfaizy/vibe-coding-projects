import api from "./api";

export interface Book {
  id?: number;
  title: string;
  author: string;
  isbn: string;
  publishedDate: string;
  genre: string;
  description: string;
  coverImage?: string;
}

// Open Library search result interfaces
export interface OpenLibraryBookResult {
  title: string;
  author: string;
  publishYear?: number;
  isbn?: string;
  cover?: string;
  description?: string;
  publisher?: string;
  subjects?: string[];
  url?: string;
  firstPublishYear?: number;
  workKey?: string;
  coverId?: number;
  languages?: string[];
  publishers?: string[];
}

export interface OpenLibrarySearchResponse {
  book?: OpenLibraryBookResult;
  books?: OpenLibraryBookResult[];
  author?: string;
  total?: number;
  offset?: number;
  limit?: number;
}

const BookService = {
  // Get all books
  getAllBooks: async (): Promise<Book[]> => {
    const response = await api.get<Book[]>("/api/books");
    return response.data;
  },

  // Get book by ID
  getBookById: async (id: number): Promise<Book> => {
    const response = await api.get<Book>(`/api/books/${id}`);
    return response.data;
  },

  // Check if book exists in collection by ISBN or title+author
  checkBookExists: async (book: OpenLibraryBookResult): Promise<boolean> => {
    try {
      const allBooks = await BookService.getAllBooks();

      if (book.isbn) {
        // Check by ISBN if available
        return allBooks.some(
          (existingBook) =>
            existingBook.isbn && existingBook.isbn.trim() === book.isbn?.trim()
        );
      } else {
        // Check by title + author
        return allBooks.some(
          (existingBook) =>
            existingBook.title.toLowerCase() === book.title.toLowerCase() &&
            existingBook.author.toLowerCase() ===
              book.author.toString().toLowerCase()
        );
      }
    } catch (error) {
      console.error("Error checking if book exists:", error);
      return false;
    }
  },

  // Create new book
  createBook: async (
    bookData: Book,
    addToCollection: boolean = false
  ): Promise<Book> => {
    const response = await api.post<Book>("/api/books", {
      ...bookData,
      addToCollection,
    });
    return response.data;
  },

  // Update existing book
  updateBook: async (id: number, bookData: Partial<Book>): Promise<Book> => {
    const response = await api.put<Book>(`/api/books/${id}`, bookData);
    return response.data;
  },

  // Delete book
  deleteBook: async (id: number): Promise<void> => {
    await api.delete(`/api/books/${id}`);
  },

  // Search books
  searchBooks: async (query: string): Promise<Book[]> => {
    const response = await api.get<Book[]>(
      `/api/books/search?q=${encodeURIComponent(query)}`
    );
    return response.data;
  },

  // Search Open Library
  searchOpenLibrary: async (
    query: string,
    type: "isbn" | "title" | "author"
  ): Promise<OpenLibrarySearchResponse> => {
    const response = await api.get<OpenLibrarySearchResponse>(
      `/api/books/search/openlibrary?query=${encodeURIComponent(
        query
      )}&type=${type}`
    );
    return response.data;
  },

  // Add book from Open Library to collection
  addBookFromOpenLibrary: async (
    bookData: OpenLibraryBookResult,
    addToCollection: boolean = false
  ): Promise<Book> => {
    // Helper function to safely process potentially complex values
    const safeProcess = (value: any): string => {
      if (typeof value === "string") return value;
      if (typeof value === "number") return value.toString();
      if (value === null || value === undefined) return "";
      if (typeof value === "object") {
        // If it's an object with a name property (common in OpenLibrary API)
        if (value.name) return value.name;
        try {
          return JSON.stringify(value);
        } catch (e) {
          return "";
        }
      }
      return String(value);
    };

    // Get publish year from either publishYear or firstPublishYear
    const publishYear = bookData.publishYear || bookData.firstPublishYear;

    // Convert OpenLibraryBookResult to backend Book model format
    // Make sure this matches the backend Book model structure
    const book = {
      title: bookData.title,
      author: safeProcess(bookData.author),
      isbn: bookData.isbn || "",
      publishYear: publishYear || null, // Match the backend field name
      cover: bookData.cover || "", // Match the backend field name
      description: safeProcess(bookData.description),
      // Backend doesn't have genre or publishedDate fields
      addToCollection: addToCollection, // Include the addToCollection flag
    };

    return BookService.createBook(book as any);
  },

  // User Collection Methods

  // Get user's book collection
  getUserCollection: async (): Promise<Book[]> => {
    const response = await api.get<Book[]>("/api/books/user/collection");
    return response.data;
  },

  // Add book to user collection
  addToUserCollection: async (bookId: number): Promise<void> => {
    await api.post("/api/books/user/collection", { bookId });
  },

  // Remove book from user collection
  removeFromUserCollection: async (bookId: number): Promise<void> => {
    await api.delete(`/api/books/user/collection/${bookId}`);
  },

  // Check if a book is in user's collection
  isBookInUserCollection: async (bookId: number): Promise<boolean> => {
    try {
      const collection = await BookService.getUserCollection();
      return collection.some((book) => book.id === bookId);
    } catch (error) {
      console.error("Error checking if book is in user collection:", error);
      return false;
    }
  },
};

export default BookService;
