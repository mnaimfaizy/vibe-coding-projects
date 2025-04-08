import api from './api';

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

const BookService = {
  // Get all books
  getAllBooks: async (): Promise<Book[]> => {
    const response = await api.get<Book[]>('/api/books');
    return response.data;
  },

  // Get book by ID
  getBookById: async (id: number): Promise<Book> => {
    const response = await api.get<Book>(`/api/books/${id}`);
    return response.data;
  },

  // Create new book
  createBook: async (bookData: Book): Promise<Book> => {
    const response = await api.post<Book>('/api/books', bookData);
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
    const response = await api.get<Book[]>(`/api/books/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }
};

export default BookService;